import { woocommerceClient } from "../lib/wooCommerce";
import { Products } from "../types/product";

const cache = new Map<string, any>();

const getCachedData = (key: string) => cache.get(key);
const setCachedData = (key: string, data: any) => cache.set(key, data);

export const searchProducts = async (
  name: string = "",
  options: { per_page?: number } = { per_page: 100 }
): Promise<Products> => {
  const cacheKey = `searchProducts-${name}-${options.per_page}`;
  const cached = getCachedData(cacheKey);

  if (cached) return cached;

  try {
    const response = await woocommerceClient.get("/products", {
      params: {
        search: name,
        per_page: options.per_page,
      },
    });

    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching products: ${error}`);
  }
};

export const getProductsCategory = async (
  categoryId: number
): Promise<Products> => {
  const cacheKey = `getProductsCategory-${categoryId}`;
  const cached = getCachedData(cacheKey);

  if (cached) return cached;

  try {
    const response = await woocommerceClient.get("/products", {
      params: {
        category: categoryId,
      },
    });

    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching products by category: ${error}`);
  }
};

export const getCategories = async (): Promise<any> => {
  const cacheKey = `getCategories`;
  const cached = getCachedData(cacheKey);

  if (cached) return cached;

  try {
    const response = await woocommerceClient.get("/products/categories");

    const categories = response.data.map((category: any) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: category.image,
      description: category.description,
    }));

    setCachedData(cacheKey, categories);
    return categories;
  } catch (error) {
    throw new Error(`Error fetching categories: ${error}`);
  }
};

export const getProducts = async (): Promise<any> => {
  const cacheKey = `getProducts`;
  const cached = getCachedData(cacheKey);

  if (cached) return cached;

  try {
    const response = await woocommerceClient.get("/products", {
      params: {
        per_page: 100,
      },
    });

    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching products: ${error}`);
  }
};

export const getProduct = async (id: number): Promise<any> => {
  const cacheKey = `getProduct-${id}`;
  const cached = getCachedData(cacheKey);

  if (cached) return cached;

  try {
    const response = await woocommerceClient.get(`/products/${id}`);
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching product: ${error}`);
  }
};

export const getProductVariation = async (id: number): Promise<any> => {
  const cacheKey = `getProductVariation-${id}`;
  const cached = getCachedData(cacheKey);

  if (cached) return cached;

  try {
    const response = await woocommerceClient.get(`/products/${id}/variations`);
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching product variation: ${error}`);
  }
};

export const getProductsByIds = async (ids: number[]): Promise<any[]> => {
  try {
    const productRequests = ids.map((id) =>
      woocommerceClient.get(`/products/${id}`)
    );

    const responses = await Promise.all(productRequests);

    const products = responses.map((response) => response.data);

    return products;
  } catch (error) {
    throw new Error(`Error fetching products: ${error}`);
  }
};
