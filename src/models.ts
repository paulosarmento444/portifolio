export type Category = {
  id: number;
  name: string;
};

export type Product = {
  manage_stock: any;
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  category_id: string;
  type: string;
  quantity: number;
  attributes: Attribute[];
  stock_quantity: number;
  images: any[];
  image: string;
  price_html: string;
  purchasable: boolean;
};

export type Attribute = {
  id: string;
  name: string;
  type: string;
  value: string;
  option: string;
  options: string[];
};

export enum OrderStatus {
  PENDING = "pending",
  PAID = "completed",
  FAILED = "failed",
}

export type Order = {
  id: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  created_at: string;
};

export type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  product: Product;
};

export type Billing = {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  postcode: string;
  country: string;
  state: string;
  email: string;
  phone: string;
  number: string;
  neighborhood: string;
  persontype: string;
  cpf: string;
  rg: string;
  cnpj: string;
  ie: string;
  birthdate: string;
  gender: string;
  cellphone: string;
};

export type Shipping = {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  postcode: string;
  country: string;
  state: string;
  phone: string;
  number: string;
  neighborhood: string;
};
