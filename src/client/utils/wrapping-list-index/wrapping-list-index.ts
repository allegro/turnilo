export function wrappingListIndex(currentIndex: number, listLength: number, change: number) {
  const newIndex = currentIndex + change;

  if (newIndex > listLength) return 0;
  if (newIndex < 0) return listLength - 1;

  return newIndex;
}
