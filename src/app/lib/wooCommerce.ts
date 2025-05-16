import axios from "axios";

const consumerKey = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;
const consumerSecret = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;
const baseURL = process.env.NEXT_PUBLIC_WP_BASE_URL;

if (!consumerKey || !consumerSecret || !baseURL) {
  throw new Error(
    "As variáveis de ambiente WP_BASE_URL, WC_CONSUMER_KEY e WC_CONSUMER_SECRET devem estar definidas"
  );
}

export const woocommerceClient = axios.create({
  baseURL: `${baseURL}/wp-json/wc/v3`,
  auth: {
    username: consumerKey,
    password: consumerSecret,
  },
});
