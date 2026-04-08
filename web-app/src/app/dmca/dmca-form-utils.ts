import type { DmcaFormField, DmcaFormItem } from "@vigilart/shared/types";

export type Primitive = string | number | boolean | null;
export type JsonLike = Primitive | JsonLike[] | { [key: string]: JsonLike };
export type PathPart = string | number;

export type ArtworkPrefill = {
  artworkId?: string;
  artworkTitle?: string;
  artworkDescription?: string;
  mostRecentSource?: string;
  originalWorkUrl?: string;
  infringingUrls?: string[];
};

export type ProfileFormState = {
  fullName: string;
  street: string;
  aptSuite: string;
  city: string;
  postalCode: string;
  country: string;
  email: string;
  phone: string;
  signature: string;
};

export const EMPTY_PROFILE: ProfileFormState = {
  fullName: "",
  street: "",
  aptSuite: "",
  city: "",
  postalCode: "",
  country: "",
  email: "",
  phone: "",
  signature: "",
};

const PROFILE_KEY_MAP: Record<string, keyof ProfileFormState> = {
  full_name: "fullName",
  street: "street",
  apt: "aptSuite",
  city: "city",
  postal_code: "postalCode",
  country: "country",
  email: "email",
  phone_number: "phone",
  signature: "signature",
};

export type InfringingRepeaterDescriptor = {
  path: PathPart[];
  itemSchema: DmcaFormItem[];
  minItems: number;
};

export const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const deepClone = <T,>(value: T): T => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
};

export const inputTypeFromField = (field: DmcaFormField) => {
  if (field.type === "number") return "number";
  if (field.type === "url") return "url";
  if (field.type === "email") return "email";
  return "text";
};

export const parseArtworkPrefill = (rawPrefill: string | null): ArtworkPrefill => {
  if (!rawPrefill) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawPrefill) as ArtworkPrefill;
    return {
      ...parsed,
      infringingUrls: Array.isArray(parsed.infringingUrls) ? parsed.infringingUrls.filter(Boolean) : [],
    };
  } catch {
    return {};
  }
};

const createDefaultValueForField = (field: DmcaFormField): Primitive => {
  if (field.type === "number") {
    return "";
  }

  return "";
};

const createDefaultValueForItem = (
  item: DmcaFormItem,
  prefill: ArtworkPrefill,
  repeatIndex?: number,
): JsonLike => {
  if (item.kind === "field") {
    if (item.key === "original_work_description") {
      return prefill.artworkTitle || prefill.artworkDescription || "";
    }

    if (item.key === "original_work_url") {
      return prefill.originalWorkUrl ?? "";
    }

    return createDefaultValueForField(item);
  }

  if (item.kind === "group") {
    return createDefaultValueForItems(item.items, prefill);
  }

  const minItems = item.minItems ?? 0;
  return Array.from({ length: minItems }, () => createDefaultValueForItems(item.itemSchema, prefill, repeatIndex));
};

export const createDefaultValueForItems = (
  items: DmcaFormItem[],
  prefill: ArtworkPrefill,
  repeatIndex?: number,
): Record<string, JsonLike> => {
  return items.reduce<Record<string, JsonLike>>((acc, item) => {
    acc[item.key] = createDefaultValueForItem(item, prefill, repeatIndex);
    return acc;
  }, {});
};

export const setAtPath = (source: JsonLike, path: PathPart[], value: JsonLike): JsonLike => {
  if (path.length === 0) return value;

  const [head, ...rest] = path;

  if (typeof head === "number") {
    const current = Array.isArray(source) ? [...source] : [];
    current[head] = setAtPath((current[head] as JsonLike) ?? {}, rest, value);
    return current;
  }

  const currentObject = isObjectRecord(source) ? { ...source } : {};
  currentObject[head] = setAtPath((currentObject[head] as JsonLike) ?? {}, rest, value);
  return currentObject as JsonLike;
};

export const getAtPath = (source: JsonLike, path: PathPart[]): JsonLike | undefined => {
  let current: JsonLike | undefined = source;

  for (const part of path) {
    if (current === undefined || current === null) return undefined;

    if (typeof part === "number") {
      if (!Array.isArray(current)) return undefined;
      current = current[part];
      continue;
    }

    if (!isObjectRecord(current)) return undefined;
    current = current[part] as JsonLike;
  }

  return current;
};

export const hydrateProfileInPayload = (
  source: JsonLike,
  profile: ProfileFormState,
): JsonLike => {
  if (Array.isArray(source)) {
    return source.map((entry) => hydrateProfileInPayload(entry, profile));
  }

  if (!isObjectRecord(source)) {
    return source;
  }

  const next: Record<string, JsonLike> = {};

  for (const [key, value] of Object.entries(source)) {
    const mappedProfileKey = PROFILE_KEY_MAP[key];

    if (mappedProfileKey && (value === "" || value === null || value === undefined)) {
      const profileValue = profile[mappedProfileKey];
      next[key] = profileValue || "";
      continue;
    }

    next[key] = hydrateProfileInPayload(value as JsonLike, profile);
  }

  return next;
};

export const findInfringingRepeaters = (
  items: DmcaFormItem[],
  basePath: PathPart[] = [],
): InfringingRepeaterDescriptor[] => {
  const found: InfringingRepeaterDescriptor[] = [];

  for (const item of items) {
    const currentPath = [...basePath, item.key];

    if (item.kind === "group") {
      found.push(...findInfringingRepeaters(item.items, currentPath));
      continue;
    }

    if (item.kind === "array") {
      const hasInfringingUrlField = item.itemSchema.some(
        (schemaItem) => schemaItem.kind === "field" && schemaItem.key === "infringing_url",
      );

      if (hasInfringingUrlField) {
        found.push({
          path: currentPath,
          itemSchema: item.itemSchema,
          minItems: item.minItems ?? 0,
        });
      }

      found.push(...findInfringingRepeaters(item.itemSchema, currentPath));
    }
  }

  return found;
};

export const clearPreselectedInfringingUrls = (
  payload: JsonLike,
  repeaters: InfringingRepeaterDescriptor[],
): JsonLike => {
  let nextPayload = deepClone(payload);

  for (const repeater of repeaters) {
    const resetRows = Array.from(
      { length: repeater.minItems },
      () => createDefaultValueForItems(repeater.itemSchema, {}),
    );
    nextPayload = setAtPath(nextPayload, repeater.path, resetRows);
  }

  return nextPayload;
};
