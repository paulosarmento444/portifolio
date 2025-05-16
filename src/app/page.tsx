import Header from "@/app/components/Header";
import { Banner } from "./components/Banner";
import { getFeaturedMovie, getMoviesByGenre } from "./service/MovieService";
import { getRandomInt } from "./utils/getRandomInt";
import { ContactForm } from "./components/contact-form";
import { Toaster } from "./components/toaster";
import { MovieRow } from "./components/movie/MovieRow";

export default async function Home() {
  const randomMovieId = getRandomInt(101, 106);
  const featuredMovie = await getFeaturedMovie(String(randomMovieId));
  const genres = ["Drama", "Action", "Comedy", "Animation"];

  const movies = await Promise.all(
    genres.map(async (genre) => {
      const movies = await getMoviesByGenre(genre, { _limit: 8 });
      return { sectionTitle: genre, movies };
    })
  );

  return (
    <>
      <div className="relative bg-gradient-to-b pb-8">
        <Header />
        <main className="relative overflow-y-scroll p-8 pb-20 scrollbar-hide lg:px-16">
          <Banner movie={featuredMovie} />
          {movies.map((movie) => (
            <MovieRow
              key={movie.sectionTitle}
              sectionTitle={movie.sectionTitle}
              movies={movie.movies}
            />
          ))}
        </main>
      </div>
      <Toaster />
      <ContactForm />
    </>
  );
}
