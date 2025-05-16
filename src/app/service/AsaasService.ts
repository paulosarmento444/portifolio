// Serviço para lidar com a integração com o Asaas
export interface AsaasCustomer {
  name: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  cpfCnpj?: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
  additionalEmails?: string;
  municipalInscription?: string;
  stateInscription?: string;
  observations?: string;
}

export interface AsaasPayment {
  customer: string | AsaasCustomer;
  billingType: string;
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
  installmentCount?: number;
  totalValue?: number;
  installmentValue?: number;
  discount?: {
    value: number;
    dueDateLimitDays: number;
    type: "FIXED" | "PERCENTAGE";
  };
  interest?: {
    value: number;
    type: "PERCENTAGE";
  };
  fine?: {
    value: number;
    type: "PERCENTAGE";
  };
  postalService?: boolean;
  split?: any[];
}

export async function createAsaasCustomer(customerData: AsaasCustomer) {
  try {
    const response = await fetch("https://api-sandbox.asaas.com/v3/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar cliente: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao criar cliente Asaas:", error);
    throw error;
  }
}

export async function createAsaasPayment(paymentData: AsaasPayment) {
  try {
    const response = await fetch(
      "https://api-sandbox.asaas.com/v3/pix/qrCodes/static",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao criar pagamento: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao criar pagamento Asaas:", error);
    throw error;
  }
}
