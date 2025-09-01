import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Impact from "../components/Impact";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ScrollToTop from "../components/ScrollToTop";

export default function Home() {
  return (
    <main className="min-h-screen bg-black relative">
      <div className="relative z-10">
        <Header />
        <Hero />
        <Features />
        <HowItWorks />
        <Impact />
        <FAQ />
        <Footer />
        <ScrollToTop />
      </div>
    </main>
  );
}
