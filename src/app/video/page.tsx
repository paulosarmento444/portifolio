import Header from "../components/Header";
import { MovieRow } from "../components/movie/MovieRow";
import { getMoviesByGenre } from "../service/MovieService";

export default async function VideoPage() {
  const genres = ["Drama", "Action", "Comedy", "Animation"];

  const movies = await Promise.all(
    genres.map(async (genre) => {
      const movies = await getMoviesByGenre(genre, { _limit: 8 });
      return { sectionTitle: genre, movies };
    })
  );
  return (
    <>
      <Header />
      <main className="relative overflow-y-scroll p-8 pb-20 scrollbar-hide lg:px-16 mt-20">
        {movies.map((movie) => (
          <MovieRow
            key={movie.sectionTitle}
            sectionTitle={movie.sectionTitle}
            movies={movie.movies}
          />
        ))}
      </main>
    </>
  );
}
