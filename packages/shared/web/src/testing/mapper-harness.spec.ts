import { accountCustomerViewSchema } from "../contracts/account.contract";
import { catalogProductCardViewSchema } from "../contracts/catalog.contract";
import { checkoutOrderConfirmationViewSchema } from "../contracts/checkout.contract";
import { createMapperContractHarness } from "./mapper-harness";

describe("createMapperContractHarness", () => {
  it("normalizes a mapped catalog product against the shared contract", () => {
    const harness = createMapperContractHarness(catalogProductCardViewSchema);

    const parsed = harness.parse({
      id: 42,
      slug: "tenis-de-corrida",
      name: "Tenis de Corrida",
      sku: "RUN-42",
      shortDescription: "Modelo leve para treino diario",
      image: {
        id: 8,
        url: "https://example.com/produto.jpg",
        alt: "Tenis azul",
      },
      categories: [
        {
          id: 10,
          name: "Calcados",
          slug: "calcados",
        },
      ],
      price: {
        amount: 299.9,
        currencyCode: "BRL",
        formatted: "R$ 299,90",
      },
      regularPrice: {
        amount: 349.9,
        currencyCode: "BRL",
        formatted: "R$ 349,90",
      },
      salePrice: {
        amount: 299.9,
        currencyCode: "BRL",
        formatted: "R$ 299,90",
      },
      type: "simple",
      createdAt: "2026-03-12T10:00:00.000Z",
      ratingAverage: 4.8,
      ratingCount: 12,
      featured: true,
      onSale: true,
      stockStatus: "instock",
    });

    expect(parsed.id).toBe("42");
    expect(parsed.image?.id).toBe("8");
    expect(parsed.categories?.[0]?.id).toBe("10");
    expect(parsed.price?.amount).toBe(299.9);
  });

  it("exposes issue paths when a mapped payload does not satisfy the contract", () => {
    const harness = createMapperContractHarness(checkoutOrderConfirmationViewSchema);

    const issues = harness.issuePaths({
      orderId: "",
      orderNumber: "",
      status: {
        label: "Pendente",
      },
      createdAt: "",
      total: {
        amount: -1,
        currencyCode: "BRL",
      },
      shippingAddress: {},
      billingAddress: {},
      items: [],
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        "orderId",
        "status.code",
        "createdAt",
        "total.amount",
      ]),
    );
  });

  it("parses collections with the same shared contract", () => {
    const harness = createMapperContractHarness(catalogProductCardViewSchema);

    const parsed = harness.parseCollection([
      {
        id: 1,
        slug: "produto-a",
        name: "Produto A",
        price: {
          amount: 10,
          currencyCode: "BRL",
        },
        regularPrice: {
          amount: 10,
          currencyCode: "BRL",
        },
        type: "simple",
        createdAt: "2026-03-12T10:00:00.000Z",
        ratingAverage: 4.2,
        ratingCount: 2,
        featured: false,
        onSale: false,
        stockStatus: "instock",
      },
      {
        id: 2,
        slug: "produto-b",
        name: "Produto B",
        price: {
          amount: 20,
          currencyCode: "BRL",
        },
        regularPrice: {
          amount: 20,
          currencyCode: "BRL",
        },
        type: "variable",
        createdAt: "2026-03-12T10:00:00.000Z",
        ratingAverage: 4.9,
        ratingCount: 7,
        featured: true,
        onSale: true,
        stockStatus: "outofstock",
      },
    ]);

    expect(parsed).toHaveLength(2);
    expect(parsed[0]?.id).toBe("1");
    expect(parsed[1]?.id).toBe("2");
  });

  it("rejects unsupported custom address fields from the storefront address contract", () => {
    const harness = createMapperContractHarness(accountCustomerViewSchema);

    const issues = harness.issuePaths({
      id: "15",
      displayName: "Cliente Teste",
      billingAddress: {
        firstName: "Ana",
        addressLine1: "Rua Central",
        city: "Sao Paulo",
        cpf: "12345678900",
        neighborhood: "Centro",
        number: "123",
      },
      shippingAddress: {
        firstName: "Ana",
        addressLine1: "Rua Central",
        city: "Sao Paulo",
        cpf: "12345678900",
        neighborhood: "Centro",
        number: "123",
      },
    });

    expect(issues).toEqual(
      expect.arrayContaining(["billingAddress", "shippingAddress"]),
    );
  });
});
