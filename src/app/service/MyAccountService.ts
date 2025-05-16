import { gql } from "@apollo/client";
import { getAuthClient } from "@faustwp/experimental-app-router";
import { woocommerceClient } from "../lib/wooCommerce";

export const authenticateUser = async () => {
  const client = await getAuthClient();

  if (!client) {
    throw new Error("Not authenticated");
  }

  try {
    const { data } = await client.query({
      query: gql`
        query GetViewer {
          viewer {
            id
            name
            databaseId
            posts {
              nodes {
                id
                title
              }
            }
          }
        }
      `,
    });

    return data.viewer;
  } catch (error) {
    throw new Error(`Error authenticating user: ${error}`);
  }
};
export const getOrder = async (orderId: number) => {
  try {
    const response = await woocommerceClient.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching order: ${error}`);
  }
};

export const getOrders = async (viewerId: number) => {
  try {
    const response = await woocommerceClient.get("/orders", {
      params: {
        customer: viewerId,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching orders: ${error}`);
  }
};

export const getCustomer = async (viewerId: number) => {
  try {
    const response = await woocommerceClient.get(`/customers/${viewerId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching customer: ${error}`);
  }
};

export interface Address {
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
}
export interface Shipping {
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
}
