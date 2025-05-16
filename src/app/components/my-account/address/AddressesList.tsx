import React, { useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Modal,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { Button } from "../../button/FormButton";
import { Address, Shipping } from "@/app/service/MyAccountService";
import AddBillingAddress from "./AddBillingAdress";
import AddShippingAddress from "./AddShippingAdress";

interface AddressesProps {
  billing: Address;
  shipping: Shipping;
  viewer: any;
}

const AddressesList: React.FC<AddressesProps> = ({
  billing,
  shipping,
  viewer,
}) => {
  const [openBillingModal, setOpenBillingModal] = useState(false);
  const [openShippingModal, setOpenShippingModal] = useState(false);

  const [billingAddress, setBillingAddress] = useState<Address>(billing);
  const [shippingAddress, setShippingAddress] = useState<Shipping>(shipping);

  const handleOpenBillingModal = () => setOpenBillingModal(true);
  const handleOpenShippingModal = () => setOpenShippingModal(true);
  const handleCloseBillingModal = () => setOpenBillingModal(false);
  const handleCloseShippingModal = () => setOpenShippingModal(false);

  const handleAddressBillingUpdate = (updatedBilling: Address) => {
    setBillingAddress(updatedBilling);
  };
  const handleAddressShippingUpdate = (updatedShipping: Shipping) => {
    setShippingAddress(updatedShipping);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ color: "white" }}>
        Meus Endereços
      </Typography>
      <Box
        mt={4}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
        }}
      >
        {[
          {
            title: "Endereço de Faturamento",
            address: billingAddress,
            handleOpen: handleOpenBillingModal,
            isEmpty: !billingAddress.address_1,
          },
          {
            title: "Endereço de Envio",
            address: shippingAddress,
            handleOpen: handleOpenShippingModal,
            isEmpty: !shippingAddress.address_1,
          },
        ].map(({ title, address, handleOpen, isEmpty }, index) => (
          <Card
            key={index}
            sx={{
              flex: 1,
              p: 3,
              bgcolor: "#1f1f1f",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: "#fff" }}>
                {title}
              </Typography>
              <Divider sx={{ mb: 2, borderColor: "#333" }} />
              {isEmpty ? (
                <Typography variant="body2" sx={{ color: "#888" }}>
                  Nenhum endereço encontrado.
                </Typography>
              ) : (
                <>
                  <Typography
                    variant="body1"
                    sx={{ color: "#ccc" }}
                  >{`${address.first_name} ${address.last_name}`}</Typography>
                  <Typography variant="body2" sx={{ color: "#888" }}>
                    {address.address_1}
                  </Typography>
                  {address.address_2 && (
                    <Typography variant="body2" sx={{ color: "#888" }}>
                      {address.address_2}
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    sx={{ color: "#888" }}
                  >{`${address.city}, ${address.state} ${address.postcode}`}</Typography>
                  <Typography variant="body2" sx={{ color: "#888" }}>
                    {address.country}
                  </Typography>
                </>
              )}
            </CardContent>
            <CardActions sx={{ justifyContent: "flex-end" }}>
              <Button variant="primary" onClick={handleOpen}>
                {isEmpty ? "Adicionar Endereço" : "Editar"}
              </Button>
            </CardActions>
          </Card>
        ))}

        {/* Modal para o Endereço de Faturamento */}
        <Modal open={openBillingModal} onClose={handleCloseBillingModal}>
          <AddBillingAddress
            viewerId={viewer.databaseId}
            handleClose={handleCloseBillingModal}
            onAddressBillingUpdate={handleAddressBillingUpdate}
            currentBilling={billingAddress}
          />
        </Modal>

        {/* Modal para o Endereço de Envio */}
        <Modal open={openShippingModal} onClose={handleCloseShippingModal}>
          <AddShippingAddress
            viewerId={viewer.databaseId}
            handleClose={handleCloseShippingModal}
            onAddressShippingUpdate={handleAddressShippingUpdate}
            currentShipping={shippingAddress}
          />
        </Modal>
      </Box>
    </Box>
  );
};

export default AddressesList;
