import { PublicHomePage } from "@site/shared/server";

export default async function Home() {
  return (
    <main className="site-page-shell site-stack-page">
      <PublicHomePage />
    </main>
  );
}
