import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronRight, Check, ChevronLeft, MapPin, Gauge, Clock, Weight, Maximize, Mountain, Plane, Ruler, MoveUp, Loader2 } from "lucide-react";
import { productCategories } from "@/data/products";
import { useGetProduct, useListProducts } from "@workspace/api-client-react";
import { productImageUrl } from "@/pages/admin/ProductEditorFields";

const primary = "#F47E20";
const orange = "#F47E20";
const navy = "#0B203D";
const blue = "#138808";

export function ProductsPage() {
  const { data: products = [], isLoading, error } = useListProducts();
  useEffect(() => {
    document.title = "UAS Platforms | ASP Aero Tech";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Explore our complete range of mission-configurable unmanned aerial systems.");
    }
  }, []);

  const [activeCategory, setActiveCategory] = useState<string>("Surveillance");
  
  const filteredProducts = products.filter(p => p.categories.includes(activeCategory));

  return (
    <>
      <section className="relative overflow-hidden bg-[#0B203D]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(120deg, transparent 0%, rgba(212,146,12,.45) 100%)" }} />
        <div className="relative mx-auto grid max-w-[1440px] gap-8 px-5 py-12 sm:px-8 md:py-16 lg:py-20">
          <div className="max-w-3xl">
            <span className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em]" style={{ color: primary }}>
              <span className="h-0.5 w-7" style={{ backgroundColor: primary }} /> Portfolio
            </span>
            <h1 className="text-4xl font-black leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              Aircraft engineered for <span style={{ color: primary }}>your mission.</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">
              ASP Aero Tech develops configurable UAS platforms spanning persistent ISR, tactical awareness, industrial inspection, and autonomous field operations. Select a mission profile below to view capable platforms.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#FAFAF8] border-b border-gray-100 sticky top-[76px] z-30">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
          <div className="flex gap-4 overflow-x-auto py-3 scrollbar-hide">
            {productCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 text-sm font-bold transition-colors rounded-lg border ${
                  activeCategory === cat 
                    ? "bg-[#F47E20] text-white border-[#F47E20]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#F47E20] hover:text-[#F47E20]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-[#0B203D]">
              {activeCategory} Platforms
            </h2>
            <p className="mt-2 text-gray-600 text-sm">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? "system" : "systems"} capable of {activeCategory.toLowerCase()} missions.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading && (
              <div className="col-span-full flex items-center justify-center py-16 text-[#F47E20]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            {error && (
              <div className="col-span-full rounded-xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-700">
                The product catalog is temporarily unavailable. Please try again shortly.
              </div>
            )}
            {!isLoading && !error && filteredProducts.length === 0 && (
              <div className="col-span-full rounded-xl border border-gray-100 bg-gray-50 p-10 text-center text-gray-500">
                No published platforms are currently assigned to this mission profile.
              </div>
            )}
            {filteredProducts.map(product => (
              <Link 
                key={product.slug} 
                href={`/products/${product.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img 
                    src={productImageUrl(product.image)}
                    alt={product.name} 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B203D]/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute bottom-4 left-4 flex gap-2 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    <span className="inline-flex items-center gap-1 rounded bg-white/20 backdrop-blur-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      View specifications <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-black text-[#0B203D]">{product.name}</h3>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                  
                  <div className="mt-6 flex flex-wrap gap-2">
                    {product.specs.range && (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600">
                        <MapPin size={13} style={{ color: primary }} /> {product.specs.range} Range
                      </span>
                    )}
                    {product.specs.endurance && (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600">
                        <Clock size={13} style={{ color: primary }} /> {product.specs.endurance} Flight
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F6F1E8] py-16">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-6 px-5 sm:px-8 md:flex-row md:items-center">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: orange }}>Need a custom configuration?</span>
            <h2 className="mt-2 text-3xl font-black text-[#0B203D]">Define the operating envelope with our engineers.</h2>
            <p className="mt-2 text-sm text-gray-600">Share the mission, payload, range, endurance, and deployment conditions to identify the right system architecture.</p>
          </div>
          <Link href="/contact" className="inline-flex shrink-0 items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5" style={{ backgroundColor: orange }}>
            Request a briefing <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </>
  );
}

export function ProductDetailPage({ slug }: { slug: string }) {
  const { data: product, isLoading } = useGetProduct(slug);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | ASP Aero Tech`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute("content", product.description);
      }
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white text-[#F47E20]">
        <Loader2 className="h-9 w-9 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-white px-5 text-center">
        <h1 className="text-3xl font-black text-[#0B203D]">Platform not found</h1>
        <p className="mt-4 text-gray-500">The requested UAS platform could not be located.</p>
        <Link href="/products" className="mt-6 inline-flex items-center gap-2 font-bold" style={{ color: primary }}>
          <ChevronLeft size={16} /> Return to portfolio
        </Link>
      </div>
    );
  }

  const specIcons = {
    range: <MapPin size={18} style={{ color: primary }} />,
    endurance: <Clock size={18} style={{ color: primary }} />,
    payload: <Weight size={18} style={{ color: primary }} />,
    frameSize: <Maximize size={18} style={{ color: primary }} />,
    span: <Ruler size={18} style={{ color: primary }} />,
    wingSpan: <Plane size={18} style={{ color: primary }} />,
    maxSpeed: <Gauge size={18} style={{ color: primary }} />,
    altitude: <Mountain size={18} style={{ color: primary }} />,
    agl: <MoveUp size={18} style={{ color: primary }} />,
  };

  const specLabels = {
    range: "Range",
    endurance: "Endurance",
    payload: "Payload",
    frameSize: "Frame Size",
    span: "Span",
    wingSpan: "Wing Span",
    maxSpeed: "Max Speed",
    altitude: "Altitude",
    agl: "AGL",
  };

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-[#FAFAF8]">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-5 py-4 sm:px-8 text-xs font-semibold text-gray-500">
          <Link href="/products" className="hover:text-[#F47E20] transition-colors flex items-center gap-1">
            <ChevronLeft size={14} /> Platforms
          </Link>
          <span>/</span>
          <span className="text-[#0B203D]">{product.name}</span>
        </div>
      </div>

      <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
          {/* Left: Image & Features */}
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-lg">
              <img 
                src={productImageUrl(product.image)}
                alt={product.name}
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-[#0B203D]/90 backdrop-blur border-t border-white/10">
                <div className="flex divide-x divide-white/10 text-center">
                  {product.features.map(feature => (
                    <div key={feature} className="flex-1 py-3 px-2 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white">
                      <Check size={14} style={{ color: primary }} /> {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2 py-1">Mission Profiles:</span>
              {product.categories.map(cat => (
                <span key={cat} className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-600">
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Info & Specs */}
          <div>
            <span className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em]" style={{ color: primary }}>
              <span className="h-0.5 w-6" style={{ backgroundColor: primary }} /> Platform Detail
            </span>
            <h1 className="text-4xl font-black text-[#0B203D] sm:text-5xl">{product.name}</h1>
            <p className="mt-5 text-base leading-relaxed text-gray-600">{product.description}</p>
            
            <div className="mt-8 rounded-2xl border border-gray-100 bg-[#FAFAF8] p-6 shadow-sm">
              <h2 className="mb-5 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em]" style={{ color: blue }}>
                Technical Specifications
              </h2>
              
              <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                {Object.entries(product.specs).map(([key, value]) => {
                  if (!value) return null;
                  const specKey = key as keyof typeof specIcons;
                  return (
                    <div key={key} className="flex items-start gap-4">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${primary}15` }}>
                        {specIcons[specKey]}
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          {specLabels[specKey]}
                        </div>
                        <div className="mt-1 font-bold text-[#0B203D]">{value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg" style={{ backgroundColor: primary }}>
                Request technical briefing <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
