import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../button/FormButton";
import Modal from "../Modal";
import { Shipping } from "@/app/service/MyAccountService";
import { AddressShippingForm } from "./AddressShippingForm";
import { addShippingAddress } from "@/app/server-actions/address.action";

export default function AddShippingAddress({
  viewerId,
  handleClose,
  onAddressShippingUpdate,
  currentShipping,
}: {
  handleClose: () => void;
  viewerId: number;
  onAddressShippingUpdate: (updatedShipping: any) => void;
  currentShipping: Shipping;
}) {
  const { register, handleSubmit } = useForm({
    defaultValues: currentShipping,
  });

  const onSubmit = async (data: Shipping) => {
    try {
      await addShippingAddress(viewerId, data).catch((error) => {
        console.error("Failed to add billing address:", error);
      });
      onAddressShippingUpdate(data);
      handleClose();
    } catch (error) {
      console.error("Failed to add billing address:", error);
    }
  };

  return (
    <Modal isOpen={true} handleClose={handleClose}>
      <div className="space-y-5">
        <p className="text-sm text-zinc-400">
          Para concluir a criação do endereço, preencha seus dados abaixo:
        </p>
        <AddressShippingForm register={register} />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            onClick={handleSubmit(onSubmit)}
          >
            Salvar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
