import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../button/FormButton";
import { addBillingAddress } from "@/app/server-actions/address.action";
import Modal from "../Modal";
import { Address } from "@/app/service/MyAccountService";
import { AddressBillingForm } from "./AddressBillingForm";

export default function AddBillingAddress({
  viewerId,
  handleClose,
  onAddressBillingUpdate,
  currentBilling,
}: {
  handleClose: () => void;
  viewerId: number;
  onAddressBillingUpdate: (updatedBilling: Address) => void;
  currentBilling: Address;
}) {
  const { register, handleSubmit } = useForm({
    defaultValues: currentBilling,
  });

  const onSubmit = async (data: Address) => {
    try {
      await addBillingAddress(viewerId, data).catch((error) => {
        console.error("Failed to add billing address:", error);
      });
      onAddressBillingUpdate(data);
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
        <AddressBillingForm register={register} />
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
