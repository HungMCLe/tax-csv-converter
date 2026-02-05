import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ConverterWrapper from "@/components/ConverterWrapper";
import SupportedBrokers from "@/components/SupportedBrokers";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import BuyMeCoffee from "@/components/BuyMeCoffee";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Hero />
      <HowItWorks />
      <ConverterWrapper />
      <SupportedBrokers />
      <FAQ />
      <Footer />
      <BuyMeCoffee />
    </div>
  );
}
