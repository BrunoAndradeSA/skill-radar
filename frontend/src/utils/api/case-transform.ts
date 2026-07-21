const SNAKE_CASE_REGEX = /_([a-z])/g;
const CAMEL_CASE_REGEX = /[A-Z]/g;
const ID_REGEX = /^id$|_ids?$/i;
const CAMEL_ID_REGEX = /^id$|Ids?$/;

function snakeToCamel(str: string): string {
  return str.replace(SNAKE_CASE_REGEX, (_, letter) => letter.toUpperCase());
}

function camelToSnake(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1).replace(CAMEL_CASE_REGEX, (letter) => `_${letter.toLowerCase()}`);
}

export function transformKeysToCamel<T = unknown>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(transformKeysToCamel) as unknown as T;
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([key, value]) => {
        const camelKey = snakeToCamel(key);
        const isIdKey = ID_REGEX.test(key);
        const newValue = isIdKey && typeof value === 'number'
          ? String(value)
          : isIdKey && Array.isArray(value) && value.every((v): v is number => typeof v === 'number')
            ? value.map(String)
            : transformKeysToCamel(value);
        return [camelKey, newValue];
      }),
    ) as T;
  }
  return obj;
}

export function transformKeysToSnake<T = unknown>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(transformKeysToSnake) as unknown as T;
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([key, value]) => {
        const snakeKey = camelToSnake(key);
        const isIdKey = CAMEL_ID_REGEX.test(key);
        const newValue = isIdKey && typeof value === 'string' && /^\d+$/.test(value)
          ? Number(value)
          : isIdKey && Array.isArray(value) && value.every((v): v is string => typeof v === 'string' && /^\d+$/.test(v))
            ? value.map(Number)
            : transformKeysToSnake(value);
        return [snakeKey, newValue];
      }),
    ) as T;
  }
  return obj;
}
