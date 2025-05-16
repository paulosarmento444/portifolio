import { FormField } from "./FormField";

export const AddressBillingForm = ({ register }: any) => (
  <form className="space-y-3">
    <div className="grid grid-cols-1 ">
      <label className="text-sm text-zinc-400">
        Endereço de e-mail <span className="text-red-500">*</span>
      </label>
      <FormField
        register={register}
        name="email"
        placeholder="O número do pedido e o recibo serão enviados para este endereço de e-mail."
        required
      />
    </div>
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
          Celular <span className="text-red-500">*</span>
        </label>
        <FormField
          register={register}
          name="phone"
          placeholder="Telefone"
          required
        />
      </div>
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
    <div className="grid grid-cols-2 gap-4">
      <div className="grid grid-cols-1 ">
        <label className="text-sm text-zinc-400">
          Tipo de pessoa <span className="text-red-500">*</span>
        </label>
        <select
          {...register("gender")}
          required
          className="h-12 px-4 bg-zinc-950 border border-zinc-800 rounded-lg text-lg placeholder-zinc-400 outline-none"
        >
          <option value="" disabled>
            Tipo de pessoa
          </option>
          <option value="physical">Físico</option>
          <option value="cnpj">CNPJ</option>
        </select>
      </div>

      <div className="grid grid-cols-1 ">
        <label className="text-sm text-zinc-400">
          CPF <span className="text-red-500">*</span>
        </label>
        <FormField register={register} name="cpf" placeholder="CPF" required />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="grid grid-cols-1 ">
        <label className="text-sm text-zinc-400">Nome da empresa</label>

        <FormField
          register={register}
          name="company_name"
          placeholder="Nome da empresa (Se houver)"
        />
      </div>
      <div className="grid grid-cols-1 ">
        <label className="text-sm text-zinc-400">CNPJ</label>
        <FormField
          register={register}
          name="cnpj"
          placeholder="CNPJ (Se houver)"
        />
      </div>
    </div>
  </form>
);
