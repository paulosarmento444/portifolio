import Header from "@/app/components/Header";
import Player from "@/app/components/movie/Player";
import { getMovieById } from "@/app/service/MovieService";

interface IWatchProps {
  params: {
    id: string;
  };
}

export default async function Watch({ params }: IWatchProps) {
  try {
    const movie = await getMovieById(params.id);

    if (!movie) {
      return (
        <div className="flex h-screen justify-center items-center">
          <Header />
          <main className="flex-1 flex-col items-center justify-center px-20 text-center">
            <h1 className="text-2xl font-bold md:text-4xl lg:text-7xl">
              Sorry, this movie is not available
            </h1>
          </main>
        </div>
      );
    }

    return <Player movie={movie} />;
  } catch (error) {
    console.error("API request failed:", error);

    return (
      <div className="flex h-screen justify-center items-center">
        <Header />
        <main className="flex-1 flex-col items-center justify-center px-20 text-center">
          <h1 className="text-2xl font-bold md:text-4xl lg:text-7xl">
            Sorry, this movie is not available
          </h1>
        </main>
      </div>
    );
  }
}
