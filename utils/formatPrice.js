export function formatPeso(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "₱ —";
  const n = Number(amount);
  return `₱ ${n.toLocaleString("en-PH")}`;
}
