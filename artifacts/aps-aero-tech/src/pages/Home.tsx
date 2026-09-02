import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Capabilities } from '../components/Capabilities';
import { Systems } from '../components/Systems';
import { Mission } from '../components/Mission';
import { Contact } from '../components/Contact';
import { Footer } from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      <Navbar />
      <main>
        <Hero />
        <Capabilities />
        <Systems />
        <Mission />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
