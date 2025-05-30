import Header from "@/app/components/Header";
import { ProductDetailContainer } from "./components/ProductDetailContainer";
import { Toaster } from "@/app/components/toaster";

export default async function ProductPage({
  params: { id },
}: {
  params: { id: string };
}) {
  return (
    <>
      <Header />
      <div className="mt-20">
        <ProductDetailContainer productId={id} />
      </div>
      <Toaster />
    </>
  );
}
