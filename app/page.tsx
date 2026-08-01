import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import WhyChoose from "@/components/home/WhyChoose";
import Stats from "@/components/home/Stats";
import CTA from "@/components/home/CTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <WhyChoose />
      <Stats />
      <CTA />
    </>
  );
}