// Minimal client for the Open Food Facts public API.
// Docs: https://openfoodfacts.github.io/openfoodfacts-server/api/

const BASE_URL = "https://world.openfoodfacts.org";
const USER_AGENT = "MyFitnessPalClone/1.0 (Expo React Native)";

const FIELDS =
  "code,product_name,brands,nutriments,serving_size,serving_quantity,quantity";

export interface FoodItem {
  id: string;
  barcode?: string;
  name: string;
  brand?: string;
  verified: boolean;
  servingLabel: string;
  caloriesPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  proteinPerServing: number;
  fiberPerServing?: number;
  sugarsPerServing?: number;
  saturatedFatPerServing?: number;
  sodiumMgPerServing?: number;
}

interface OffNutriments {
  [key: string]: number | string | undefined;
}

interface OffProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  nutriments?: OffNutriments;
  serving_size?: string;
  serving_quantity?: number | string;
  quantity?: string;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function parseServingGrams(product: OffProduct): number | undefined {
  const quantity = toNumber(product.serving_quantity);
  if (quantity && quantity > 0) return quantity;

  const match = product.serving_size?.match(/([\d.]+)\s*g/i);
  if (match) {
    const grams = Number(match[1]);
    if (Number.isFinite(grams) && grams > 0) return grams;
  }
  return undefined;
}

function pickNutrient(
  nutriments: OffNutriments,
  base: string,
  servingGrams: number | undefined
): number {
  const perServing = toNumber(nutriments[`${base}_serving`]);
  if (perServing !== undefined) return perServing;

  const per100g = toNumber(nutriments[`${base}_100g`]);
  if (per100g !== undefined) {
    if (servingGrams) return (per100g * servingGrams) / 100;
    return per100g;
  }
  return 0;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function normalizeProduct(product: OffProduct | undefined): FoodItem | null {
  if (!product) return null;
  const name = product.product_name?.trim();
  if (!name) return null;

  const nutriments = product.nutriments ?? {};
  const servingGrams = parseServingGrams(product);

  const servingLabel = product.serving_size?.trim()
    ? product.serving_size.trim()
    : servingGrams
      ? `${servingGrams} g`
      : "100 g";

  return {
    id: product.code ?? `${name}-${Date.now()}`,
    barcode: product.code,
    name,
    brand: product.brands?.split(",")[0]?.trim(),
    verified: !!product.code,
    servingLabel,
    caloriesPerServing: round(
      pickNutrient(nutriments, "energy-kcal", servingGrams)
    ),
    carbsPerServing: round(
      pickNutrient(nutriments, "carbohydrates", servingGrams)
    ),
    fatPerServing: round(pickNutrient(nutriments, "fat", servingGrams)),
    proteinPerServing: round(
      pickNutrient(nutriments, "proteins", servingGrams)
    ),
    fiberPerServing: round(pickNutrient(nutriments, "fiber", servingGrams)),
    sugarsPerServing: round(pickNutrient(nutriments, "sugars", servingGrams)),
    saturatedFatPerServing: round(
      pickNutrient(nutriments, "saturated-fat", servingGrams)
    ),
    sodiumMgPerServing: round(
      pickNutrient(nutriments, "sodium", servingGrams) * 1000
    ),
  };
}

export async function getProductByBarcode(
  barcode: string
): Promise<FoodItem | null> {
  const response = await fetch(
    `${BASE_URL}/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${FIELDS}`,
    { headers: { "User-Agent": USER_AGENT } }
  );

  if (!response.ok) return null;

  const data = (await response.json()) as {
    status?: number;
    product?: OffProduct;
  };

  if (data.status !== 1 || !data.product) return null;

  return normalizeProduct(data.product);
}

export async function searchProducts(
  query: string,
  pageSize = 25
): Promise<FoodItem[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const params = new URLSearchParams({
    search_terms: trimmed,
    search_simple: "1",
    action: "process",
    json: "1",
    page_size: String(pageSize),
    fields: FIELDS,
  });

  const response = await fetch(`${BASE_URL}/cgi/search.pl?${params}`, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) return [];

  const data = (await response.json()) as { products?: OffProduct[] };

  return (data.products ?? [])
    .map(normalizeProduct)
    .filter((item): item is FoodItem => item !== null);
}
