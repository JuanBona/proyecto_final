import { Cta } from "@/components/marketing/cta";
import { Features } from "@/components/marketing/features";
import { Footer } from "@/components/marketing/footer";
import { Hero } from "@/components/marketing/hero";
import { Navbar } from "@/components/marketing/navbar";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <Cta />
      <Footer />
    </main>
  );
}
