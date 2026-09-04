import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";

export type CookiePreferences = {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

const defaultPreferences: CookiePreferences = {
  essential: true,
  functional: false,
  analytics: false,
  marketing: false,
};

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const saved = localStorage.getItem("asp_cookie_consent");
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (e) {
        // invalid JSON
      }
    } else {
      setShowBanner(true);
    }

    const handleOpenDialog = () => setShowDialog(true);
    window.addEventListener("open-cookie-settings", handleOpenDialog);
    return () => window.removeEventListener("open-cookie-settings", handleOpenDialog);
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem("asp_cookie_consent", JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowDialog(false);
  };

  const handleAcceptAll = () => {
    savePreferences({ essential: true, functional: true, analytics: true, marketing: true });
  };

  const handleEssentialOnly = () => {
    savePreferences({ essential: true, functional: false, analytics: false, marketing: false });
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
  };

  if (!showBanner && !showDialog) return null;

  return (
    <>
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] sm:p-6" data-testid="cookie-banner">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="flex-1">
              <h2 className="text-sm font-bold text-[#0B203D]">Cookie & Privacy Consent</h2>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                We use cookies and similar technologies on our website. Some are essential for the site to function, while others help us improve your experience and measure performance. You can accept all, accept only essential cookies, or customise your preferences. You may withdraw consent at any time.{" "}
                <Link href="/privacy-policy" className="font-semibold text-[#F47E20] hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <button
                onClick={handleAcceptAll}
                className="rounded-lg bg-[#F47E20] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#d66a15]"
                data-testid="button-accept-all"
              >
                Accept all
              </button>
              <button
                onClick={handleEssentialOnly}
                className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-100"
                data-testid="button-essential-only"
              >
                Essential only
              </button>
              <button
                onClick={() => setShowDialog(true)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50"
                data-testid="button-manage-prefs"
              >
                Manage preferences
              </button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-[#0B203D]">Cookie Preferences</DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-relaxed text-gray-600">
              Manage how we use cookies on your device. You can update these preferences at any time via the footer link.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-[#0B203D]">Essential Cookies</h4>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  Required for the website to function correctly (e.g., saving these preferences). Cannot be disabled.
                </p>
              </div>
              <Switch checked={true} disabled />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-[#0B203D]">Functional Cookies</h4>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  Enable advanced features and personalization, such as remembering your language or region.
                </p>
              </div>
              <Switch
                checked={preferences.functional}
                onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, functional: checked }))}
              />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-[#0B203D]">Analytics Cookies</h4>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  Help us understand how visitors interact with the website by collecting and reporting information anonymously.
                </p>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, analytics: checked }))}
              />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-[#0B203D]">Marketing Cookies</h4>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  Used to track visitors across websites to display relevant advertisements. We do not currently use any third-party marketing trackers.
                </p>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, marketing: checked }))}
              />
            </div>
          </div>

          <DialogFooter className="mt-6 sm:justify-between">
            <button
              onClick={handleAcceptAll}
              className="mt-2 w-full rounded-lg border border-[#F47E20] bg-white px-4 py-2 text-sm font-bold text-[#F47E20] transition-colors hover:bg-orange-50 sm:mt-0 sm:w-auto"
            >
              Accept all
            </button>
            <button
              onClick={handleSavePreferences}
              className="w-full rounded-lg bg-[#F47E20] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#d66a15] sm:w-auto"
            >
              Save preferences
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}