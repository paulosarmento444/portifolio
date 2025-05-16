import { Toaster } from "react-hot-toast";
import Header from "../components/Header";
import { ContactForm } from "../components/contact-form";

export default function ContactPage() {
  return (
    <>
      <Header />
      <Toaster />
      <ContactForm />
    </>
  );
}
