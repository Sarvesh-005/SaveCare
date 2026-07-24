export function formatMoney(cents: number): string {
  const dollars = cents / 100;
  return dollars.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function parseMoney(input: string): number {
  if (!input) return 0;
  const cleaned = input.replace(/[^0-9.-]/g, '');
  const n = parseFloat(cleaned);
  if (isNaN(n)) return 0;
  return Math.round(n * 100);
}

export function sumItems(items: { amount_cents: number }[]): number {
  return items.reduce((sum, i) => sum + (i.amount_cents || 0), 0);
}
