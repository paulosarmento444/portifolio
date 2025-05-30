import Header from "@/app/components/Header";
import { ContactForm } from "./components/contact-form";
import { Toaster } from "./components/toaster";
import SportsBanner from "./components/Banner";

export default async function Home() {
  return (
    <>
      <Header />
      <div className="mt-20">
        <SportsBanner />
      </div>
      <ContactForm />
      <Toaster />
    </>
  );
}
