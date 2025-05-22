import axios from "axios";

const consumerKey = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY1;
const consumerSecret = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET1;
const baseURL = process.env.NEXT_PUBLIC_WP_BASE_URL1;

if (!consumerKey || !consumerSecret || !baseURL) {
  throw new Error(
    "As variáveis de ambiente WP_BASE_URL, WC_CONSUMER_KEY e WC_CONSUMER_SECRET devem estar definidas"
  );
}

export const woocommerceClient1 = axios.create({
  baseURL: `${baseURL}/wp-json/wc/v3`,
  auth: {
    username: consumerKey,
    password: consumerSecret,
  },
});
