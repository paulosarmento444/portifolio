import { describe, expect, it } from "@jest/globals";
import {
  mapCoCartCartState,
  mapCoCartCatalogListing,
  mapCoCartCustomerToAccountCustomerView,
  mapCoCartOrderToAccountOrderSummaryView,
  mapCoCartOrderToOrderSummaryView,
  mapCoCartProductToCatalogProductDetailView,
  mapCoCartSessionState,
  mapCoCartSessionToAuthUserView,
} from "./cocart.mapper";

describe("cocart.mapper", () => {
  it("maps catalog payloads into shared contracts with stable media fallback", () => {
    const listing = mapCoCartCatalogListing(
      {
        products: [
          {
            id: 101,
            slug: "vitamina-c",
            name: "Vitamina C",
            type: "simple",
            short_description: "<p>Suplemento diário</p>",
            images: [
              {
                id: 2,
                src: {
                  thumbnail: "http://localhost:8080/uploads/vitamina-c-thumb.jpg",
                  full: "http://localhost:8080/uploads/vitamina-c.jpg",
                },
                alt: "Vitamina C",
              },
            ],
            categories: [
              {
                id: 9,
                slug: "vitaminas",
                name: "Vitaminas",
              },
            ],
            prices: {
              price: "4990",
              regular_price: "5990",
              sale_price: "4990",
              on_sale: true,
              currency: {
                currency_code: "BRL",
                currency_minor_unit: 2,
              },
            },
            dates: {
              created: "2026-03-10T10:00:00.000Z",
            },
            average_rating: "4.8",
            rating_count: 15,
            featured: true,
            stock: {
              stock_status: "instock",
            },
          },
        ],
        page: 2,
        total_products: 30,
        total_pages: 3,
        _links: {
          next: [{ href: "http://localhost:8080/wp-json/cocart/v2/products?page=3" }],
          prev: [{ href: "http://localhost:8080/wp-json/cocart/v2/products?page=1" }],
        },
      },
      {
        page: 2,
        pageSize: 12,
      },
      [
        {
          id: 9,
          slug: "vitaminas",
          name: "Vitaminas",
        },
      ],
    );

    expect(listing.items).toHaveLength(1);
    expect(listing.items[0]).toMatchObject({
      id: "101",
      name: "Vitamina C",
      shortDescription: "Suplemento diário",
      stockStatus: "instock",
      featured: true,
    });
    expect(listing.items[0]?.image?.url).toBe(
      "http://localhost:8080/uploads/vitamina-c.jpg",
    );
    expect(listing.items[0]?.price.amount).toBeCloseTo(49.9);
    expect(listing.availableCategories[0]).toMatchObject({
      slug: "vitaminas",
      name: "Vitaminas",
    });
    expect(listing.pagination).toMatchObject({
      currentPage: 2,
      pageSize: 12,
      totalItems: 30,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });

  it("preserves category metadata even when the current page has no items", () => {
    const listing = mapCoCartCatalogListing(
      {
        items: [],
        page: 1,
        pageSize: 24,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      {
        page: 1,
        pageSize: 24,
      },
      {
        categories: [
          {
            id: 77,
            slug: "acessorios",
            name: "Acessórios",
            description: "Complementos",
          },
        ],
      },
    );

    expect(listing.items).toHaveLength(0);
    expect(listing.availableCategories).toMatchObject([
      {
        slug: "acessorios",
        name: "Acessórios",
      },
    ]);
  });

  it("maps product detail and cart state with capability-safe fallbacks", () => {
    const product = mapCoCartProductToCatalogProductDetailView({
      id: 303,
      slug: "omega-3",
      name: "Omega 3",
      type: "variable",
      short_description: "<p>Ômega premium</p>",
      description: "<p>Descrição longa</p>",
      images: [
        {
          id: 1,
          src: {
            thumbnail: "http://localhost:8080/uploads/omega-3-thumb.jpg",
            full: "http://localhost:8080/uploads/omega-3.jpg",
          },
        },
      ],
      categories: [{ id: 1, slug: "suplementos", name: "Suplementos" }],
      attributes: {
        attribute_pa_sabor: {
          id: 1,
          name: "Sabor",
          used_for_variation: true,
          options: {
            limao: "Limao",
            morango: "Morango",
          },
        },
      },
      prices: {
        price: "8990",
        regular_price: "9990",
        sale_price: "8990",
        on_sale: true,
        currency: { currency_code: "BRL", currency_minor_unit: 2 },
      },
      average_rating: "5",
      rating_count: 2,
      featured: false,
      stock: {
        stock_status: "instock",
        stock_quantity: 10,
      },
      add_to_cart: {
        is_purchasable: true,
      },
      hidden_conditions: {
        manage_stock: true,
      },
      dates: {
        created: "2026-03-10T10:00:00.000Z",
      },
    });

    const cart = mapCoCartCartState({
      session_key: "session-1",
      cart_key: "t_cart-key-1",
      cart_hash: "hash-1",
      currency: {
        currency_code: "BRL",
        currency_minor_unit: 2,
      },
      items: {
        line_1: {
          item_key: "line_1",
          product_id: 303,
          name: "Omega 3",
          quantity: {
            value: 2,
            min_purchase: 1,
            max_purchase: 3,
          },
          prices: {
            price: "44.95",
            currency_code: "BRL",
          },
          totals: {
            subtotal: "89.90",
            total: "79.90",
          },
          image: {
            src: {
              thumbnail: "https://localhost:8080/uploads/omega-3-thumb.jpg",
            },
            alt: "Omega 3 thumb",
          },
        },
      },
      applied_coupons: {
        desconto10: {
          code: "DESCONTO10",
          discount_type: "percent",
          discount_total: "10.00",
        },
      },
      shipping_rates: {
        correios: {
          package_id: 1,
          rate_id: "flat_rate:1",
          method_id: "flat_rate",
          label: "Entrega padrão",
          selected: true,
          cost: "15.50",
        },
      },
      totals: {
        currency_code: "BRL",
        subtotal: "89.90",
        total: "95.40",
        discount_total: "10.00",
        shipping_total: "15.50",
        total_tax: "0",
      },
    });

    expect(product.gallery[0]?.url).toBe(
      "http://localhost:8080/uploads/omega-3.jpg",
    );
    expect(product.price.amount).toBeCloseTo(89.9);
    expect(product.attributes[0]).toMatchObject({
      name: "Sabor",
      type: "variation",
      options: ["Limao", "Morango"],
    });

    expect(cart).toMatchObject({
      sessionKey: "session-1",
      cartHash: "hash-1",
      couponCode: "DESCONTO10",
    });
    expect(cart.items[0]).toMatchObject({
      productId: "303",
      quantity: 2,
      quantityLimits: {
        min: 1,
        max: 3,
      },
      name: "Omega 3",
    });
    expect(cart.items[0]?.image?.url).toBe(
      "http://localhost:8080/uploads/omega-3-thumb.jpg",
    );
    expect(cart.items[0]?.subtotal?.amount).toBeCloseTo(89.9);
    expect(cart.items[0]?.total.amount).toBeCloseTo(79.9);
    expect(cart.items[0]?.unitPrice?.amount).toBeCloseTo(44.95);
    expect(cart.total.amount).toBeCloseTo(95.4);
    expect(cart.shippingPackages[0]).toMatchObject({
      packageId: "1",
      chosenRateId: "flat_rate:1",
    });
    expect(cart.shippingRates[0]).toMatchObject({
      rateId: "flat_rate:1",
      rateKey: undefined,
      selected: true,
      label: "Entrega padrão",
    });
    expect(cart.shippingStatus).toBe("rates_available");
    expect(cart.hasCalculatedShipping).toBe(true);
    expect(cart.coupons[0]?.discount?.amount).toBeCloseTo(10);
  });

  it("keeps shipping packages, metadata, formatted destination, and delivery forecast", () => {
    const cart = mapCoCartCartState({
      currency: {
        currency_code: "BRL",
        currency_minor_unit: 2,
      },
      shipping_rates: {
        total_packages: 1,
        has_calculated_shipping: true,
        packages: {
          default: {
            package_name: "Entrega",
            package_details: "Whey Protein x1",
            index: "default",
            chosen_method: "correios-sedex:12",
            formatted_destination: "Sao Paulo, SP, 01000-000, Brasil",
            rates: {
              "correios-pac:11": {
                key: "correios-pac:11",
                method_id: "correios-pac",
                instance_id: 11,
                label: "PAC",
                cost: "19.90",
                html: "PAC: R$ 19,90",
                meta_data: {
                  _delivery_forecast: "5",
                  items: "Whey Protein x1",
                },
              },
              "correios-sedex:12": {
                key: "correios-sedex:12",
                method_id: "correios-sedex",
                instance_id: 12,
                label: "SEDEX",
                cost: "29.90",
                html: "SEDEX: R$ 29,90",
                chosen_method: true,
                meta_data: {
                  _delivery_forecast: 2,
                },
              },
            },
          },
        },
      },
      totals: {
        currency_code: "BRL",
        subtotal: "129.90",
        total: "159.80",
        shipping_total: "29.90",
      },
    });

    expect(cart.shippingPackages).toHaveLength(1);
    expect(cart.shippingPackages[0]).toMatchObject({
      packageId: "default",
      packageName: "Entrega",
      packageDetails: "Whey Protein x1",
      formattedDestination: "Sao Paulo, SP, 01000-000, Brasil",
      chosenRateId: "correios-sedex:12",
    });
    expect(cart.shippingRates).toHaveLength(2);
    expect(cart.shippingRates[0]).toMatchObject({
      packageId: "default",
      rateId: "correios-pac:11",
      rateKey: "correios-pac:11",
      methodId: "correios-pac",
      instanceId: "11",
      deliveryForecastDays: 5,
      selected: false,
    });
    expect(cart.shippingRates[0]?.metaData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "_delivery_forecast",
          value: "5",
        }),
      ]),
    );
    expect(cart.shippingRates[1]).toMatchObject({
      rateId: "correios-sedex:12",
      rateKey: "correios-sedex:12",
      methodId: "correios-sedex",
      instanceId: "12",
      deliveryForecastDays: 2,
      selected: true,
    });
    expect(cart.shippingTotal?.amount).toBeCloseTo(29.9);
    expect(cart.shippingStatus).toBe("rates_available");
    expect(cart.shippingDestinationComplete).toBe(false);
  });

  it("maps live CoCart shipping packages when the backend returns the payload in shipping", () => {
    const cart = mapCoCartCartState({
      currency: {
        currency_code: "BRL",
        currency_minor_unit: 2,
      },
      customer: {
        billing_address: {
          billing_email: "codex-login-smoke@example.com",
          billing_first_name: "Codex",
          billing_last_name: "Smoke",
          billing_country: "BR",
          billing_address_1: "Rua Teste 123",
          billing_city: "Sao Paulo",
          billing_state: "SP",
          billing_postcode: "03298-000",
        },
        shipping_address: {
          shipping_first_name: "Codex",
          shipping_last_name: "Smoke",
          shipping_country: "BR",
          shipping_address_1: "Rua Teste 123",
          shipping_city: "Sao Paulo",
          shipping_state: "SP",
          shipping_postcode: "03298-000",
        },
      },
      shipping: {
        total_packages: 1,
        has_calculated_shipping: true,
        packages: {
          default: {
            package_name: "Shipment",
            package_details: "Camiseta x1",
            index: 0,
            chosen_method: "correios-cws2",
            formatted_destination: "Rua Teste 123, Sao Paulo, São Paulo, 03298-000",
            rates: {
              "correios-cws2": {
                key: "correios-cws2",
                method_id: "correios-cws",
                instance_id: 2,
                label: "Correios PAC (Nova API)",
                cost: "2473",
                chosen_method: true,
              },
              "correios-cws3": {
                key: "correios-cws3",
                method_id: "correios-cws",
                instance_id: 3,
                label: "Correios Sedex (Nova API)",
                cost: "2822",
                chosen_method: false,
              },
            },
          },
        },
      },
      totals: {
        currency_code: "BRL",
        subtotal: "12900",
        total: "15373",
        shipping_total: "2473",
      },
    });

    expect(cart.shippingPackages).toHaveLength(1);
    expect(cart.shippingPackages[0]).toMatchObject({
      packageId: "0",
      chosenRateId: "correios-cws2",
      formattedDestination: "Rua Teste 123, Sao Paulo, São Paulo, 03298-000",
    });
    expect(cart.shippingRates).toHaveLength(2);
    expect(cart.shippingRates[0]).toMatchObject({
      rateId: "correios-cws2",
      label: "Correios PAC (Nova API)",
      selected: true,
    });
    expect(cart.shippingRates[1]).toMatchObject({
      rateId: "correios-cws3",
      label: "Correios Sedex (Nova API)",
      selected: false,
    });
    expect(cart.shippingStatus).toBe("rates_available");
    expect(cart.hasCalculatedShipping).toBe(true);
    expect(cart.shippingDestinationComplete).toBe(true);
    expect(cart.shippingTotal?.amount).toBeCloseTo(24.73);
  });

  it("marks shipping as destination_incomplete when the cart has not calculated shipping yet", () => {
    const cart = mapCoCartCartState({
      customer: {
        shipping_address: {
          shipping_country: "BR",
          shipping_postcode: "01000-000",
          shipping_state: "",
        },
      },
      shipping_rates: {
        has_calculated_shipping: false,
        packages: [],
      },
      totals: {
        currency_code: "BRL",
        subtotal: "0",
        total: "0",
        shipping_total: "0",
        total_tax: "0",
      },
    });

    expect(cart.shippingStatus).toBe("destination_incomplete");
    expect(cart.hasCalculatedShipping).toBe(false);
    expect(cart.shippingDestinationComplete).toBe(false);
    expect(cart.shippingPackages).toHaveLength(0);
  });

  it("marks shipping as no_services when the destination is complete but the backend returns no rates", () => {
    const cart = mapCoCartCartState({
      customer: {
        shipping_address: {
          shipping_country: "BR",
          shipping_postcode: "01000-000",
          shipping_state: "SP",
          shipping_city: "Sao Paulo",
          shipping_address_1: "Rua 1",
        },
      },
      shipping_rates: {
        has_calculated_shipping: true,
        packages: [],
      },
      totals: {
        currency_code: "BRL",
        subtotal: "0",
        total: "0",
        shipping_total: "0",
        total_tax: "0",
      },
    });

    expect(cart.shippingStatus).toBe("no_services");
    expect(cart.hasCalculatedShipping).toBe(true);
    expect(cart.shippingDestinationComplete).toBe(true);
    expect(cart.shippingPackages).toHaveLength(0);
  });

  it("normalizes negative coupon savings into positive checkout discounts and preserves zero-cost free-shipping rates", () => {
    const cart = mapCoCartCartState({
      currency: {
        currency_code: "BRL",
        currency_minor_unit: 2,
      },
      customer: {
        shipping_address: {
          shipping_country: "BR",
          shipping_postcode: "03298-000",
          shipping_state: "SP",
          shipping_city: "Sao Paulo",
          shipping_address_1: "Rua Teste 123",
        },
      },
      coupons: [
        {
          coupon: "SOLAR",
          label: "Cupom: SOLAR",
          discount_type: "fixed_cart",
          saving: "-1000",
        },
      ],
      shipping: {
        total_packages: 1,
        has_calculated_shipping: true,
        packages: {
          default: {
            package_name: "Entrega",
            index: 0,
            chosen_method: "free_shipping:1",
            formatted_destination: "Rua Teste 123, Sao Paulo, São Paulo, 03298-000",
            rates: {
              "free_shipping:1": {
                key: "free_shipping:1",
                method_id: "free_shipping",
                label: "Frete grátis",
                chosen_method: true,
                cost: "0",
              },
              "correios-cws3": {
                key: "correios-cws3",
                method_id: "correios-cws",
                label: "Correios Sedex (Nova API)",
                cost: "2822",
              },
            },
          },
        },
      },
      totals: {
        currency_code: "BRL",
        subtotal: "12990",
        total: "11990",
        discount_total: "1000",
        shipping_total: "0",
      },
    });

    expect(cart.couponCode).toBe("SOLAR");
    expect(cart.coupons[0]).toMatchObject({
      code: "SOLAR",
      discount: expect.objectContaining({
        amount: 10,
      }),
    });
    expect(cart.shippingRates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rateId: "free_shipping:1",
          label: "Frete grátis",
          selected: true,
          cost: expect.objectContaining({
            amount: 0,
          }),
        }),
      ]),
    );
    expect(cart.shippingStatus).toBe("rates_available");
    expect(cart.shippingTotal?.amount).toBe(0);
  });

  it("keeps free-shipping coupons mappable when CoCart returns a textual saving label", () => {
    const cart = mapCoCartCartState({
      currency: {
        currency_code: "BRL",
        currency_minor_unit: 2,
      },
      customer: {
        shipping_address: {
          shipping_country: "BR",
          shipping_postcode: "03298-000",
          shipping_state: "SP",
          shipping_city: "Sao Paulo",
          shipping_address_1: "Rua Teste 123",
        },
      },
      coupons: [
        {
          coupon: "FRETEGRATIS",
          label: "Cupom: FRETEGRATIS",
          discount_type: "fixed_cart",
          saving: "Free shipping coupon",
          saving_html: "<span>Free shipping coupon</span>",
        },
      ],
      shipping: {
        total_packages: 1,
        has_calculated_shipping: true,
        packages: {
          default: {
            package_name: "Entrega",
            index: 0,
            chosen_method: "free_shipping:1",
            formatted_destination: "Rua Teste 123, Sao Paulo, São Paulo, 03298-000",
            rates: {
              "free_shipping:1": {
                key: "free_shipping:1",
                method_id: "free_shipping",
                label: "Frete grátis",
                chosen_method: true,
                cost: "0",
              },
            },
          },
        },
      },
      totals: {
        currency_code: "BRL",
        subtotal: "12990",
        total: "12990",
        discount_total: "0",
        shipping_total: "0",
      },
    });

    expect(cart.coupons[0]).toMatchObject({
      code: "FRETEGRATIS",
      description: "Free shipping coupon",
      discount: null,
    });
    expect(cart.shippingRates[0]).toMatchObject({
      label: "Frete grátis",
      cost: expect.objectContaining({
        amount: 0,
      }),
      selected: true,
    });
  });

  it("maps anonymous cart totals from CoCart minor units and keeps cart_key as session continuity key", () => {
    const cart = mapCoCartCartState({
      cart_key: "t_runtime_cart_key",
      cart_hash: "f830b0e141ce7bef5f41c00dc9100ed9",
      currency: {
        currency_code: "BRL",
        currency_minor_unit: 2,
      },
      items: [
        {
          item_key: "4aa98b51f0753c72de5d98492931cb17",
          id: 37,
          name: "Chuteira",
          price: "24400",
          quantity: {
            value: 1,
          },
          totals: {
            subtotal: "24400",
            total: 244,
          },
          featured_image: "http://localhost:8080/wp-content/uploads/2026/02/chuteira.jpg",
        },
      ],
      totals: {
        subtotal: "24400",
        total: "24400",
        discount_total: "0",
        shipping_total: "0",
        fee_total: "0",
        total_tax: "0",
      },
    });

    expect(cart.sessionKey).toBe("t_runtime_cart_key");
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]).toMatchObject({
      productId: "37",
      quantity: 1,
    });
    expect(cart.items[0]?.unitPrice?.amount).toBeCloseTo(244);
    expect(cart.items[0]?.total?.amount).toBeCloseTo(244);
    expect(cart.total.amount).toBeCloseTo(244);
    expect(cart.subtotal.amount).toBeCloseTo(244);
  });

  it("maps session state with unverified capabilities until runtime confirms support", () => {
    const sessionState = mapCoCartSessionState({
      isAuthenticated: true,
      user: {
        id: 7,
        email: "cliente@example.com",
        display_name: "Cliente Teste",
        roles: ["customer"],
      },
    });

    expect(sessionState.session).toMatchObject({
      isAuthenticated: true,
      user: {
        id: "7",
        displayName: "Cliente Teste",
      },
    });
    expect(sessionState.capabilities).toEqual({
      catalog: "unverified",
      cart: "unverified",
      coupons: "unverified",
      shipping: "unverified",
      totals: "unverified",
      account: "unsupported",
      auth: "unverified",
    });
  });

  it("maps customer profile and order summary into shared account and checkout contracts", () => {
    const customer = mapCoCartCustomerToAccountCustomerView({
      id: 12,
      email: "cliente@example.com",
      first_name: "Maria",
      last_name: "Silva",
      billing: {
        first_name: "Maria",
        address_1: "Rua Principal, 10",
        city: "São Paulo",
        postcode: "01000-000",
      },
      shipping: {
        first_name: "Maria",
        address_1: "Rua Principal, 10",
        city: "São Paulo",
      },
    });

    const order = mapCoCartOrderToOrderSummaryView({
      id: 500,
      number: "500",
      status: "pending",
      total: "149.90",
      date_created: "2026-03-12T10:00:00.000Z",
      payment_method_title: "PIX",
      line_items: [
        {
          product_id: 303,
          name: "Omega 3",
          quantity: 2,
          total: "149.90",
        },
      ],
      coupon_lines: [
        {
          code: "PIX10",
          discount: "-10.00",
        },
      ],
    });

    expect(customer).toMatchObject({
      id: "12",
      displayName: "Maria Silva",
      billingAddress: {
        city: "São Paulo",
      },
    });
    expect(order).toMatchObject({
      orderId: "500",
      orderNumber: "500",
      paymentMethodTitle: "PIX",
      needsPayment: true,
      couponCode: "PIX10",
      couponDiscount: expect.objectContaining({
        amount: 10,
      }),
    });
    expect(order.items[0]).toMatchObject({
      productId: "303",
      name: "Omega 3",
      quantity: 2,
    });
  });

  it("maps account order history and session user identity for CoCart-first account flows", () => {
    const accountOrder = mapCoCartOrderToAccountOrderSummaryView({
      id: 321,
      number: "321",
      status: "processing",
      total: "89.90",
      date_created: "2026-03-12T10:00:00.000Z",
      payment_method_title: "Cartão de crédito",
      line_items: [
        {
          id: 2,
          product_id: 88,
          name: "Whey Protein",
          quantity: 1,
          total: "89.90",
        },
      ],
    });

    const user = mapCoCartSessionToAuthUserView({
      authenticated: true,
      user: {
        id: 12,
        email: "cliente@example.com",
        username: "cliente",
        display_name: "Cliente Teste",
        roles: ["customer"],
      },
    });

    expect(accountOrder).toMatchObject({
      id: "321",
      number: "321",
      status: {
        code: "processing",
        label: "Processando",
      },
      paymentMethodTitle: "Cartão de crédito",
    });
    expect(accountOrder.items[0]).toMatchObject({
      productId: "88",
      productName: "Whey Protein",
    });
    expect(user).toMatchObject({
      id: "12",
      username: "cliente",
      displayName: "Cliente Teste",
    });
  });
});
