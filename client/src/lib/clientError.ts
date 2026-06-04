export const formatClientError = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof Event !== 'undefined' && error instanceof Event) {
    const target = error.target as HTMLElement | null;
    const source =
      target?.getAttribute?.('src') ||
      target?.getAttribute?.('href') ||
      target?.tagName?.toLowerCase();
    return source ? `Browser event "${error.type}" from ${source}` : `Browser event "${error.type}"`;
  }
  if (typeof error === 'string') return error;

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

export const logClientWarning = (message: string, error: unknown) => {
  console.warn(`${message}: ${formatClientError(error)}`);
};
