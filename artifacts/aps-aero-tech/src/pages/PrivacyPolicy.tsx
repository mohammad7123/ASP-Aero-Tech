import { useEffect } from "react";
import { Link } from "wouter";
import { ShieldCheck, Cookie, Settings, Server } from "lucide-react";

export function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = "Privacy & Cookie Policy | ASP Aero Tech";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Read ASP Aero Tech's Privacy & Cookie Policy explaining how we manage cookies, local storage, and your personal data."
      );
    }
  }, []);

  const openCookieSettings = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new Event("open-cookie-settings"));
  };

  return (
    <>
      <section className="relative overflow-hidden bg-[#0B203D]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(120deg, transparent 0%, rgba(212,146,12,.45) 100%)" }} />
        <div className="relative mx-auto max-w-[1440px] px-5 py-12 sm:px-8 md:py-16 lg:py-20">
          <div className="max-w-3xl">
            <span className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[#F47E20]">
              <span className="h-0.5 w-7 bg-[#F47E20]" /> Legal
            </span>
            <h1 className="text-4xl font-black leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              Privacy & Cookie Policy
            </h1>
            <p className="mt-6 text-base leading-relaxed text-white/70 sm:text-lg">
              ASP Aero Tech respects your privacy. This policy explains how we collect data, manage cookies, and respect your preferences.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="space-y-12">
            
            <section>
              <h2 className="flex items-center gap-2 text-2xl font-black text-[#0B203D]">
                <ShieldCheck className="text-[#F47E20]" size={24} /> Data Collection
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-600">
                We collect information when you submit forms, contact us for technical briefings, or interact with our platform. This data is used exclusively to respond to your inquiries, provide support, and improve our unmanned aerial systems and services. We do not sell your personal data to third parties.
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-2xl font-black text-[#0B203D]">
                <Cookie className="text-[#F47E20]" size={24} /> How We Use Cookies
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-600">
                Cookies and similar technologies (like Local Storage) allow us to store your preferences and understand how visitors interact with our site. We categorize these technologies as follows:
              </p>
              
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-[#FAFAF8] p-5">
                  <h3 className="text-sm font-bold text-[#0B203D]">Essential</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    Necessary for core website functionality and saving your consent choices. These cannot be disabled.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-[#FAFAF8] p-5">
                  <h3 className="text-sm font-bold text-[#0B203D]">Functional</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    Allows the site to remember choices you make, such as language settings or custom preferences.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-[#FAFAF8] p-5">
                  <h3 className="text-sm font-bold text-[#0B203D]">Analytics</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    Helps us analyze visitor behavior to improve website performance and user experience.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-[#FAFAF8] p-5">
                  <h3 className="text-sm font-bold text-[#0B203D]">Marketing</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    Used to deliver relevant advertisements. ASP Aero Tech does not currently utilize third-party marketing trackers.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-2xl font-black text-[#0B203D]">
                <Server className="text-[#F47E20]" size={24} /> Local Storage of Consent
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-600">
                To respect your preferences without unnecessarily tracking you, we store your consent choices securely in your browser's Local Storage (under the key <code className="rounded bg-gray-100 px-1 py-0.5 text-sm text-[#F47E20]">asp_cookie_consent</code>). This ensures you are not repeatedly asked for permission on subsequent visits. 
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-2xl font-black text-[#0B203D]">
                <Settings className="text-[#F47E20]" size={24} /> Managing Your Preferences
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-600">
                You retain full control over your data and cookies. You can update or withdraw your consent at any time.
              </p>
              <button 
                onClick={openCookieSettings}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#F47E20] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#d66a15]"
              >
                Manage Cookie Preferences
              </button>
            </section>

          </div>
        </div>
      </section>
    </>
  );
}