export function normalisePath(path: string) {
  return path.replace(/^\//, "").replace(/\/$/, "");
}
