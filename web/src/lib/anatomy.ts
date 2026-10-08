import type { Object3D } from "three";
import type { AnatomyKey } from "@/content/highlights";

/**
 * Bridge between the exploded-view anchors inside the 3D scene and a plain
 * DOM label layer rendered outside the canvas. The scene projects each anchor
 * to screen space every frame and moves the matching label — one DOM layer,
 * no per-label React roots.
 */
export const anatomyAnchors = new Map<AnatomyKey, Object3D>();
export const anatomyLayer: { current: HTMLDivElement | null } = { current: null };
