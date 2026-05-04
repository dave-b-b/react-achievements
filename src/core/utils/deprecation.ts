const warnedMessages = new Set<string>();

export function warnDeprecation(message: string): void {
  const isProduction =
    typeof globalThis !== 'undefined' &&
    (globalThis as any).process?.env?.NODE_ENV === 'production';

  if (isProduction || warnedMessages.has(message)) {
    return;
  }

  warnedMessages.add(message);
  console.warn(`[react-achievements] ${message}`);
}
