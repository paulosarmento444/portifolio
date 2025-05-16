"use client";
import { Box, Divider, Slider, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Product } from "@/models";
import { Total } from "@/app/components/Total";
import { Button } from "@/app/components/button/FormButton";
import { addToCartAction } from "@/app/server-actions/cart.action";

const schema = yup
  .object({
    product_id: yup.string().uuid().required(),
    quantity: yup.number().required().integer().min(1),
  })
  .required();

export function ProductQuantityForm(props: {
  product: Product;
  stockQuantity: number | null;
}) {
  const { product, stockQuantity } = props;

  const { control, register, getValues, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      product_id: product.id,
      quantity: 1,
    },
  });

  const [total, setTotal] = useState(product.price * getValues("quantity"));

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "quantity") {
        setTotal(product.price * getValues("quantity"));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, getValues, product]);

  const handleAddToCart = async () => {
    try {
      const data = {
        product_id: product.id,
        quantity: getValues("quantity"),
      };

      const formData = new FormData();
      formData.append("product_id", data.product_id);
      formData.append("quantity", data.quantity.toString());

      await addToCartAction(formData);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <Box component="form" sx={{ p: 1 }} action={handleAddToCart}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex" }}>
          <SettingsSuggestIcon />
          <Typography variant="h6">Configure sua compra</Typography>
        </Box>
        <Box display={{ xs: "none", md: "block" }}>
          <Total total={total} />
        </Box>
      </Box>
      <input type="hidden" value={product.id} {...register("product_id")} />
      <Controller
        name="quantity"
        control={control}
        defaultValue={1}
        render={({ field }) => (
          <Box sx={{ mt: 1 }}>
            <Typography>Quantidade</Typography>
            <Slider
              sx={{ mt: 5 }}
              valueLabelDisplay="on"
              step={1}
              marks
              min={1}
              max={stockQuantity ?? 1}
              {...field}
              disabled={!stockQuantity || stockQuantity < 1}
            />
          </Box>
        )}
      />
      <Divider sx={{ mt: 2 }} />
      <Box sx={{ display: "flex", justifyContent: "end", mt: 2 }}>
        <Button disabled={!stockQuantity || stockQuantity < 1}>
          Colocar no carrinho
          <ShoppingCartIcon className="size-5" />
        </Button>
      </Box>
    </Box>
  );
}
