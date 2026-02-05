import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ConverterWrapper from "@/components/ConverterWrapper";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Hero />
      <HowItWorks />
      <ConverterWrapper />
      <FAQ />
      <Footer />
    </div>
  );
}
