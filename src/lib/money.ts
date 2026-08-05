export function formatMoney(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function parseMoney(input: string): number {
  if (!input) return 0;
  const n = parseFloat(input.replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? 0 : Math.round(n * 100);
}

export function sumItems(items: { amount_cents: number }[]): number {
  return items.reduce((s, i) => s + (i.amount_cents || 0), 0);
}
