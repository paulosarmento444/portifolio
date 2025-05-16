import Link from "next/link";
import { TicketKindSelect } from "./TicketKindSelect";
import { cookies } from "next/headers";
import axios from "axios";
import { SpotSeat } from "@/app/components/event/SpotSeat";
import Header from "@/app/components/Header";
import { Box } from "@mui/material";
import { ShoppingCartIcon } from "lucide-react";
import { Button } from "@/app/components/button/FormButton";

export async function getSpots(eventId: string): Promise<any> {
  try {
    const response = await axios.get(
      `http://localhost:3001/events/${eventId}/spots`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getEvent(eventId: string): Promise<any> {
  try {
    const response = await axios.get(`http://localhost:3001/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function SpotsLayoutPage({
  params,
}: {
  params: { eventId: string };
}) {
  const spots = await getSpots(params.eventId);
  const event = await getEvent(params.eventId);

  const rowLetters = spots.map((spot: any) => spot.name[0]);
  const uniqueRows = rowLetters.filter(
    (row: any, index: any) => rowLetters.indexOf(row) === index
  );

  const spotGroupedByRow = uniqueRows.map((row: any) => {
    return {
      row,
      spots: spots
        .filter((spot: any) => spot.name[0] === row)
        .sort((a: any, b: any) => {
          const aNumber = parseInt(a.name.slice(1));
          const bNumber = parseInt(b.name.slice(1));

          return aNumber - bNumber;
        }),
    };
  });

  const cookieStore = cookies();
  const selectedSpots = JSON.parse(cookieStore.get("spots")?.value || "[]");
  let totalPrice = selectedSpots.length * 100;
  const ticketKind = cookieStore.get("ticketKind")?.value || "full";

  if (ticketKind === "half") {
    totalPrice /= 2;
  }
  const formattedTotalPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(totalPrice);

  return (
    <>
      <Header />

      <Box sx={{ marginTop: 14, paddingX: 4 }}>
        <main className="mt-16 max-w-7xl mx-auto">
          <div className="flex flex-row flex-wrap justify-center gap-x-8 rounded-2xl bg-secondary p-8 md:justify-normal">
            <div className="flex flex-col gap-y-6 max-w-full">
              <div className="flex flex-col gap-y-2">
                <p className="text-sm font-semibold uppercase text-subtitle">
                  {new Date(event.date).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
                <p className="text-2xl font-semibold">{event.name}</p>
                <p className="font-normal">{event.description}</p>
              </div>
            </div>
          </div>

          <h1 className="mt-10 text-2xl font-semibold">Escolha seu lugar</h1>

          <div className="mt-6 flex flex-wrap justify-between gap-8">
            <div className="flex w-full max-w-[650px] flex-col gap-y-8 rounded-2xl bg-secondary p-6">
              <div className="rounded-2xl bg-bar py-4 text-center text-[20px] font-bold uppercase text-white">
                Palco
              </div>
              <div className="md:w-full md:justify-normal">
                {spotGroupedByRow.map((row: any) => (
                  <div
                    key={row.row}
                    className="flex flex-row gap-3 items-center mb-3"
                  >
                    <div className="w-4">{row.row}</div>
                    <div className="ml-2 flex flex-row">
                      {row.spots.map((spot: any) => (
                        <SpotSeat
                          key={spot.id}
                          spotId={spot.name}
                          spotLabel={spot.name.slice(1)}
                          eventId={spot.eventId}
                          selected={selectedSpots.includes(spot.id)}
                          disabled={spot.status === "sold"}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex w-full flex-row justify-around">
                <div className="flex flex-row items-center">
                  <span className="mr-1 block h-4 w-4 rounded-full bg-[#00A96E]" />
                  Disponível
                </div>
                <div className="flex flex-row items-center">
                  <span className="mr-1 block h-4 w-4 rounded-full bg-[#A6ADBB]" />
                  Ocupado
                </div>
                <div className="flex flex-row items-center">
                  <span className="mr-1 block h-4 w-4  rounded-full bg-[#7480FF]" />
                  Selecionado
                </div>
              </div>
            </div>

            <div className="flex w-full max-w-[478px] flex-col gap-y-6 rounded-2xl bg-secondary p-6">
              <h1 className="text-[20px] font-semibold">
                Confira os valores do evento
              </h1>
              <p>
                Inteira: R$ 100,00 <br />
                Meia-entrada: R$ 50,00
              </p>
              <div className="flex flex-col">
                <TicketKindSelect
                  defaultValue={ticketKind as any}
                  price={100}
                />
              </div>
              <div>Total: {formattedTotalPrice}</div>
              <Button>
                Ir para pagamento
                <ShoppingCartIcon className="size-5" />
              </Button>
              <Link
                href="/checkout"
                className="rounded-lg bg-btn-primary py-4 text-sm font-semibold uppercase text-btn-primary text-center hover:bg-[#fff]"
              >
                Ir para pagamento
              </Link>
            </div>
          </div>
        </main>
      </Box>
    </>
  );
}
