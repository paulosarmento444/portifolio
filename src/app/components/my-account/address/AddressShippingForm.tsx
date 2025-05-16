import { FormField } from "./FormField";

export const AddressShippingForm = ({ register }: any) => (
  <form className="space-y-3">
    <div className="grid grid-cols-2 gap-4">
      <div className="grid grid-cols-1 ">
        <label className="text-sm text-zinc-400">
          Nome <span className="text-red-500">*</span>
        </label>
        <FormField
          register={register}
          name="first_name"
          placeholder="Nome"
          required
        />
      </div>
      <div className="grid grid-cols-1 ">
        <label className="text-sm text-zinc-400">
          Sobrenome <span className="text-red-500">*</span>
        </label>
        <FormField
          register={register}
          name="last_name"
          placeholder="Sobrenome"
          required
        />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-4">
      <div className="grid grid-cols-1 ">
        <label className="text-sm text-zinc-400">
          Cep <span className="text-red-500">*</span>
        </label>
        <FormField
          register={register}
          name="postcode"
          placeholder="CEP"
          required
        />
      </div>
      <div className="grid grid-cols-1 ">
        <label className="text-sm text-zinc-400">
          País <span className="text-red-500">*</span>
        </label>
        <FormField
          register={register}
          name="country"
          placeholder="País"
          required
        />
      </div>
    </div>
    <div className="grid grid-cols-1 ">
      <label className="text-sm text-zinc-400">
        Endereço <span className="text-red-500">*</span>
      </label>
      <FormField
        register={register}
        name="address_1"
        placeholder="Endereço (linha 1)"
        required
      />
    </div>
    <div className="grid grid-cols-4 gap-4">
      <div className="grid grid-cols-1 ">
        <label className="text-sm text-zinc-400">
          Numero <span className="text-red-500">*</span>
        </label>
        <FormField
          register={register}
          name="number"
          placeholder="Número"
          required
        />
      </div>
      <div className="grid grid-cols-1 ">
        <label className="text-sm text-zinc-400">
          Bairro <span className="text-red-500">*</span>
        </label>
        <FormField
          register={register}
          name="neighborhood"
          placeholder="Bairro"
          required
        />
      </div>
      <div className="grid grid-cols-1 ">
        <label className="text-sm text-zinc-400">
          Cidade <span className="text-red-500">*</span>
        </label>
        <FormField
          register={register}
          name="city"
          placeholder="Cidade"
          required
        />
      </div>
      <div className="grid grid-cols-1 ">
        <label className="text-sm text-zinc-400">
          Estado <span className="text-red-500">*</span>
        </label>
        <FormField
          register={register}
          name="state"
          placeholder="Estado"
          required
        />
      </div>
    </div>
  </form>
);
