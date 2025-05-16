import { Box } from "@mui/material";
import Header from "../components/Header";

export default function AboutPage() {
  return (
    <>
      <Header />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: "8px",
        }}
      >
        About page
      </Box>
    </>
  );
}
