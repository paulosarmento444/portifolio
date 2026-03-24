import {
  accountOrderItemViewSchema,
  accountOrderSummaryViewSchema,
  accountCustomerViewSchema,
  authSessionViewSchema,
  authUserViewSchema,
  catalogCategoryViewSchema,
  catalogProductCardViewSchema,
  catalogProductDetailViewSchema,
  catalogListingViewSchema,
  checkoutCartItemViewSchema,
  checkoutOrderConfirmationViewSchema,
  moneyValueViewSchema,
  type AccountCustomerView,
  type AccountOrderSummaryView,
  type AuthSessionView,
  type AuthUserView,
  type CatalogCategoryView,
  type CatalogListingView,
  type CatalogProductCardView,
  type CatalogProductDetailView,
  type CheckoutOrderConfirmationView,
  type MediaAssetView,
  type MoneyValueView,
} from "@site/shared";
import {
  cocartAuthLoginResultSchema,
  cocartAuthTokensSchema,
  cocartCartItemViewSchema,
  cocartAccountOrderSummaryViewSchema,
  cocartCartStateViewSchema,
  cocartCouponStateViewSchema,
  cocartOrderSummaryViewSchema,
  cocartShippingPackageViewSchema,
  cocartSessionStateViewSchema,
  cocartShippingQuoteViewSchema,
  defaultCoCartCapabilities,
  type CoCartCartStateView,
  type CoCartAuthLoginResult,
  type CoCartAccountOrderSummaryView,
  type CoCartCatalogQuery,
  type CoCartCouponStateView,
  type CoCartOrderSummaryView,
  type CoCartShippingPackageView,
  type CoCartSessionStateView,
  type CoCartShippingQuoteView,
  type CoCartTotalsView,
} from "../contracts";
import type {
  CoCartRawCart,
  CoCartRawCartItem,
  CoCartRawCategory,
  CoCartRawCategoryCollection,
  CoCartRawCoupon,
  CoCartRawCustomer,
  CoCartRawImage,
  CoCartRawImageSizeMap,
  CoCartRawLoginResponse,
  CoCartRawOrder,
  CoCartRawProduct,
  CoCartRawProductCollection,
  CoCartRawSession,
  CoCartRawShippingDetails,
  CoCartRawShippingPackage,
  CoCartRawShippingRate,
  CoCartRawTotals,
} from "../external/cocart.types";

const humanizeStatus = (status?: string | null) => {
  switch (status?.trim()) {
    case "pending":
      return "Pendente";
    case "processing":
      return "Processando";
    case "completed":
      return "Concluído";
    case "cancelled":
      return "Cancelado";
    case "refunded":
      return "Reembolsado";
    case "failed":
      return "Falhou";
    case "on-hold":
      return "Em espera";
    default:
      return status?.trim() || "Desconhecido";
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeLocalhostUrl = (value?: unknown) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return undefined;
  }

  return normalizedValue.includes("localhost")
    ? normalizedValue.replace(/^https:\/\//, "http://")
    : normalizedValue;
};

const stripHtml = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  const cleaned = value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return cleaned || undefined;
};

const toNumber = (value?: string | number | null) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const toInteger = (value?: string | number | null) => {
  const parsed = toNumber(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
};

const toStringId = (value?: string | number | null, fallback = "0") => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value);
};

const toCurrencyCode = (totals?: { currency_code?: string | null } | null) =>
  totals?.currency_code?.trim() || "BRL";

const imageSizePreference = [
  "full",
  "large",
  "woocommerce_single",
  "medium_large",
  "medium",
  "custom",
  "woocommerce_thumbnail",
  "thumbnail",
  "woocommerce_gallery_thumbnail",
] as const;

const extractMediaUrl = (value: unknown, depth = 0): string | undefined => {
  if (depth > 4 || value === null || value === undefined) {
    return undefined;
  }

  const normalizedString = normalizeLocalhostUrl(value);
  if (normalizedString) {
    return normalizedString;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const resolved = extractMediaUrl(item, depth + 1);
      if (resolved) {
        return resolved;
      }
    }

    return undefined;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  for (const key of ["src", "url", "source_url", "href"] as const) {
    const resolved = extractMediaUrl(value[key], depth + 1);
    if (resolved) {
      return resolved;
    }
  }

  for (const key of imageSizePreference) {
    const resolved = extractMediaUrl(value[key], depth + 1);
    if (resolved) {
      return resolved;
    }
  }

  for (const nestedValue of Object.values(value)) {
    const resolved = extractMediaUrl(nestedValue, depth + 1);
    if (resolved) {
      return resolved;
    }
  }

  return undefined;
};

const extractMediaAlt = (value: unknown) => {
  if (!isRecord(value)) {
    return undefined;
  }

  for (const key of ["alt", "alt_text", "name", "title"] as const) {
    const candidate = value[key];
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return undefined;
};

const toTextArray = (value?: string[] | Record<string, string> | null) => {
  if (!value) {
    return [];
  }

  const rawValues = Array.isArray(value) ? value : Object.values(value);
  return rawValues.filter(
    (candidate): candidate is string =>
      typeof candidate === "string" && candidate.trim().length > 0,
  );
};

const toDecimalAmount = (
  value?: string | number | null,
  minorUnit?: string | number | null,
) => {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  if (typeof value === "string" && /[.,]/.test(value)) {
    return toNumber(value);
  }

  if (typeof value === "number" && !Number.isInteger(value)) {
    return toNumber(value);
  }

  const integerValue =
    typeof value === "number" ? value : Number.parseInt(String(value), 10);

  if (!Number.isFinite(integerValue)) {
    return 0;
  }

  const resolvedMinorUnit = Math.max(0, toInteger(minorUnit ?? 0));
  return resolvedMinorUnit > 0
    ? integerValue / 10 ** resolvedMinorUnit
    : integerValue;
};

const toCartAmount = (
  value?: string | number | null,
  minorUnit?: string | number | null,
) => {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? value : toNumber(value);
  }

  if (/[.,]/.test(value)) {
    return toNumber(value);
  }

  return toDecimalAmount(value, minorUnit);
};

const toMoneyValue = (
  amount?: string | number | null,
  currencyCode = "BRL",
): MoneyValueView =>
  moneyValueViewSchema.parse({
    amount: toNumber(amount),
    currencyCode,
    formatted: new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currencyCode || "BRL",
    }).format(toNumber(amount)),
  });

const toDiscountMoneyValue = (
  amount?: string | number | null,
  currencyCode = "BRL",
): MoneyValueView => toMoneyValue(Math.abs(toNumber(amount)), currencyCode);

const toMediaAsset = (
  image?: CoCartRawImage | CoCartRawImageSizeMap | string | null,
): MediaAssetView | null => {
  const url = extractMediaUrl(image);

  if (!url) {
    return null;
  }

  return {
    id:
      isRecord(image) && (typeof image.id === "string" || typeof image.id === "number")
        ? String(image.id)
        : undefined,
    url,
    alt: extractMediaAlt(image),
  };
};

const toArray = <T>(value?: T[] | Record<string, T> | null): T[] => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : Object.values(value);
};

const collectProductImages = (product: CoCartRawProduct): MediaAssetView[] => {
  const gallery = toArray(product.images ?? [])
    .map((image) => toMediaAsset(image))
    .filter((image): image is MediaAssetView => Boolean(image?.url));

  if (gallery.length > 0) {
    return gallery;
  }

  const primary =
    toMediaAsset(product.image) ?? toMediaAsset(product.featured_image) ?? null;

  return primary ? [primary] : [];
};

const mapCategory = (category: CoCartRawCategory): CatalogCategoryView =>
  catalogCategoryViewSchema.parse({
    id: toStringId(category.id),
    name: category.name?.trim() || "Categoria",
    slug:
      category.slug?.trim() ||
      `categoria-${toStringId(category.id, "sem-id")}`,
    description: stripHtml(category.description),
    image: toMediaAsset(category.image ?? category.thumbnail),
  });

const readCreatedAt = (product: CoCartRawProduct) =>
  product.date_created ??
  product.date_created_gmt ??
  product.dates?.created ??
  product.dates?.created_gmt ??
  new Date(0).toISOString();

const readStockStatus = (product: CoCartRawProduct) =>
  product.stock_status?.trim() || product.stock?.stock_status?.trim() || "unknown";

const readStockQuantity = (product: CoCartRawProduct) =>
  product.stock_quantity !== undefined && product.stock_quantity !== null
    ? toInteger(product.stock_quantity)
    : product.stock?.stock_quantity !== undefined && product.stock?.stock_quantity !== null
      ? toInteger(product.stock.stock_quantity)
      : null;

const readManageStock = (product: CoCartRawProduct) =>
  Boolean(product.manage_stock ?? product.hidden_conditions?.manage_stock);

const readPurchasable = (product: CoCartRawProduct) =>
  Boolean(product.purchasable ?? product.add_to_cart?.is_purchasable);

const unwrapAttributes = (
  attributes?: CoCartRawProduct["attributes"],
) => {
  if (!attributes) {
    return [];
  }

  return Array.isArray(attributes) ? attributes : Object.values(attributes);
};

type CoCartAttributeLike = {
  id?: string | number | null;
  name?: string | null;
  variation?: boolean | null;
  used_for_variation?: boolean | null;
  options?: string[] | Record<string, string> | null;
  option?: string | Record<string, string> | null;
  value?: string | null;
};

const mapAttribute = (attribute: CoCartAttributeLike) => {
  const options = toTextArray(attribute.options).length
    ? toTextArray(attribute.options)
    : toTextArray(
        typeof attribute.option === "string" ? [attribute.option] : attribute.option,
      );

  const value =
    typeof attribute.option === "string"
      ? attribute.option.trim() || undefined
      : (options[0] ?? attribute.value?.trim()) || undefined;

  return {
    id: attribute.id ? String(attribute.id) : undefined,
    name: attribute.name?.trim() || "Atributo",
    type:
      attribute.variation || attribute.used_for_variation ? "variation" : "static",
    value,
    options,
  };
};

const readProductPrice = (product: CoCartRawProduct) => {
  const minorUnit =
    product.prices?.currency?.currency_minor_unit ?? null;
  const currencyCode =
    product.prices?.currency?.currency_code?.trim() ||
    product.prices?.currency?.code?.trim() ||
    product.prices?.currency_code?.trim() ||
    "BRL";

  return {
    current: toDecimalAmount(product.prices?.price ?? product.price ?? 0, minorUnit),
    regular: toDecimalAmount(
      product.prices?.regular_price ?? product.regular_price ?? product.price ?? 0,
      minorUnit,
    ),
    sale:
      product.prices?.sale_price === "" || product.sale_price === ""
        ? null
        : toDecimalAmount(product.prices?.sale_price ?? product.sale_price ?? null, minorUnit),
    currencyCode,
  };
};

export const mapCoCartProductToCatalogProductCardView = (
  product: CoCartRawProduct,
): CatalogProductCardView => {
  const prices = readProductPrice(product);
  const gallery = collectProductImages(product);

  return catalogProductCardViewSchema.parse({
    id: toStringId(product.id),
    slug: product.slug?.trim() || `produto-${toStringId(product.id, "sem-id")}`,
    name: product.name?.trim() || "Produto",
    type: product.type?.trim() || "simple",
    sku: product.sku?.trim() || undefined,
    shortDescription: stripHtml(product.short_description),
    image: gallery[0] ?? null,
    categories: (product.categories ?? []).map(mapCategory),
    price: toMoneyValue(prices.current, prices.currencyCode),
    regularPrice: toMoneyValue(prices.regular, prices.currencyCode),
    salePrice:
      prices.sale !== null && prices.sale !== undefined && `${prices.sale}` !== ""
        ? toMoneyValue(prices.sale, prices.currencyCode)
        : null,
    createdAt: readCreatedAt(product),
    ratingAverage: toNumber(product.average_rating),
    ratingCount: toInteger(product.rating_count ?? product.review_count),
    featured: Boolean(product.featured),
    onSale: Boolean(product.on_sale ?? product.prices?.on_sale),
    stockStatus: readStockStatus(product),
  });
};

export const mapCoCartProductToCatalogProductDetailView = (
  product: CoCartRawProduct,
): CatalogProductDetailView => {
  const card = mapCoCartProductToCatalogProductCardView(product);
  const gallery = collectProductImages(product);

  return catalogProductDetailViewSchema.parse({
    ...card,
    description: product.description ?? undefined,
    gallery,
    attributes: unwrapAttributes(product.attributes).map(mapAttribute),
    purchasable: readPurchasable(product),
    manageStock: readManageStock(product),
    stockQuantity: readStockQuantity(product),
  });
};

const unwrapProductCollection = (payload: CoCartRawProductCollection): CoCartRawProduct[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.items ?? payload.products ?? [];
};

const unwrapCategoryCollection = (
  payload?: CoCartRawCategoryCollection | CoCartRawCategory[] | null,
): CoCartRawCategory[] => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.items ?? payload.categories ?? payload.product_categories ?? [];
};

const readPagination = (
  payload: CoCartRawProductCollection,
  query: CoCartCatalogQuery,
  totalItems: number,
) => {
  if (Array.isArray(payload)) {
    const totalPages = Math.max(1, Math.ceil(totalItems / query.pageSize));

    return {
      currentPage: query.page,
      pageSize: query.pageSize,
      totalItems,
      totalPages,
      hasNextPage: query.page < totalPages,
      hasPreviousPage: query.page > 1,
    };
  }

  const totalPages = Math.max(
    1,
    toInteger(payload.totalPages ?? payload.total_pages ?? 1),
  );
  const currentPage = Math.max(1, toInteger(payload.page || query.page));
  const resolvedTotalItems = Math.max(
    totalItems,
    toInteger(payload.totalItems ?? payload.total_products ?? totalItems),
  );

  return {
    currentPage,
    pageSize: Math.max(
      1,
      toInteger(payload.pageSize ?? payload.page_size ?? query.pageSize),
    ),
    totalItems: resolvedTotalItems,
    totalPages,
    hasNextPage:
      payload.hasNextPage !== undefined && payload.hasNextPage !== null
        ? Boolean(payload.hasNextPage)
        : payload._links?.next
          ? payload._links.next.length > 0
          : currentPage < totalPages,
    hasPreviousPage:
      payload.hasPreviousPage !== undefined && payload.hasPreviousPage !== null
        ? Boolean(payload.hasPreviousPage)
        : payload._links?.prev
          ? payload._links.prev.length > 0
          : currentPage > 1,
  };
};

export const mapCoCartCatalogListing = (
  payload: CoCartRawProductCollection,
  query: CoCartCatalogQuery,
  categoryPayload?: CoCartRawCategoryCollection | CoCartRawCategory[] | null,
): CatalogListingView => {
  const items = unwrapProductCollection(payload).map(
    mapCoCartProductToCatalogProductCardView,
  );
  const payloadCategories = [
    ...unwrapCategoryCollection(Array.isArray(payload) ? [] : payload.categories),
    ...unwrapCategoryCollection(categoryPayload),
  ].map(mapCategory);
  const availableCategories = Array.from(
    new Map(
      [...payloadCategories, ...items.flatMap((item) => item.categories)]
        .map((category) => [category.slug, category] as const),
    ).values(),
  );

  return catalogListingViewSchema.parse({
    items,
    availableCategories,
    pagination: readPagination(payload, query, items.length),
  });
};

const readCartItemImage = (item: CoCartRawCartItem) => {
  const gallery = toArray(item.images ?? [])
    .map((image) => toMediaAsset(image))
    .filter((image): image is MediaAssetView => Boolean(image?.url));

  if (gallery[0]) {
    return gallery[0];
  }

  return toMediaAsset(item.featured_image) ?? toMediaAsset(item.image) ?? null;
};

const readCartItemQuantity = (item: CoCartRawCartItem) => {
  if (isRecord(item.quantity) && ("value" in item.quantity)) {
    return Math.max(1, toInteger(item.quantity.value as string | number | null));
  }

  return Math.max(
    1,
    toInteger(
      (typeof item.quantity === "string" || typeof item.quantity === "number"
        ? item.quantity
        : 1) || 1,
    ),
  );
};

const readCartItemQuantityLimits = (item: CoCartRawCartItem) => {
  if (!isRecord(item.quantity)) {
    return undefined;
  }

  const rawMinPurchase = item.quantity.min_purchase as string | number | null | undefined;
  const rawMaxPurchase = item.quantity.max_purchase as string | number | null | undefined;
  const min = Math.max(1, toInteger(rawMinPurchase ?? 1));

  if (rawMaxPurchase === undefined || rawMaxPurchase === null || rawMaxPurchase === "") {
    return {
      min,
      max: null,
    };
  }

  const max = toInteger(rawMaxPurchase);

  return {
    min,
    max: max < 0 ? null : max,
  };
};

const mapCoupon = (
  coupon: CoCartRawCoupon,
  currencyCode: string,
  currencyMinorUnit?: string | number | null,
) => {
  const rawSaving =
    typeof coupon.saving === "string" || typeof coupon.saving === "number"
      ? coupon.saving
      : undefined;
  const savingIsNumeric =
    typeof rawSaving === "number" ||
    (typeof rawSaving === "string" && /^-?\d+(?:[.,]\d+)?$/.test(rawSaving.trim()));
  const savingsAmount =
    coupon.discount_total ??
    coupon.totals?.discount_total ??
    coupon.totals?.total_discount ??
    (savingIsNumeric ? rawSaving : undefined);
  const savingsDescription =
    typeof rawSaving === "string" && !savingIsNumeric ? rawSaving.trim() : undefined;

  return cocartCouponStateViewSchema.parse({
    code: coupon.code?.trim() || coupon.coupon?.trim() || "coupon",
    label: coupon.label?.trim() || undefined,
    description:
      coupon.description?.trim() ||
      stripHtml(coupon.saving_html) ||
      savingsDescription ||
      undefined,
    type: coupon.discount_type?.trim() || undefined,
    discount:
      savingsAmount !== undefined && savingsAmount !== null && savingsAmount !== ""
        ? toDiscountMoneyValue(
            toCartAmount(savingsAmount, currencyMinorUnit),
            currencyCode,
          )
        : null,
  });
};

const isShippingPackageRecord = (
  value: unknown,
): value is CoCartRawShippingPackage =>
  isRecord(value) &&
  ("rates" in value ||
    "package_name" in value ||
    "formatted_destination" in value ||
    "chosen_method" in value);

const isShippingDetailsRecord = (
  value: unknown,
): value is CoCartRawShippingDetails =>
  isRecord(value) &&
  ("packages" in value ||
    "has_calculated_shipping" in value ||
    "total_packages" in value);

const normalizeShippingRateMetaData = (
  metaData: CoCartRawShippingRate["meta_data"],
) => {
  if (!metaData) {
    return [];
  }

  if (Array.isArray(metaData)) {
    return metaData
      .map((entry, index) => {
        const rawKey =
          typeof entry?.key === "string" && entry.key.trim()
            ? entry.key.trim()
            : entry?.id !== undefined && entry?.id !== null
              ? String(entry.id)
              : `meta-${index + 1}`;
        const label =
          typeof entry?.display_key === "string" && entry.display_key.trim()
            ? entry.display_key.trim()
            : undefined;

        return {
          key: rawKey,
          label,
          value:
            entry?.value !== undefined ? entry.value : (entry?.display_value ?? null),
        };
      })
      .filter((entry) => entry.key.trim().length > 0);
  }

  if (!isRecord(metaData)) {
    return [];
  }

  return Object.entries(metaData).map(([key, value]) => ({
    key,
    label: undefined,
    value,
  }));
};

const readDeliveryForecastDays = (
  metaData: ReturnType<typeof normalizeShippingRateMetaData>,
) => {
  const rawValue = metaData.find((entry) => entry.key === "_delivery_forecast")?.value;

  if (typeof rawValue === "number" && Number.isFinite(rawValue) && rawValue > 0) {
    return Math.trunc(rawValue);
  }

  if (typeof rawValue === "string") {
    const parsed = Number.parseInt(rawValue.trim(), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }

  return undefined;
};

const mapShippingRate = (
  rate: CoCartRawShippingRate,
  currencyCode: string,
  currencyMinorUnit?: string | number | null,
  options?: {
    packageId?: string;
    chosenMethodKey?: string;
  },
): CoCartShippingQuoteView => {
  const metaData = normalizeShippingRateMetaData(rate.meta_data);
  const rateKey = rate.key?.trim() || undefined;
  const resolvedRateId =
    rate.rate_id?.trim() ||
    rateKey ||
    [
      rate.method_id?.trim() || "shipping",
      rate.instance_id !== undefined && rate.instance_id !== null && rate.instance_id !== ""
        ? String(rate.instance_id)
        : options?.packageId || "rate",
    ].join(":");
  const selected = Boolean(
    rate.selected ??
      rate.chosen ??
      rate.chosen_method ??
      (options?.chosenMethodKey &&
        (rateKey === options.chosenMethodKey || resolvedRateId === options.chosenMethodKey)),
  );

  return cocartShippingQuoteViewSchema.parse({
    packageId: options?.packageId,
    rateId: resolvedRateId,
    rateKey,
    methodId: rate.method_id?.trim() || undefined,
    instanceId:
      rate.instance_id !== undefined && rate.instance_id !== null && rate.instance_id !== ""
        ? String(rate.instance_id)
        : undefined,
    label: rate.label?.trim() || rate.name?.trim() || "Entrega",
    description: rate.description?.trim() || rate.html?.trim() || undefined,
    cost: toMoneyValue(
      toCartAmount(rate.cost ?? rate.price ?? 0, currencyMinorUnit),
      currencyCode,
    ),
    selected,
    deliveryForecastDays: readDeliveryForecastDays(metaData),
    metaData,
  });
};

const normalizeShippingPackages = (
  shippingRates:
    | CoCartRawCart["shipping_rates"]
    | CoCartRawCart["shipping"]
    | undefined,
): CoCartRawShippingPackage[] => {
  if (!shippingRates) {
    return [];
  }

  if (isShippingDetailsRecord(shippingRates)) {
    if (!shippingRates.packages) {
      return [];
    }

    return (
      Array.isArray(shippingRates.packages)
        ? shippingRates.packages
        : Object.values(shippingRates.packages)
    ).filter(isShippingPackageRecord);
  }

  const collection = (
    Array.isArray(shippingRates) ? shippingRates : Object.values(shippingRates)
  ) as unknown[];

  if (collection.every((entry) => isShippingPackageRecord(entry))) {
    return collection.filter(isShippingPackageRecord);
  }

  const groupedPackages = new Map<string, CoCartRawShippingPackage>();

  for (const rawRate of collection.filter(
    (entry): entry is CoCartRawShippingRate => isRecord(entry),
  )) {
    const packageId =
      rawRate.package_id === undefined || rawRate.package_id === null || rawRate.package_id === ""
        ? "default"
        : String(rawRate.package_id);
    const existingPackage = groupedPackages.get(packageId) ?? {
      index: packageId,
      package_id: packageId,
      rates: {} as Record<string, CoCartRawShippingRate>,
    };
    const nextRates: Record<string, CoCartRawShippingRate> = isRecord(existingPackage.rates)
      ? { ...existingPackage.rates }
      : {};
    const rateKey =
      rawRate.key?.trim() ||
      rawRate.rate_id?.trim() ||
      `${rawRate.method_id?.trim() || "shipping"}:${packageId}`;

    nextRates[rateKey] = rawRate;
    groupedPackages.set(packageId, {
      ...existingPackage,
      rates: nextRates,
    });
  }

  return Array.from(groupedPackages.values());
};

const readRawShippingDetails = (
  shippingRates:
    | CoCartRawCart["shipping_rates"]
    | CoCartRawCart["shipping"]
    | undefined,
): CoCartRawShippingDetails | null =>
  isShippingDetailsRecord(shippingRates) ? shippingRates : null;

const readCartShippingSource = (cart: CoCartRawCart) =>
  cart.shipping_rates ?? cart.shipping ?? null;

const isShippingDestinationComplete = (cart: CoCartRawCart) => {
  const shippingAddress =
    (cart.customer?.shipping_address as Record<string, unknown> | null | undefined) ?? null;

  if (!shippingAddress) {
    return false;
  }

  const country =
    typeof shippingAddress.shipping_country === "string"
      ? shippingAddress.shipping_country.trim().toUpperCase()
      : "";
  const postcode =
    typeof shippingAddress.shipping_postcode === "string"
      ? shippingAddress.shipping_postcode.trim()
      : "";
  const state =
    typeof shippingAddress.shipping_state === "string"
      ? shippingAddress.shipping_state.trim().toUpperCase()
      : "";

  if (!country || !postcode) {
    return false;
  }

  if (country === "BR") {
    return state.length > 0;
  }

  return true;
};

const resolveShippingState = ({
  cart,
  shippingPackages,
}: {
  cart: CoCartRawCart;
  shippingPackages: CoCartShippingPackageView[];
}) => {
  const hasRates = shippingPackages.some((shippingPackage) => shippingPackage.rates.length > 0);
  const rawShippingDetails = readRawShippingDetails(readCartShippingSource(cart));
  const hasCalculatedShipping = rawShippingDetails?.has_calculated_shipping === true;
  const destinationComplete = isShippingDestinationComplete(cart);

  if (hasRates) {
    return {
      shippingStatus: "rates_available" as const,
      hasCalculatedShipping: true,
      destinationComplete,
    };
  }

  if (!destinationComplete || rawShippingDetails?.has_calculated_shipping === false) {
    return {
      shippingStatus: "destination_incomplete" as const,
      hasCalculatedShipping,
      destinationComplete,
    };
  }

  return {
    shippingStatus: "no_services" as const,
    hasCalculatedShipping,
    destinationComplete,
  };
};

const mapShippingPackage = (
  shippingPackage: CoCartRawShippingPackage,
  currencyCode: string,
  currencyMinorUnit?: string | number | null,
  index = 0,
): CoCartShippingPackageView => {
  const packageId =
    shippingPackage.index !== undefined &&
    shippingPackage.index !== null &&
    shippingPackage.index !== ""
      ? String(shippingPackage.index)
      : shippingPackage.package_id !== undefined &&
          shippingPackage.package_id !== null &&
          shippingPackage.package_id !== ""
        ? String(shippingPackage.package_id)
        : index === 0
          ? "default"
          : `package-${index + 1}`;
  const chosenMethodKey = shippingPackage.chosen_method?.trim() || undefined;
  const rates = toArray(shippingPackage.rates).map((rate) =>
    mapShippingRate(rate, currencyCode, currencyMinorUnit, {
      packageId,
      chosenMethodKey,
    }),
  );
  const chosenRate =
    rates.find((rate) => rate.selected) ||
    rates.find((rate) => rate.rateId === chosenMethodKey || rate.rateKey === chosenMethodKey);

  return cocartShippingPackageViewSchema.parse({
    packageId,
    packageName: shippingPackage.package_name?.trim() || undefined,
    packageDetails: shippingPackage.package_details?.trim() || undefined,
    formattedDestination: shippingPackage.formatted_destination?.trim() || undefined,
    chosenRateId: chosenRate?.rateId ?? chosenMethodKey,
    rates,
  });
};

const readCartTotals = (cart: CoCartRawCart): CoCartTotalsView => {
  const totals = cart.totals;
  const currencyCode = cart.currency?.currency_code?.trim() || toCurrencyCode(totals);
  const currencyMinorUnit = cart.currency?.currency_minor_unit;

  return {
    subtotal: toMoneyValue(
      toCartAmount(totals?.subtotal ?? totals?.total_subtotal ?? 0, currencyMinorUnit),
      currencyCode,
    ),
    total: toMoneyValue(toCartAmount(totals?.total ?? 0, currencyMinorUnit), currencyCode),
    discountTotal:
      totals?.discount_total !== undefined || totals?.total_discount !== undefined
        ? toDiscountMoneyValue(
            toCartAmount(
              totals?.discount_total ?? totals?.total_discount ?? 0,
              currencyMinorUnit,
            ),
            currencyCode,
          )
        : null,
    shippingTotal:
      totals?.shipping_total !== undefined || totals?.total_shipping !== undefined
        ? toMoneyValue(
            toCartAmount(
              totals?.shipping_total ?? totals?.total_shipping ?? 0,
              currencyMinorUnit,
            ),
            currencyCode,
          )
        : null,
    feeTotal:
      totals?.fee_total !== undefined || totals?.total_fees !== undefined
        ? toMoneyValue(
            toCartAmount(totals?.fee_total ?? totals?.total_fees ?? 0, currencyMinorUnit),
            currencyCode,
          )
        : null,
    taxTotal:
      totals?.total_tax !== undefined
        ? toMoneyValue(
            toCartAmount(totals?.total_tax ?? 0, currencyMinorUnit),
            currencyCode,
          )
        : null,
  };
};

export const mapCoCartCartState = (cart: CoCartRawCart): CoCartCartStateView => {
  const totals = readCartTotals(cart);
  const currencyCode = totals.total.currencyCode;
  const currencyMinorUnit = cart.currency?.currency_minor_unit;
  const items = toArray(cart.items ?? cart.cart?.items).map((item, index) => {
    const quantity = readCartItemQuantity(item);
    const quantityLimits = readCartItemQuantityLimits(item);
    const subtotalSource =
      item.totals?.subtotal ?? item.totals?.line_subtotal ?? item.price ?? 0;
    const subtotalAmount = toCartAmount(subtotalSource, currencyMinorUnit);
    const totalAmount = toCartAmount(
      item.totals?.total ??
        item.totals?.line_total ??
        item.totals?.subtotal ??
        item.totals?.line_subtotal ??
        item.price ??
        0,
      currencyMinorUnit,
    );
    const unitAmount =
      item.prices?.price !== undefined && item.prices?.price !== null
        ? toCartAmount(
            item.prices.price,
            item.prices.currency?.currency_minor_unit ?? currencyMinorUnit,
          )
        : quantity > 0
          ? subtotalAmount / quantity
          : subtotalAmount;

    return cocartCartItemViewSchema.parse({
      itemKey:
        item.item_key?.trim() ||
        item.key?.trim() ||
        `cart-item-${item.product_id ?? item.variation_id ?? item.id ?? index}`,
      productId:
        item.product_id ??
        item.variation_id ??
        item.id ??
        item.item_key ??
        item.key ??
        `cart-item-${index}`,
      variationId:
        item.variation_id !== undefined && item.variation_id !== null && item.variation_id !== ""
          ? String(item.variation_id)
          : undefined,
      quantity,
      quantityLimits,
      subtotal: toMoneyValue(subtotalAmount, currencyCode),
      total: toMoneyValue(totalAmount, currencyCode),
      unitPrice: toMoneyValue(unitAmount, currencyCode),
      name: item.name?.trim() || item.title?.trim() || "Produto",
      image: readCartItemImage(item),
    });
  });

  const coupons = toArray(cart.coupons ?? cart.applied_coupons).map((coupon) =>
    mapCoupon(coupon, currencyCode, currencyMinorUnit),
  );
  const shippingPackages = normalizeShippingPackages(readCartShippingSource(cart)).map(
    (shippingPackage, index) =>
      mapShippingPackage(
        shippingPackage,
        currencyCode,
        currencyMinorUnit,
        index,
      ),
  );
  const shippingRates = shippingPackages.flatMap((shippingPackage) => shippingPackage.rates);
  const shippingState = resolveShippingState({
    cart,
    shippingPackages,
  });

  return cocartCartStateViewSchema.parse({
    items,
    customer: mapCartCustomer(cart),
    subtotal: totals.subtotal,
    total: totals.total,
    couponCode: coupons[0]?.code,
    couponDiscount: coupons[0]?.discount ?? totals.discountTotal ?? null,
    coupons,
    shippingPackages,
    shippingRates,
    shippingStatus: shippingState.shippingStatus,
    hasCalculatedShipping: shippingState.hasCalculatedShipping,
    shippingDestinationComplete: shippingState.destinationComplete,
    shippingTotal: totals.shippingTotal ?? null,
    feeTotal: totals.feeTotal ?? null,
    taxTotal: totals.taxTotal ?? null,
    sessionKey: cart.session_key?.trim() || cart.cart_key?.trim() || undefined,
    cartHash: cart.cart_hash?.trim() || undefined,
  });
};

const toAddress = (value?: Record<string, unknown> | null) => {
  if (!value) {
    return null;
  }

  return {
    firstName: typeof value.first_name === "string" ? value.first_name : undefined,
    lastName: typeof value.last_name === "string" ? value.last_name : undefined,
    company: typeof value.company === "string" ? value.company : undefined,
    addressLine1: typeof value.address_1 === "string" ? value.address_1 : undefined,
    addressLine2: typeof value.address_2 === "string" ? value.address_2 : undefined,
    city: typeof value.city === "string" ? value.city : undefined,
    postcode: typeof value.postcode === "string" ? value.postcode : undefined,
    country: typeof value.country === "string" ? value.country : undefined,
    state: typeof value.state === "string" ? value.state : undefined,
    email: typeof value.email === "string" ? value.email : undefined,
    phone: typeof value.phone === "string" ? value.phone : undefined,
  };
};

const toPrefixedAddress = (
  value: Record<string, unknown> | null | undefined,
  prefix: "billing" | "shipping",
) => {
  if (!value) {
    return null;
  }

  return toAddress({
    first_name:
      typeof value[`${prefix}_first_name`] === "string"
        ? value[`${prefix}_first_name`]
        : undefined,
    last_name:
      typeof value[`${prefix}_last_name`] === "string"
        ? value[`${prefix}_last_name`]
        : undefined,
    address_1:
      typeof value[`${prefix}_address_1`] === "string"
        ? value[`${prefix}_address_1`]
        : undefined,
    address_2:
      typeof value[`${prefix}_address_2`] === "string"
        ? value[`${prefix}_address_2`]
        : undefined,
    city:
      typeof value[`${prefix}_city`] === "string"
        ? value[`${prefix}_city`]
        : undefined,
    postcode:
      typeof value[`${prefix}_postcode`] === "string"
        ? value[`${prefix}_postcode`]
        : undefined,
    country:
      typeof value[`${prefix}_country`] === "string"
        ? value[`${prefix}_country`]
        : undefined,
    state:
      typeof value[`${prefix}_state`] === "string"
        ? value[`${prefix}_state`]
        : undefined,
    phone:
      prefix === "billing" && typeof value.billing_phone === "string"
        ? value.billing_phone
        : undefined,
    email:
      prefix === "billing" && typeof value.billing_email === "string"
        ? value.billing_email
        : undefined,
  });
};

const mapCartCustomer = (cart: CoCartRawCart): AccountCustomerView | null => {
  const billingAddress = toPrefixedAddress(
    (cart.customer?.billing_address as Record<string, unknown> | null | undefined) ?? null,
    "billing",
  );
  const shippingAddress = toPrefixedAddress(
    (cart.customer?.shipping_address as Record<string, unknown> | null | undefined) ?? null,
    "shipping",
  );
  const email = billingAddress?.email;
  const displayName =
    [billingAddress?.firstName, billingAddress?.lastName].filter(Boolean).join(" ") ||
    email ||
    undefined;

  if (!billingAddress && !shippingAddress && !email) {
    return null;
  }

  return accountCustomerViewSchema.parse({
    id: "0",
    email,
    displayName,
    billingAddress,
    shippingAddress,
  });
};

export const mapCoCartCustomerToAccountCustomerView = (
  customer: CoCartRawCustomer,
): AccountCustomerView =>
  accountCustomerViewSchema.parse({
    id: toStringId(customer.id),
    email: customer.email?.trim() || undefined,
    displayName:
      [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
      customer.username ||
      undefined,
    billingAddress: toAddress(customer.billing_address ?? customer.billing),
    shippingAddress: toAddress(customer.shipping_address ?? customer.shipping),
  });

export const mapCoCartOrderToAccountOrderSummaryView = (
  order: CoCartRawOrder,
): CoCartAccountOrderSummaryView => {
  const currencyCode = "BRL";

  return cocartAccountOrderSummaryViewSchema.parse({
    id: toStringId(order.id),
    number: toStringId(order.number ?? order.id),
    status: {
      code: order.status?.trim() || "unknown",
      label: humanizeStatus(order.status),
    },
    total: toMoneyValue(order.total ?? 0, currencyCode),
    createdAt: order.date_created ?? new Date(0).toISOString(),
    paymentMethodTitle: order.payment_method_title?.trim() || undefined,
    items: (order.line_items ?? []).map((item, index) =>
      accountOrderItemViewSchema.parse({
        id:
          item.id !== undefined && item.id !== null
            ? String(item.id)
            : undefined,
        productId:
          item.product_id !== undefined && item.product_id !== null
            ? String(item.product_id)
            : undefined,
        productName: item.name?.trim() || "Produto",
        quantity: Math.max(1, toInteger(item.quantity || 1)),
        total: toMoneyValue(item.total ?? item.subtotal ?? 0, currencyCode),
        sku: undefined,
        image: toMediaAsset(item.image),
      }),
    ),
  });
};

export const mapCoCartOrderToOrderSummaryView = (
  order: CoCartRawOrder,
): CoCartOrderSummaryView => {
  const currencyCode = "BRL";
  const baseOrder = checkoutOrderConfirmationViewSchema.parse({
    orderId: toStringId(order.id),
    orderNumber: toStringId(order.number ?? order.id),
    status: {
      code: order.status?.trim() || "unknown",
      label: humanizeStatus(order.status),
    },
    createdAt: order.date_created ?? new Date(0).toISOString(),
    total: toMoneyValue(order.total ?? 0, currencyCode),
    paymentMethodTitle: order.payment_method_title?.trim() || undefined,
    shippingAddress: toAddress(order.shipping) ?? {},
    billingAddress: toAddress(order.billing) ?? {},
    items: (order.line_items ?? []).map((item, index) => {
      const quantity = Math.max(1, toInteger(item.quantity || 1));
      const total = toMoneyValue(item.total ?? item.subtotal ?? 0, currencyCode);

      return checkoutCartItemViewSchema.parse({
        productId:
          item.product_id ?? item.id ?? `order-item-${toStringId(order.id)}-${index}`,
        quantity,
        total,
        unitPrice: toMoneyValue(total.amount / quantity, currencyCode),
        name: item.name?.trim() || "Produto",
        image: toMediaAsset(item.image),
      });
    }),
    couponCode: order.coupon_lines?.[0]?.code?.trim() || undefined,
    couponDiscount: order.coupon_lines?.[0]?.discount
      ? toDiscountMoneyValue(order.coupon_lines[0].discount, currencyCode)
      : null,
  });

  return cocartOrderSummaryViewSchema.parse({
    ...baseOrder,
    needsPayment: baseOrder.status.code === "pending",
  });
};

const mapUser = (rawUser?: CoCartRawSession["user"] | null) => {
  if (!rawUser) {
    return null;
  }

  return authUserViewSchema.parse({
    id: toStringId(rawUser.id),
    email: rawUser.email?.trim() || undefined,
    username: rawUser.username?.trim() || undefined,
    displayName:
      rawUser.display_name?.trim() ||
      [rawUser.first_name, rawUser.last_name].filter(Boolean).join(" ") ||
      rawUser.username ||
      "Cliente",
    firstName: rawUser.first_name?.trim() || undefined,
    lastName: rawUser.last_name?.trim() || undefined,
    avatar: toMediaAsset(rawUser.avatar),
    roleLabels: (rawUser.roles ?? []).filter(Boolean),
  });
};

export const mapCoCartLoginResponseToAuthLoginResult = (
  response: CoCartRawLoginResponse | null | undefined,
): CoCartAuthLoginResult => {
  const roleLabels = response?.role
    ? response.role
        .split(",")
        .map((role) => role.trim())
        .filter(Boolean)
    : [];

  const session = authSessionViewSchema.parse({
    isAuthenticated: true,
    user: {
      id: toStringId(response?.user_id),
      email: response?.email?.trim() || undefined,
      username: response?.username?.trim() || undefined,
      displayName:
        response?.display_name?.trim() ||
        [response?.first_name, response?.last_name].filter(Boolean).join(" ") ||
        response?.username?.trim() ||
        response?.email?.trim() ||
        "Cliente",
      firstName: response?.first_name?.trim() || undefined,
      lastName: response?.last_name?.trim() || undefined,
      avatar: toMediaAsset(response?.avatar_urls),
      roleLabels,
    },
  });

  return cocartAuthLoginResultSchema.parse({
    session,
    tokens: cocartAuthTokensSchema.parse({
      accessToken: response?.extras?.jwt_token,
      refreshToken: response?.extras?.jwt_refresh?.trim() || undefined,
    }),
  });
};

export const mapCoCartSessionToAuthUserView = (
  session: CoCartRawSession | null | undefined,
): AuthUserView | null => mapUser(session?.user);

export const mapCoCartSessionToAuthSessionView = (
  session: CoCartRawSession | null | undefined,
): AuthSessionView => {
  const user = mapCoCartSessionToAuthUserView(session);
  const isAuthenticated = Boolean(session?.isAuthenticated ?? session?.authenticated ?? user);

  return authSessionViewSchema.parse({
    isAuthenticated,
    user,
  });
};

export const mapCoCartSessionState = (
  session: CoCartRawSession | null | undefined,
): CoCartSessionStateView =>
  cocartSessionStateViewSchema.parse({
    capabilities: defaultCoCartCapabilities,
    session: mapCoCartSessionToAuthSessionView(session),
  });
