import { Toaster } from "react-hot-toast";
import Header from "../components/Header";
import { ContactForm } from "./components";

export default function ContactPage() {
  return (
    <>
      <Header />
      <Toaster />
      <ContactForm />
    </>
  );
}
