import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/** PMREMGenerator internals used to pre-compile its shaders (three r150+). */
type PmremInternals = {
  _setSize?: (cubeSize: number) => void;
  _allocateTargets?: () => THREE.WebGLRenderTarget;
  _blurMaterial?: THREE.Material | null;
  _ggxMaterial?: THREE.Material | null;
};

/**
 * Neutral studio environment (RoomEnvironment → PMREM) for PBR reflections,
 * built without blocking the main thread.
 *
 * A plain `pmrem.fromScene()` compiles and links its shaders synchronously —
 * measured at ~0.9 s of main-thread blocking on an Intel iGPU (ANGLE/D3D11).
 * Here every program PMREM will use is compiled first with
 * `renderer.compileAsync` (KHR_parallel_shader_compile), while the output
 * target is bound so program keys match (linear output, no tone mapping);
 * only the cheap GPU passes then run synchronously.
 *
 * The private-API warm-up is feature-checked: if three's internals change,
 * this silently falls back to the plain (blocking) path.
 */
export async function createStudioEnvironment(gl: THREE.WebGLRenderer, size = 128): Promise<THREE.Texture> {
  const pmrem = new THREE.PMREMGenerator(gl);
  const room = new RoomEnvironment();
  try {
    await warmUp(gl, pmrem, room, size);
    return pmrem.fromScene(room, 0.04, 0.1, 100, { size }).texture;
  } finally {
    pmrem.dispose();
    room.traverse((o) => {
      const mesh = o as THREE.Mesh;
      mesh.geometry?.dispose();
      (mesh.material as THREE.Material | undefined)?.dispose?.();
    });
  }
}

async function warmUp(gl: THREE.WebGLRenderer, pmrem: THREE.PMREMGenerator, room: THREE.Scene, size: number) {
  const p = pmrem as unknown as PmremInternals;
  if (typeof p._setSize !== "function" || typeof p._allocateTargets !== "function") return;

  p._setSize(size);
  const target = p._allocateTargets(); // also creates the blur + GGX materials
  // Program keys include geometry traits (e.g. `hasPositionAttribute`), so the
  // stand-in meshes must match PMREM's own: position-only planes for the
  // filter passes, a box for the background. (An empty BufferGeometry — what
  // three's own _compileMaterial uses — compiles a different variant.)
  const geometry = new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(9), 3));
  const box = new THREE.BoxGeometry();
  const background = new THREE.MeshBasicMaterial({ side: THREE.BackSide, depthWrite: false, depthTest: false });
  const passes = new THREE.Scene();
  for (const material of [p._blurMaterial, p._ggxMaterial]) {
    if (material) passes.add(new THREE.Mesh(geometry, material));
  }
  passes.add(new THREE.Mesh(box, background));
  const camera = new THREE.PerspectiveCamera(90, 1, 0.1, 100);

  // compileAsync creates programs synchronously (with the current render state), then resolves when linked.
  const previous = gl.getRenderTarget();
  gl.setRenderTarget(target);
  let jobs: Promise<unknown>[];
  try {
    jobs = [gl.compileAsync(room, camera), gl.compileAsync(passes, camera)];
  } finally {
    gl.setRenderTarget(previous);
  }
  try {
    await Promise.all(jobs);
  } finally {
    target.dispose();
    geometry.dispose();
    box.dispose();
    background.dispose();
  }
}
