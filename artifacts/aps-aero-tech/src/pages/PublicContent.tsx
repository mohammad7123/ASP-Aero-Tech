import { useEffect } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  MapPin,
  Newspaper,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import {
  getGetPublishedBlogPostQueryKey,
  getListOpenJobsQueryKey,
  getListPublishedBlogPostsQueryKey,
  useGetPublishedBlogPost,
  useListOpenJobs,
  useListPublishedBlogPosts,
} from "@workspace/api-client-react";

const primary = "#F47E20";
const orange = "#F47E20";

function usePageMetadata(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previous = meta?.content;
    if (meta) meta.content = description;
    return () => {
      if (meta && previous !== undefined) meta.content = previous;
    };
  }, [description, title]);
}

function ContentHero({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <section className="relative overflow-hidden bg-[#0B203D]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(212,146,12,.25),transparent_30%),linear-gradient(120deg,#0B203D,#252C51)]" />
      <div className="relative mx-auto max-w-[1440px] px-5 py-16 sm:px-8 md:py-24">
        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[#F47E20]">
          <span className="h-0.5 w-7 bg-[#F47E20]" /> {eyebrow}
        </span>
        <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">{text}</p>
      </div>
    </section>
  );
}

function LoadingCards() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-label="Loading content">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-64 animate-pulse rounded-2xl bg-gray-100" />
      ))}
    </div>
  );
}

export function CareersPage() {
  const { data: jobs, isLoading, error } = useListOpenJobs({
    query: { queryKey: getListOpenJobsQueryKey(), staleTime: 30_000, refetchOnMount: "always" },
  });
  usePageMetadata(
    "Careers | ASP Aero Tech",
    "Explore career opportunities in drone engineering, manufacturing, avionics, autonomy, testing, and field operations at ASP Aero Tech.",
  );

  return (
    <>
      <ContentHero
        eyebrow="Careers at ASP Aero Tech"
        title="Build aircraft that matter in the real world."
        text="Join a multidisciplinary team working across aerostructures, avionics, autonomy, manufacturing, flight testing, and mission operations."
      />
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <div className="mb-10 grid gap-5 sm:grid-cols-3">
            {[
              [BriefcaseBusiness, "Mission-led work", "Build systems around real operational requirements."],
              [Users, "One engineering team", "Collaborate across hardware, software, flight, and manufacturing."],
              [MapPin, "Made in India", "Strengthen indigenous unmanned aerial capability."],
            ].map(([Icon, title, text]) => (
              <div key={String(title)} className="rounded-2xl bg-[#FAFAF8] p-6">
                <Icon className="text-[#F47E20]" size={22} />
                <h2 className="mt-4 font-bold text-[#0B203D]">{String(title)}</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{String(text)}</p>
              </div>
            ))}
          </div>

          <div className="mb-8">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#F47E20]">Open roles</span>
            <h2 className="mt-3 text-3xl font-black text-[#0B203D] sm:text-4xl">Find your next mission.</h2>
          </div>

          {isLoading ? (
            <LoadingCards />
          ) : error ? (
            <p className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
              Career opportunities could not be loaded. Please try again shortly.
            </p>
          ) : jobs?.length ? (
            <div className="space-y-4">
              {jobs.map((job) => (
                <article
                  key={job.id}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
                  data-testid={`card-job-${job.id}`}
                >
                  <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                        <span>{job.department}</span><span aria-hidden>•</span><span>{job.type}</span>
                      </div>
                      <h3 className="mt-3 text-2xl font-black text-[#0B203D]">{job.title}</h3>
                      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600">{job.description}</p>
                      {job.requirements && (
                        <details className="mt-5">
                          <summary className="cursor-pointer text-sm font-bold text-[#F47E20]">View requirements</summary>
                          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">{job.requirements}</p>
                        </details>
                      )}
                    </div>
                    <div className="shrink-0 md:text-right">
                      <span className="flex items-center gap-2 text-sm text-gray-500 md:justify-end">
                        <MapPin size={15} /> {job.location}
                      </span>
                      {job.salaryRange && <p className="mt-2 text-sm font-semibold text-gray-600">{job.salaryRange}</p>}
                      <Link
                        href="/contact"
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#F47E20] px-5 py-3 text-sm font-bold text-white"
                        data-testid={`link-apply-job-${job.id}`}
                      >
                        Apply for this role <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-[#FAFAF8] px-6 py-14 text-center">
              <BriefcaseBusiness className="mx-auto text-[#F47E20]" size={34} />
              <h3 className="mt-5 text-xl font-black text-[#0B203D]">No open roles right now.</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-gray-500">
                New opportunities will appear here when published by our team. You can still introduce yourself for future roles.
              </p>
              <Link href="/contact" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#F47E20]">
                Contact our team <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function BlogPage() {
  const { data: posts, isLoading, error } = useListPublishedBlogPosts({
    query: { queryKey: getListPublishedBlogPostsQueryKey(), staleTime: 30_000, refetchOnMount: "always" },
  });
  usePageMetadata(
    "Insights | ASP Aero Tech",
    "Read ASP Aero Tech insights on unmanned aircraft engineering, drone applications, flight testing, autonomy, and mission operations.",
  );

  return (
    <>
      <ContentHero
        eyebrow="Insights"
        title="Engineering notes from the field."
        text="Perspectives on unmanned aircraft design, mission integration, manufacturing, testing, and operational deployment."
      />
      <section className="bg-[#FAFAF8] py-16 sm:py-20">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          {isLoading ? (
            <LoadingCards />
          ) : error ? (
            <p className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
              Articles could not be loaded. Please try again shortly.
            </p>
          ) : posts?.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article key={post.id} className="overflow-hidden rounded-2xl bg-white shadow-sm" data-testid={`card-blog-${post.id}`}>
                  {post.featuredImage ? (
                    <img src={post.featuredImage} alt="" className="h-52 w-full object-cover" />
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-[#0B203D]">
                      <Newspaper className="text-[#F47E20]" size={38} />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      {post.category && <span>{post.category}</span>}
                      {post.publishedAt && (
                        <span className="flex items-center gap-1">
                          <CalendarDays size={12} /> {new Date(post.publishedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-3 text-xl font-black leading-snug text-[#0B203D]">{post.title}</h2>
                    {post.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-500">{post.excerpt}</p>}
                    <Link href={`/blog/${post.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#F47E20]">
                      Read article <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
              <Newspaper className="mx-auto text-[#F47E20]" size={38} />
              <h2 className="mt-5 text-2xl font-black text-[#0B203D]">Insights are preparing for take-off.</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-500">
                Published articles will appear here automatically when released through the ASP Aero Tech admin panel.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function BlogDetailPage({ slug }: { slug: string }) {
  const { data: post, isLoading, error } = useGetPublishedBlogPost(slug, {
    query: {
      enabled: Boolean(slug),
      queryKey: getGetPublishedBlogPostQueryKey(slug),
      staleTime: 30_000,
    },
  });

  usePageMetadata(
    post?.metaTitle || post?.title || "Article | ASP Aero Tech",
    post?.metaDescription || post?.excerpt || "ASP Aero Tech engineering insight.",
  );

  if (isLoading) {
    return <section className="mx-auto min-h-[60vh] max-w-4xl px-5 py-20 sm:px-8"><LoadingCards /></section>;
  }

  if (error || !post) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-5 py-20 text-center sm:px-8">
        <Newspaper size={38} color={primary} />
        <h1 className="mt-5 text-3xl font-black text-[#0B203D]">Article not found.</h1>
        <p className="mt-3 text-gray-500">This article may be unpublished or no longer available.</p>
        <Link href="/blog" className="mt-7 inline-flex items-center gap-2 font-bold" style={{ color: orange }}>
          Return to insights <ArrowRight size={15} />
        </Link>
      </section>
    );
  }

  return (
    <article>
      <section className="bg-[#0B203D]">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 md:py-24">
          <div className="flex flex-wrap gap-3 text-xs font-bold uppercase tracking-wider text-white/50">
            {post.category && <span>{post.category}</span>}
            {post.publishedAt && (
              <span className="flex items-center gap-1.5"><Clock3 size={13} /> {new Date(post.publishedAt).toLocaleDateString("en-IN", { dateStyle: "long" })}</span>
            )}
          </div>
          <h1 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">{post.title}</h1>
          {post.excerpt && <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/65">{post.excerpt}</p>}
        </div>
      </section>
      {post.featuredImage && <img src={post.featuredImage} alt="" className="mx-auto max-h-[560px] w-full max-w-[1440px] object-cover" />}
      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="space-y-5 text-base leading-8 text-gray-700">
            {post.content.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
          <div className="mt-12 border-t border-gray-100 pt-8">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-[#F47E20]">
              View all insights <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}