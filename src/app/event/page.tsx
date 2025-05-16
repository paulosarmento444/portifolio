import { Box, Typography } from "@mui/material";
import Header from "../components/Header";
import { EventCard } from "../components/event/EventCard";
import { getEvents } from "../service/EventService";
import Loading from "../components/my-account/Loading";

export default async function EventPage() {
  const events = await getEvents();
  if (events === undefined) {
    return (
      <>
        <Header />
        <Box
          sx={{
            mt: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <Typography variant="h5">Sem eventos</Typography>
        </Box>
      </>
    );
  }
  console.log("#######", events);

  return (
    <>
      <Header />
      <Box
        sx={{
          mt: 20,
          px: { xs: 2, sm: 4, md: 6 },
        }}
      >
        <main className="mt-10">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 2,
              justifyItems: "center",
              mt: 4,
            }}
          >
            {events.map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
          </Box>
        </main>
      </Box>
    </>
  );
}
