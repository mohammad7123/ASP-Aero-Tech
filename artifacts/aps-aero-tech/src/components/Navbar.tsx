import { Link } from 'wouter';
import { useHealthCheck } from '@workspace/api-client-react';
import { Shield } from 'lucide-react';

export function Navbar() {
  const { isSuccess } = useHealthCheck();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-foreground group">
          <Shield className="w-8 h-8 text-primary transition-transform group-hover:scale-110 duration-300" />
          <span className="font-display font-bold text-xl tracking-wider">ASP AERTECH</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#systems" className="hover:text-primary transition-colors">Systems</a>
          <a href="#capabilities" className="hover:text-primary transition-colors">Capabilities</a>
          <a href="#mission" className="hover:text-primary transition-colors">Mission</a>
          <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${isSuccess ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
            <span className="hidden sm:inline">{isSuccess ? 'SYSTEMS NOMINAL' : 'CONNECTING...'}</span>
          </div>
          <a href="#contact" className="hidden sm:flex px-6 py-2 bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all duration-300 clip-edges text-sm font-bold tracking-wider uppercase">
            Briefing
          </a>
        </div>
      </div>
    </nav>
  );
}
