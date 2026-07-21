const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function emailHelperText(value: string): string | undefined {
  if (!value.trim()) return undefined;
  return isValidEmail(value) ? undefined : 'Informe um e-mail válido';
}
