export type MercadoPagoPaymentFlow = "pix" | "card";

export type MercadoPagoHeadlessConfig = {
  sdkUrl: string;
  publicKey: string;
  locale: string;
  siteId: string;
  testMode: boolean;
  enabledGatewayIds: string[];
};

export type MercadoPagoThreeDSState = {
  required: boolean;
  url?: string | null;
  creq?: string | null;
  lastFourDigits?: string | null;
};

export type MercadoPagoPixState = {
  qrCode?: string | null;
  qrCodeBase64?: string | null;
  expiresAt?: string | null;
};

export type MercadoPagoCardState = {
  paymentMethodId?: string | null;
  paymentTypeId?: string | null;
  lastFourDigits?: string | null;
  installments?: number | string | null;
  transactionAmount?: number | string | null;
  totalPaidAmount?: number | string | null;
};

export type MercadoPagoOrderPaymentState = {
  flow: MercadoPagoPaymentFlow;
  methodId: string;
  methodTitle?: string | null;
  orderStatus: string;
  orderStatusLabel?: string | null;
  paymentStatus: string;
  isPending: boolean;
  isPaid: boolean;
  paymentIds: string[];
  checkoutType?: string | null;
  pix?: MercadoPagoPixState | null;
  card?: MercadoPagoCardState | null;
  threeDS?: MercadoPagoThreeDSState | null;
};

export type MercadoPagoCardPaymentInput = {
  token: string;
  paymentMethodId: string;
  installments: number;
  issuerId?: string;
  identificationType?: string;
  identificationNumber?: string;
  sessionId?: string;
  paymentTypeId?: string;
};

export type MercadoPagoProcessOutcome = "processed" | "three_ds";

export type MercadoPagoProcessPaymentResult = {
  outcome: MercadoPagoProcessOutcome;
  paymentState: MercadoPagoOrderPaymentState;
};
