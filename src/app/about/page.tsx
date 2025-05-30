import Header from "@/app/components/Header";
import AboutHero from "./components/about-hero";
import MissionValues from "./components/mission-values";
import TeamSection from "./components/team-section";
import { ContactForm } from "../components/contact-form";
import { Toaster } from "react-hot-toast";

export default async function About() {
  return (
    <>
      <Header />
      <AboutHero />
      <MissionValues />
      <TeamSection />
      <ContactForm />
      <Toaster />
    </>
  );
}
