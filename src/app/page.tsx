import Header from "@/app/components/Header";
import { ContactForm } from "./contact/components";
import { Toaster } from "./components/toaster";
import SportsBanner from "./components/Banner";
import TeamSection from "./about/components/team-section";
import CategoriesShowcase from "./components/categories-showcase";

export default async function Home() {
  return (
    <>
      <Header />

      <CategoriesShowcase />

      <TeamSection />
      <ContactForm />
      <Toaster />
    </>
  );
}
