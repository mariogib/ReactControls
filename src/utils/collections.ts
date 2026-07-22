export function getUniqueSortedValues<T>(items: readonly T[], select: (item: T) => string): string[] {
  return Array.from(new Set(items.map(select))).sort();
}
