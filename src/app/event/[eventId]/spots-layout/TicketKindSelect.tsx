"use client";

import { selectTicketTypeAction } from "@/app/server-actions/event.action";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

export type TicketKindSelectProps = {
  defaultValue: "full" | "half";
  price: number;
};

export function TicketKindSelect({
  defaultValue,
  price,
}: TicketKindSelectProps) {
  const formattedFullPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
  const formattedHalfPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price / 2);

  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        variant="h6"
        component="label"
        htmlFor="ticket-type"
        sx={{ mb: 1, color: "white" }}
      >
        Escolha o tipo de ingresso
      </Typography>
      <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
        <InputLabel id="ticket-type-label" sx={{ color: "white" }}>
          Tipo de Ingresso
        </InputLabel>
        <Select
          labelId="ticket-type-label"
          id="ticket-type"
          defaultValue={defaultValue}
          label="Tipo de Ingresso"
          onChange={async (e) => {
            await selectTicketTypeAction(e.target.value as any);
          }}
          sx={{
            color: "white",
            ".MuiSvgIcon-root": { color: "white" },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "white",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "white",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "white",
            },
          }}
        >
          <MenuItem value="full" sx={{ color: "black" }}>
            Inteira - {formattedFullPrice}
          </MenuItem>
          <MenuItem value="half" sx={{ color: "black" }}>
            Meia-entrada - {formattedHalfPrice}
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
