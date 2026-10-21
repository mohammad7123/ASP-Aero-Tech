import { FlightExperience, WorldStage } from "@/components/home/Flight";
import { BorderWatch } from "@/components/home/BorderWatch";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import {
  AboutWaypoint,
  AnatomyWaypoint,
  AssuranceStrip,
  ControlWaypoint,
  CtaSection,
  HeroSection,
  IndustriesSection,
  InsightsTeaser,
  ServicesSection,
  StatsSection,
  ValuesSection,
} from "@/components/home/Sections";
import { getBlogPosts, getProducts } from "@/lib/api";

// Re-fetch admin-managed content (products, posts) at most every 5 minutes.
export const revalidate = 300;

export default async function HomePage() {
  const [products, posts] = await Promise.all([getProducts(), getBlogPosts()]);

  return (
    <>
      {/* Fixed 3D world (or static backdrop) behind the flight sections */}
      <WorldStage />

      <div className="relative z-10">
        {/* Hero + scroll-driven flight: each section is a waypoint on the drone's route */}
        <FlightExperience>
          <HeroSection />
          <AboutWaypoint />
          <AnatomyWaypoint />
          <ControlWaypoint />
        </FlightExperience>

        <AssuranceStrip />
        <ProductShowcase products={products} />
        <ServicesSection />
        <StatsSection productCount={products.length} />
        <IndustriesSection products={products} />
        <BorderWatch />
        <ValuesSection />
        <InsightsTeaser posts={posts} />
        <CtaSection />
      </div>
    </>
  );
}
