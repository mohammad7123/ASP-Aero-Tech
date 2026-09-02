import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card py-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border-b border-white/5 pb-8">
          <div className="flex items-center gap-2 text-white opacity-80 hover:opacity-100 transition-opacity">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-lg tracking-wider">ASP AERTECH PVT LTD</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground font-medium">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">ISO 9001:2015</a>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ASP Aertech Private Limited. All Rights Reserved.</p>
          <p className="flex items-center gap-4 font-mono">
            <a href="/admin" className="hover:text-primary transition-colors uppercase tracking-wider font-bold">Admin</a>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" /> 
              DATA LINK ACTIVE
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
