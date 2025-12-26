export function moveItems<T>(source: T[], target: T[]): void {
  const item = source.pop();
  if (item !== undefined) target.unshift(item);
}

export function moveToTopPreserveOrder<T>(
  source: T[],
  targetStack: T[],
  predicate: (item: T) => boolean
): void {
  // Najdi všechny objekty podle podmínky v původním pořadí
  const itemsToMove = source.filter(predicate);

  // Odstraň je z původního pole (mutace)
  const remaining = source.filter((item) => !predicate(item));
  source.length = 0;
  source.push(...remaining);

  // Přidej je na zásobník ve stejném pořadí
  targetStack.unshift(...itemsToMove);
}
