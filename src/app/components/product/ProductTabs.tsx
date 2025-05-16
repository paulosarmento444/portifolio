import React from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import { Product } from "@/models";

interface ProductTabsProps {
  product: Product;
}

export const ProductTabs: React.FC<ProductTabsProps> = ({ product }) => {
  const [selectedTab, setSelectedTab] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Box mt={4}>
      <Tabs
        value={selectedTab}
        onChange={handleChange}
        aria-label="product tabs"
      >
        <Tab label="Detalhes" />
        <Tab label="Avaliações" />
      </Tabs>
      <Box mt={2}>
        {selectedTab === 0 && (
          <Typography variant="body1" color="white">
            {product.description || "Sem descrição disponível."}
          </Typography>
        )}
        {selectedTab === 1 && (
          <Typography variant="body1" color="white">
            {/* {product.reviews || "Sem avaliações disponíveis."} */}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
