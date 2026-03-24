import crypto from "node:crypto";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createCoCartServerAdapter } from "./cocart.server";

const fetchMock = jest.fn<typeof fetch>();

const createJsonResponse = (
  payload: unknown,
  status = 200,
  headers?: Record<string, string>,
) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(payload),
    headers: {
      get: (name: string) => {
        const normalizedName = name.toLowerCase();
        const entry = Object.entries(headers ?? {}).find(
          ([headerName]) => headerName.toLowerCase() === normalizedName,
        );

        return entry?.[1] ?? null;
      },
    },
  }) as Response;

const createSignedJwt = (payload: Record<string, unknown>, secret: string) => {
  const encodedHeader = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
    "utf8",
  ).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

const createSignedSessionCookie = (payload: Record<string, unknown>, secret: string) => {
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const signature = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
};

describe("createCoCartServerAdapter", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    delete process.env.COCART_JWT_AUTH_SECRET_KEY;
    delete process.env.COCART_JWT_AUTH_SECRET_KEY_BASE64;
    delete process.env.FAUST_SECRET_KEY;
  });

  it("lists catalog products through the CoCart catalog endpoint with normalized query params", async () => {
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse({
          products: [
            {
              id: 11,
              slug: "creatina",
              name: "Creatina",
              type: "simple",
              short_description: "<p>Creatina pura</p>",
              images: [
                {
                  src: {
                    thumbnail: "http://localhost:8080/uploads/creatina-thumb.jpg",
                    full: "http://localhost:8080/uploads/creatina.jpg",
                  },
                  alt: "Creatina",
                },
              ],
              categories: [{ id: 1, slug: "suplementos", name: "Suplementos" }],
              dates: {
                created: "2026-03-10T10:00:00.000Z",
              },
              average_rating: "4.5",
              rating_count: 4,
              featured: false,
              prices: {
                price: "7990",
                regular_price: "7990",
                on_sale: false,
                currency: {
                  currency_code: "BRL",
                  currency_minor_unit: 2,
                },
              },
              stock: {
                stock_status: "instock",
              },
            },
          ],
          page: 2,
          total_products: 24,
          total_pages: 2,
          _links: {
            prev: [{ href: "http://localhost:8080/wp-json/cocart/v2/products?page=1" }],
          },
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse([
          {
            id: 1,
            slug: "suplementos",
            name: "Suplementos",
          },
        ]),
      );

    const adapter = createCoCartServerAdapter({
      baseUrl: "http://localhost:8080/wp-json/cocart/v2",
      fetchFn: fetchMock as typeof fetch,
    });

    const listing = await adapter.listCatalogProducts({
      search: "creatina",
      category: 1,
      page: 2,
      pageSize: 12,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toBe(
      "http://localhost:8080/wp-json/cocart/v2/products?search=creatina&category=1&page=2&per_page=12",
    );
    expect(init).toEqual(
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8080/wp-json/cocart/v2/products/categories?per_page=100",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
      }),
    );
    expect(listing.items[0]).toMatchObject({
      id: "11",
      name: "Creatina",
      stockStatus: "instock",
    });
    expect(listing.items[0]?.image?.url).toBe(
      "http://localhost:8080/uploads/creatina.jpg",
    );
    expect(listing.items[0]?.price.amount).toBeCloseTo(79.9);
    expect(listing.availableCategories[0]).toMatchObject({
      slug: "suplementos",
      name: "Suplementos",
    });
  });

  it("maps coupon application and shipping rates through the Store API quote boundary", async () => {
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse({
          currency: {
            currency_code: "BRL",
            currency_minor_unit: 2,
          },
          items: [
            {
              product_id: 55,
              name: "Whey Protein",
              quantity: 1,
              prices: { price: "12990", currency_code: "BRL" },
              totals: { total: "12990" },
            },
          ],
          totals: {
            currency_code: "BRL",
            subtotal: "12990",
            total: "12990",
          },
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse(
          {
            items: [],
            coupons: [],
            totals: {
              currency_code: "BRL",
              currency_minor_unit: 2,
              total_items: "0",
              total_discount: "0",
              total_shipping: "0",
              total_price: "0",
            },
            shipping_rates: [],
          },
          200,
          {
            "Cart-Token": "store-quote-1",
            Nonce: "nonce-1",
          },
        ),
      )
      .mockResolvedValueOnce(
        createJsonResponse(
          {
            items: [{ id: 55, quantity: 1 }],
            coupons: [],
            totals: {
              currency_code: "BRL",
              currency_minor_unit: 2,
              total_items: "12990",
              total_discount: "0",
              total_shipping: "0",
              total_price: "12990",
            },
            shipping_rates: [],
          },
          201,
          {
            "Cart-Token": "store-quote-1",
            Nonce: "nonce-2",
          },
        ),
      )
      .mockResolvedValueOnce(
        createJsonResponse(
          {
            items: [{ id: 55, quantity: 1 }],
            coupons: [
              {
                code: "WHEY10",
                discount_type: "fixed_cart",
                totals: {
                  total_discount: "1000",
                },
              },
            ],
            totals: {
              currency_code: "BRL",
              currency_minor_unit: 2,
              total_items: "12990",
              total_discount: "1000",
              total_shipping: "0",
              total_price: "11990",
            },
            shipping_rates: [],
          },
          200,
          {
            "Cart-Token": "store-quote-1",
            Nonce: "nonce-3",
          },
        ),
      )
      .mockResolvedValueOnce(
        createJsonResponse(
          {
            items: [{ id: 55, quantity: 1 }],
            coupons: [
              {
                code: "WHEY10",
                discount_type: "fixed_cart",
                totals: {
                  total_discount: "1000",
                },
              },
            ],
            totals: {
              currency_code: "BRL",
              currency_minor_unit: 2,
              total_items: "12990",
              total_discount: "1000",
              total_shipping: "1990",
              total_price: "13980",
            },
            shipping_rates: [
              {
                package_id: 1,
                name: "Entrega",
                shipping_rates: [
                  {
                    rate_id: "sedex:1",
                    method_id: "sedex",
                    name: "SEDEX",
                    price: "1990",
                    selected: true,
                  },
                ],
              },
            ],
          },
          200,
          {
            "Cart-Token": "store-quote-1",
            Nonce: "nonce-4",
          },
        ),
      );

    const adapter = createCoCartServerAdapter({
      baseUrl: "http://localhost:8080/wp-json/cocart/v2",
      fetchFn: fetchMock as typeof fetch,
    });

    const cart = await adapter.applyCoupon({ code: "WHEY10" });
    const shippingRates = await adapter.listShippingRates({
      cartToken: cart.cartToken,
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8080/wp-json/cocart/v2/cart",
      expect.objectContaining({
        method: "GET",
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8080/wp-json/wc/store/v1/cart",
      expect.objectContaining({
        method: "GET",
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "http://localhost:8080/wp-json/wc/store/v1/cart/add-item",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          id: 55,
          quantity: 1,
        }),
        headers: expect.objectContaining({
          "Cart-Token": "store-quote-1",
          Nonce: "nonce-1",
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "http://localhost:8080/wp-json/wc/store/v1/cart/apply-coupon",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          code: "WHEY10",
        }),
        headers: expect.objectContaining({
          "Cart-Token": "store-quote-1",
          Nonce: "nonce-2",
        }),
      }),
    );
    expect(cart.couponCode).toBe("WHEY10");
    expect(cart.total.amount).toBeCloseTo(119.9);
    expect(cart.coupons[0]).toMatchObject({
      code: "WHEY10",
      discount: expect.objectContaining({
        amount: 10,
      }),
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      5,
      "http://localhost:8080/wp-json/wc/store/v1/cart",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "Cart-Token": "store-quote-1",
        }),
      }),
    );
    expect(shippingRates[0]).toMatchObject({
      rateId: "sedex:1",
      label: "SEDEX",
      selected: true,
    });
    expect(cart.cartToken).toBe("store-quote-1");
  });

  it("removes coupons through the Store API quote boundary", async () => {
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse({
          session_key: "session-1",
          currency: {
            currency_code: "BRL",
            currency_minor_unit: 2,
          },
          items: [
            {
              product_id: 55,
              name: "Whey Protein",
              quantity: 1,
              prices: { price: "12990", currency_code: "BRL" },
              totals: { total: "12990" },
            },
          ],
          totals: {
            currency_code: "BRL",
            subtotal: "12990",
            total: "15463",
            shipping_total: "2473",
          },
          coupons: [],
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse(
          {
            items: [{ id: 55, quantity: 1 }],
            coupons: [
              {
                code: "SOLAR",
                discount_type: "fixed_cart",
                totals: {
                  total_discount: "1000",
                },
              },
            ],
            totals: {
              currency_code: "BRL",
              currency_minor_unit: 2,
              total_items: "12990",
              total_discount: "1000",
              total_shipping: "2473",
              total_price: "14463",
            },
          },
          200,
          {
            "Cart-Token": "store-cart-token",
            Nonce: "nonce-1",
          },
        ),
      )
      .mockResolvedValueOnce(
        createJsonResponse(
          {
            items: [{ id: 55, quantity: 1 }],
            coupons: [],
            totals: {
              currency_code: "BRL",
              currency_minor_unit: 2,
              total_items: "12990",
              total_discount: "0",
              total_shipping: "2473",
              total_price: "15463",
            },
          },
          200,
          {
            "Cart-Token": "store-cart-token",
            Nonce: "nonce-2",
          },
        ),
      );

    const adapter = createCoCartServerAdapter({
      baseUrl: "http://localhost:8080/wp-json/cocart/v2",
      fetchFn: fetchMock as typeof fetch,
    });

    const cart = await adapter.removeCoupon("SOLAR", {
      sessionKey: "cart-key-1",
      cartToken: "store-cart-token",
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8080/wp-json/cocart/v2/cart",
      expect.objectContaining({
        method: "GET",
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8080/wp-json/wc/store/v1/cart",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "Cart-Token": "store-cart-token",
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "http://localhost:8080/wp-json/wc/store/v1/cart/remove-coupon",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          code: "SOLAR",
        }),
        headers: expect.objectContaining({
          "Cart-Token": "store-cart-token",
          Nonce: "nonce-1",
        }),
      }),
    );
    expect(cart.coupons).toHaveLength(0);
    expect(cart.total.amount).toBeCloseTo(154.63);
  });

  it("clears the authoritative cart through the dedicated CoCart endpoint", async () => {
    fetchMock.mockResolvedValueOnce(
      createJsonResponse({
        session_key: "session-1",
        cart_hash: "hash-1",
        currency: {
          currency_code: "BRL",
          currency_minor_unit: 2,
        },
        items: [],
        coupons: [],
        totals: {
          currency_code: "BRL",
          subtotal: "0",
          total: "0",
          shipping_total: "0",
        },
      }),
    );

    const adapter = createCoCartServerAdapter({
      baseUrl: "http://localhost:8080/wp-json/cocart/v2",
      fetchFn: fetchMock as typeof fetch,
    });

    const cart = await adapter.clearCart({
      sessionKey: "cart-key-1",
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8080/wp-json/cocart/v2/cart/clear",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "CoCart-API-Cart-Key": "cart-key-1",
        }),
      }),
    );
    expect(cart.items).toHaveLength(0);
    expect(cart.total.amount).toBe(0);
  });

  it("updates the active cart shipping destination through the Store API quote boundary", async () => {
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse({
          session_key: "session-1",
          items: [
            {
              product_id: 55,
              name: "Whey Protein",
              quantity: 1,
              prices: { price: "12990", currency_code: "BRL" },
              totals: { total: "12990" },
            },
          ],
          totals: {
            currency_code: "BRL",
            subtotal: "12990",
            total: "12990",
          },
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse(
          {
            items: [{ id: 55, quantity: 1 }],
            coupons: [],
            totals: {
              currency_code: "BRL",
              currency_minor_unit: 2,
              total_items: "12990",
              total_discount: "0",
              total_shipping: "0",
              total_price: "12990",
            },
            shipping_rates: [],
            billing_address: {
              email: "cliente@example.com",
            },
          },
          200,
          {
            "Cart-Token": "store-cart-token",
            Nonce: "nonce-1",
          },
        ),
      )
      .mockResolvedValueOnce(
        createJsonResponse(
          {
            items: [{ id: 55, quantity: 1 }],
            coupons: [],
            totals: {
              currency_code: "BRL",
              currency_minor_unit: 2,
              total_items: "12990",
              total_discount: "0",
              total_shipping: "1990",
              total_price: "14980",
            },
            has_calculated_shipping: true,
            billing_address: {
              first_name: "",
              last_name: "",
              address_1: "",
              address_2: "",
              city: "Sao Paulo",
              state: "SP",
              postcode: "01000-000",
              country: "BR",
              email: "cliente@example.com",
              phone: "",
            },
            shipping_address: {
              first_name: "",
              last_name: "",
              address_1: "",
              address_2: "",
              city: "Sao Paulo",
              state: "SP",
              postcode: "01000-000",
              country: "BR",
              phone: "",
            },
            shipping_rates: [
              {
                package_id: 0,
                name: "Entrega",
                destination: {
                  city: "Sao Paulo",
                  state: "SP",
                },
                shipping_rates: [
                  {
                    rate_id: "correios-pac:11",
                    method_id: "correios-pac",
                    name: "PAC",
                    price: "1990",
                    selected: true,
                  },
                ],
              },
            ],
          },
          200,
          {
            "Cart-Token": "store-cart-token",
            Nonce: "nonce-2",
          },
        ),
      );

    const adapter = createCoCartServerAdapter({
      baseUrl: "http://localhost:8080/wp-json/cocart/v2",
      fetchFn: fetchMock as typeof fetch,
    });

    const updatedCart = await adapter.updateCartShippingDestination(
      {
        postcode: "01000-000",
        country: "BR",
        state: "SP",
        city: "Sao Paulo",
      },
      {
        sessionKey: "cart-key-1",
        cartToken: "store-cart-token",
      },
      {
        Cookie: "wordpress_logged_in=1",
        Authorization: "Bearer cart-owner-token",
      },
    );

    const [updateUrl, updateInit] = fetchMock.mock.calls[2] as [string, RequestInit];

    expect(updateUrl).toBe("http://localhost:8080/wp-json/wc/store/v1/cart/update-customer");
    expect(updateInit).toEqual(
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Cart-Token": "store-cart-token",
          Nonce: "nonce-1",
        }),
        body: JSON.stringify({
          billing_address: {
            first_name: "",
            last_name: "",
            company: "",
            address_1: "",
            address_2: "",
            city: "Sao Paulo",
            state: "SP",
            postcode: "01000-000",
            country: "BR",
            phone: "",
            email: "cliente@example.com",
          },
          shipping_address: {
            first_name: "",
            last_name: "",
            company: "",
            address_1: "",
            address_2: "",
            city: "Sao Paulo",
            state: "SP",
            postcode: "01000-000",
            country: "BR",
            phone: "",
          },
        }),
      }),
    );
    expect(updateInit.headers).not.toHaveProperty("Authorization");
    expect(updateInit.headers).not.toHaveProperty("Cookie");
    expect(updatedCart.shippingPackages[0]).toMatchObject({
      packageId: "0",
      chosenRateId: "correios-pac:11",
    });
    expect(updatedCart.shippingTotal?.amount).toBeCloseTo(19.9);
  });

  it("prefers the explicit cart session over Bearer auth when reloading cart state", async () => {
    fetchMock.mockResolvedValueOnce(
      createJsonResponse({
        session_key: "guest-cart-1",
        cart_hash: "hash-1",
        customer: {
          billing_address: {
            billing_country: "BR",
            billing_state: "SP",
            billing_postcode: "03298-000",
          },
          shipping_address: {
            shipping_country: "BR",
            shipping_state: "SP",
            shipping_postcode: "03298-000",
          },
        },
        shipping_rates: {
          packages: {
            default: {
              index: 0,
              chosen_method: "correios-cws2",
              rates: {
                "correios-cws2": {
                  key: "correios-cws2",
                  method_id: "correios-cws",
                  label: "PAC",
                  chosen_method: true,
                  cost: "24.73",
                },
              },
            },
          },
        },
        totals: {
          currency_code: "BRL",
          subtotal: "129.90",
          total: "154.63",
          shipping_total: "24.73",
        },
      }),
    );

    const adapter = createCoCartServerAdapter({
      baseUrl: "http://localhost:8080/wp-json/cocart/v2",
      fetchFn: fetchMock as typeof fetch,
    });

    const cart = await adapter.getCartState(
      {
        sessionKey: "guest-cart-1",
      },
      {
        Authorization: "Bearer authenticated-user-token",
        Cookie: "wordpress_logged_in=1",
      },
    );

    const [cartUrl, cartInit] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(cartUrl).toBe("http://localhost:8080/wp-json/cocart/v2/cart");
    expect(cartInit).toEqual(
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Cookie: "wordpress_logged_in=1",
          "CoCart-API-Cart-Key": "guest-cart-1",
        }),
      }),
    );
    expect(cartInit.headers).not.toHaveProperty("Authorization");
    expect(cart.shippingPackages[0]).toMatchObject({
      chosenRateId: "correios-cws2",
    });
  });

  it("selects a shipping rate through the cart session even when Authorization is present", async () => {
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse({
          session_key: "session-1",
          items: [
            {
              product_id: 55,
              name: "Whey Protein",
              quantity: 1,
              prices: { price: "12990", currency_code: "BRL" },
              totals: { total: "12990" },
            },
          ],
          totals: {
            currency_code: "BRL",
            subtotal: "12990",
            total: "12990",
          },
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse(
          {
            items: [{ id: 55, quantity: 1 }],
            shipping_rates: [
              {
                package_id: 0,
                name: "Entrega",
                shipping_rates: [
                  {
                    rate_id: "correios-pac:11",
                    method_id: "correios-pac",
                    name: "PAC",
                    price: "1990",
                    selected: false,
                  },
                  {
                    rate_id: "correios-sedex:12",
                    method_id: "correios-sedex",
                    name: "SEDEX",
                    price: "2990",
                    selected: false,
                  },
                ],
              },
            ],
            totals: {
              currency_code: "BRL",
              currency_minor_unit: 2,
              total_items: "12990",
              total_discount: "0",
              total_shipping: "1990",
              total_price: "14980",
            },
          },
          200,
          {
            "Cart-Token": "store-cart-token",
            Nonce: "nonce-1",
          },
        ),
      )
      .mockResolvedValueOnce(
        createJsonResponse(
          {
            items: [{ id: 55, quantity: 1 }],
            shipping_rates: [
              {
                package_id: 0,
                name: "Entrega",
                shipping_rates: [
                  {
                    rate_id: "correios-pac:11",
                    method_id: "correios-pac",
                    name: "PAC",
                    price: "1990",
                    selected: false,
                  },
                  {
                    rate_id: "correios-sedex:12",
                    method_id: "correios-sedex",
                    name: "SEDEX",
                    price: "2990",
                    selected: true,
                  },
                ],
              },
            ],
            totals: {
              currency_code: "BRL",
              currency_minor_unit: 2,
              total_items: "12990",
              total_discount: "0",
              total_shipping: "2990",
              total_price: "15980",
            },
          },
          200,
          {
            "Cart-Token": "store-cart-token",
            Nonce: "nonce-2",
          },
        ),
      );

    const adapter = createCoCartServerAdapter({
      baseUrl: "http://localhost:8080/wp-json/cocart/v2",
      fetchFn: fetchMock as typeof fetch,
    });

    const cart = await adapter.selectShippingRate(
      {
        packageId: "default",
        rateId: "correios-sedex:12",
      },
      {
        sessionKey: "cart-key-1",
        cartToken: "store-cart-token",
      },
      {
        Cookie: "wp_woocommerce_session=abc",
        Authorization: "Bearer cart-owner-token",
      },
    );

    const [selectUrl, selectInit] = fetchMock.mock.calls[2] as [string, RequestInit];

    expect(selectUrl).toBe("http://localhost:8080/wp-json/wc/store/v1/cart/select-shipping-rate");
    expect(selectInit).toEqual(
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Cart-Token": "store-cart-token",
          Nonce: "nonce-1",
        }),
        body: JSON.stringify({
          package_id: "default",
          rate_id: "correios-sedex:12",
        }),
      }),
    );
    expect(selectInit.headers).not.toHaveProperty("Authorization");
    expect(selectInit.headers).not.toHaveProperty("Cookie");
    expect(cart.shippingPackages[0]).toMatchObject({
      packageId: "0",
      chosenRateId: "correios-sedex:12",
    });
    expect(cart.shippingRates.find((rate) => rate.selected)).toMatchObject({
      rateId: "correios-sedex:12",
      methodId: "correios-sedex",
    });
    expect(cart.shippingTotal?.amount).toBeCloseTo(29.9);
  });

  it("persists CoCart cart ownership through session-aware add, update, and remove item flows", async () => {
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse({
          session_key: "session-1",
          cart_hash: "hash-1",
          items: {
            line_1: {
              item_key: "line_1",
              id: 88,
              name: "Creatina",
              quantity: { value: 1 },
              prices: { price: "79.90", currency_code: "BRL" },
              totals: { total: "79.90" },
              featured_image: "http://localhost:8080/uploads/creatina.jpg",
            },
          },
          totals: {
            currency_code: "BRL",
            subtotal: "79.90",
            total: "79.90",
          },
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse({
          session_key: "session-1",
          cart_hash: "hash-1",
          items: {
            line_1: {
              item_key: "line_1",
              product_id: 77,
              name: "Creatina",
              quantity: 3,
              prices: { price: "79.90", currency_code: "BRL" },
              totals: { total: "239.70" },
            },
          },
          totals: {
            currency_code: "BRL",
            subtotal: "239.70",
            total: "239.70",
          },
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse({
          session_key: "session-1",
          cart_hash: "hash-1",
          items: [],
          totals: {
            currency_code: "BRL",
            subtotal: "0.00",
            total: "0.00",
          },
        }),
      );

    const adapter = createCoCartServerAdapter({
      baseUrl: "http://localhost:8080/wp-json/cocart/v2",
      fetchFn: fetchMock as typeof fetch,
    });

    const session = { sessionKey: "cart-key-1", cartToken: "token-1" };

    const created = await adapter.addCartItem(
      {
        productId: "77",
        variationId: "88",
        quantity: 1,
      },
      session,
    );
    const updated = await adapter.updateCartItem(
      {
        itemKey: "line_1",
        quantity: 3,
      },
      session,
    );
    const cleared = await adapter.removeCartItem("line_1", session);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8080/wp-json/cocart/v2/cart/add-item",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          id: "88",
          quantity: "1",
        }),
        headers: expect.objectContaining({
          "CoCart-API-Cart-Key": "cart-key-1",
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8080/wp-json/cocart/v2/cart/item/line_1",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          quantity: "3",
        }),
        headers: expect.objectContaining({
          "CoCart-API-Cart-Key": "cart-key-1",
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "http://localhost:8080/wp-json/cocart/v2/cart/item/line_1",
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({
          "CoCart-API-Cart-Key": "cart-key-1",
        }),
      }),
    );

    expect(created.items[0]).toMatchObject({
      itemKey: "line_1",
      productId: "88",
      quantity: 1,
    });
    expect(created.cartToken).toBeUndefined();
    expect(created.items[0]?.image?.url).toBe(
      "http://localhost:8080/uploads/creatina.jpg",
    );
    expect(updated.items[0]).toMatchObject({
      itemKey: "line_1",
      quantity: 3,
    });
    expect(updated.cartToken).toBeUndefined();
    expect(cleared.items).toHaveLength(0);
    expect(cleared.cartToken).toBeUndefined();
  });

  it("maps customer profile and order summary through the CoCart boundary", async () => {
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse({
          id: 42,
          email: "cliente@example.com",
          first_name: "Cliente",
          last_name: "Teste",
          billing: {
            first_name: "Cliente",
            address_1: "Rua A, 100",
            city: "São Paulo",
          },
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse({
          id: 700,
          number: "700",
          status: "processing",
          total: "89.90",
          date_created: "2026-03-11T12:00:00.000Z",
          payment_method_title: "Cartão de crédito",
          line_items: [
            {
              product_id: 10,
              name: "Creatina",
              quantity: 1,
              total: "89.90",
            },
          ],
        }),
      );

    const adapter = createCoCartServerAdapter({
      baseUrl: "http://localhost:8080/wp-json/cocart/v2",
      fetchFn: fetchMock as typeof fetch,
    });

    const customer = await adapter.getCustomerProfile();
    const order = await adapter.getOrderSummary("700");

    expect(customer).toMatchObject({
      id: "42",
      displayName: "Cliente Teste",
      billingAddress: {
        city: "São Paulo",
      },
    });
    expect(order).toMatchObject({
      orderId: "700",
      orderNumber: "700",
      needsPayment: false,
    });
    expect(order.items[0]).toMatchObject({
      productId: "10",
      name: "Creatina",
    });
  });

  it("maps account orders and customer mutations through the CoCart account boundary", async () => {
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse({
          orders: [
            {
              id: 910,
              number: "910",
              status: "completed",
              total: "129.90",
              date_created: "2026-03-13T09:00:00.000Z",
              payment_method_title: "PIX",
              line_items: [
                {
                  id: 1,
                  product_id: 303,
                  name: "Omega 3",
                  quantity: 2,
                  total: "129.90",
                },
              ],
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse({
          id: 42,
          email: "cliente@example.com",
          first_name: "Maria",
          last_name: "Silva",
          billing: {
            first_name: "Maria",
            last_name: "Silva",
            city: "São Paulo",
            phone: "11999999999",
            address_2: "Apto 12",
            country: "BR",
          },
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse({
          id: 42,
          email: "cliente@example.com",
          first_name: "Maria",
          last_name: "Silva",
          shipping: {
            first_name: "Maria",
            last_name: "Silva",
            address_1: "Rua Principal",
            city: "São Paulo",
          },
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse({
          id: 42,
          email: "cliente@example.com",
          first_name: "Maria",
          last_name: "Silva",
        }),
      );

    const adapter = createCoCartServerAdapter({
      baseUrl: "http://localhost:8080/wp-json/cocart/v2",
      fetchFn: fetchMock as typeof fetch,
    });
    const forwardedHeaders = {
      Cookie: "wordpress_logged_in=1",
    };

    const orders = await adapter.listAccountOrders(undefined, forwardedHeaders);
    const profile = await adapter.updateCustomerProfile(
      "42",
      {
        firstName: "Maria",
        lastName: "Silva",
        email: "cliente@example.com",
        phone: "11999999999",
        city: "São Paulo",
      },
      forwardedHeaders,
    );
    const address = await adapter.updateCustomerAddress(
      "42",
      {
        addressType: "shipping",
        firstName: "Maria",
        lastName: "Silva",
        addressLine1: "Rua Principal",
        addressLine2: "Casa 2",
        city: "São Paulo",
        country: "BR",
      },
      forwardedHeaders,
    );
    await adapter.updateCustomerPassword(
      "42",
      {
        newPassword: "nova-senha-123",
      },
      forwardedHeaders,
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8080/wp-json/cocart/v2/account/orders",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Cookie: "wordpress_logged_in=1",
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8080/wp-json/cocart/v2/account/customer/42",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          first_name: "Maria",
          last_name: "Silva",
          email: "cliente@example.com",
          billing: {
            first_name: "Maria",
            last_name: "Silva",
            email: "cliente@example.com",
            phone: "11999999999",
            city: "São Paulo",
          },
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "http://localhost:8080/wp-json/cocart/v2/account/customer/42",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          shipping: {
            first_name: "Maria",
            last_name: "Silva",
            address_1: "Rua Principal",
            address_2: "Casa 2",
            city: "São Paulo",
            country: "BR",
          },
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "http://localhost:8080/wp-json/cocart/v2/account/customer/42",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          password: "nova-senha-123",
        }),
      }),
    );
    expect(orders[0]).toMatchObject({
      id: "910",
      number: "910",
      status: {
        code: "completed",
        label: "Concluído",
      },
    });
    expect(profile).toMatchObject({
      id: "42",
      billingAddress: {
        city: "São Paulo",
      },
    });
    expect(address).toMatchObject({
      id: "42",
      shippingAddress: {
        city: "São Paulo",
      },
    });
  });

  it("maps CoCart login responses into storefront auth session and tokens", async () => {
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse({
          user_id: 99,
          email: "cliente@example.com",
          username: "cliente",
          display_name: "Cliente Teste",
          role: "customer",
          extras: {
            jwt_token: "jwt-token",
            jwt_refresh: "refresh-token",
          },
        }),
      );

    const adapter = createCoCartServerAdapter({
      baseUrl: "http://localhost:8080/wp-json/cocart/v2",
      fetchFn: fetchMock as typeof fetch,
    });

    const login = await adapter.login({
      username: "cliente@example.com",
      password: "password-123",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/wp-json/cocart/v2/login",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Basic Y2xpZW50ZUBleGFtcGxlLmNvbTpwYXNzd29yZC0xMjM=",
        }),
        body: JSON.stringify({
          username: "cliente@example.com",
          password: "password-123",
        }),
      }),
    );
    expect(login.session).toMatchObject({
      isAuthenticated: true,
      user: {
        id: "99",
        username: "cliente",
        email: "cliente@example.com",
      },
    });
    expect(login.tokens).toEqual({
      accessToken: "jwt-token",
      refreshToken: "refresh-token",
    });
  });

  it("returns an unauthenticated session when no CoCart auth token is present", async () => {

    const adapter = createCoCartServerAdapter({
      baseUrl: "http://localhost:8080/wp-json/cocart/v2",
      fetchFn: fetchMock as typeof fetch,
    });

    await expect(adapter.getAuthSession()).resolves.toEqual({
      isAuthenticated: false,
      user: null,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("builds session state from an authenticated CoCart cart response", async () => {
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse({
          cart_key: "6",
          customer: {
            billing_address: {
              billing_first_name: "Cliente",
              billing_last_name: "Teste",
              billing_email: "cliente@example.com",
            },
          },
        }),
      );

    const adapter = createCoCartServerAdapter({
      baseUrl: "http://localhost:8080/wp-json/cocart/v2",
      fetchFn: fetchMock as typeof fetch,
    });

    const session = await adapter.getSessionState({
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJkYXRhIjp7InVzZXIiOnsiaWQiOjk5LCJ1c2VybmFtZSI6ImNsaWVudGUifX19.signature",
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8080/wp-json/cocart/v2/cart",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: expect.stringContaining("Bearer "),
        }),
      }),
    );
    expect(session.session).toMatchObject({
      isAuthenticated: true,
      user: {
        id: "99",
        email: "cliente@example.com",
        displayName: "Cliente Teste",
      },
    });
    expect(session.capabilities.cart).toBe("unverified");
  });

  it("falls back to a locally verified JWT session when the cart response is anonymous", async () => {
    process.env.COCART_JWT_AUTH_SECRET_KEY = "test-secret";
    fetchMock.mockResolvedValueOnce(
      createJsonResponse({
        cart_key: "t_abcd1234",
        customer: {
          billing_address: {
            billing_email: "",
          },
        },
      }),
    );

    const adapter = createCoCartServerAdapter({
      baseUrl: "http://localhost:8080/wp-json/cocart/v2",
      fetchFn: fetchMock as typeof fetch,
    });

    const session = await adapter.getAuthSession({
      Authorization: `Bearer ${createSignedJwt(
        {
          exp: Math.floor(Date.now() / 1000) + 3600,
          data: {
            user: {
              id: 99,
              username: "cliente",
            },
          },
        },
        "test-secret",
      )}`,
    });

    expect(session).toMatchObject({
      isAuthenticated: true,
      user: {
        id: "99",
        username: "cliente",
        displayName: "cliente",
      },
    });
  });

  it("falls back to a locally verified JWT session when CoCart rejects the cart request", async () => {
    process.env.COCART_JWT_AUTH_SECRET_KEY = "test-secret";
    const unauthorizedError = Object.assign(new Error("Unauthorized"), {
      response: {
        status: 401,
        data: { message: "Unauthorized" },
      },
    });
    fetchMock.mockRejectedValueOnce(unauthorizedError);

    const adapter = createCoCartServerAdapter({
      baseUrl: "http://localhost:8080/wp-json/cocart/v2",
      fetchFn: fetchMock as typeof fetch,
    });

    const session = await adapter.getSessionState({
      Authorization: `Bearer ${createSignedJwt(
        {
          exp: Math.floor(Date.now() / 1000) + 3600,
          data: {
            user: {
              id: 99,
              username: "cliente",
            },
          },
        },
        "test-secret",
      )}`,
    });

    expect(session.session).toMatchObject({
      isAuthenticated: true,
      user: {
        id: "99",
        username: "cliente",
        displayName: "cliente",
      },
    });
  });

  it("falls back to the locally persisted storefront auth session when upstream JWT auth is misconfigured", async () => {
    process.env.FAUST_SECRET_KEY = "local-session-secret";
    const unauthorizedError = Object.assign(new Error("JWT configuration error."), {
      response: {
        status: 403,
        data: { code: "cocart_jwt_auth_bad_config" },
      },
    });
    fetchMock.mockRejectedValueOnce(unauthorizedError);

    const adapter = createCoCartServerAdapter({
      baseUrl: "http://localhost:8080/wp-json/cocart/v2",
      fetchFn: fetchMock as typeof fetch,
    });

    const session = await adapter.getSessionState({
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJkYXRhIjp7InVzZXIiOnsiaWQiOjEwLCJ1c2VybmFtZSI6Im1hcmlhIn19fQ.invalid",
      Cookie: `cocart_auth_session=${createSignedSessionCookie(
        {
          exp: Math.floor(Date.now() / 1000) + 3600,
          user: {
            id: "10",
            email: "maria@example.com",
            username: "maria",
            displayName: "Maria",
            firstName: "Maria",
            lastName: "Silva",
            avatar: null,
            roleLabels: [],
          },
        },
        "local-session-secret",
      )}`,
    });

    expect(session.session).toMatchObject({
      isAuthenticated: true,
      user: {
        id: "10",
        email: "maria@example.com",
        username: "maria",
        displayName: "Maria",
      },
    });
  });
});
