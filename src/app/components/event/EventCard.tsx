import Link from "next/link";
import Image from "next/image";

export type EventCardProps = {
  event: any;
};

export function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/event/${event.id}/spots-layout`} passHref>
      <div className="group relative rounded-lg overflow-hidden bg-zinc-900 transform transition-transform duration-300 hover:scale-105 hover:z-10 cursor-pointer">
        <Image
          alt={event.name}
          src={
            event.image ||
            "https://images.unsplash.com/photo-1525097487452-6278ff080c31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGV2ZW50fGVufDB8fHx8MTY4MzQ5MzkzNw&ixlib=rb-1.2.1&q=80&w=1080"
          }
          width={600}
          height={400}
          className="object-cover w-full h-60 transition-transform duration-300 group-hover:scale-110"
        />

        <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black to-transparent">
          <p className="text-sm uppercase text-subtitle text-gray-400">
            {new Date(event.date).toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
          <p className="text-xl font-semibold text-white">{event.name}</p>
          <p className="text-sm font-normal text-gray-300">{event.location}</p>
        </div>
      </div>
    </Link>
  );
}
