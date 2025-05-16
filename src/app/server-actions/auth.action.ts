"use server";

import { gql } from "@apollo/client";
import {
  getAuthClient,
  onLogin,
  onLogout,
} from "@faustwp/experimental-app-router";
import { redirect } from "next/navigation";
import { Address } from "../service/MyAccountService";
import { woocommerceClient } from "../lib/wooCommerce";

export const getUserName = async () => {
  const client = await getAuthClient();

  if (!client) {
    throw new Error("Not authenticated");
  }

  const { data } = await client.query({
    query: gql`
      query GetViewer {
        viewer {
          name
        }
      }
    `,
  });
  return data.viewer.name;
};

export const getUserId = async () => {
  const client = await getAuthClient();

  if (!client) {
    throw new Error("Not authenticated");
  }

  const { data } = await client.query({
    query: gql`
      query GetViewer {
        viewer {
          databaseId
        }
      }
    `,
  });
  return data.viewer.databaseId;
};

export async function logoutAction() {
  return await onLogout();
}

export async function loginAction(prevData: any, formData: FormData) {
  const res = await onLogin(formData);

  if (res.error) {
    return res;
  }

  redirect("/my-account");
}
