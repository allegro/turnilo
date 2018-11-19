export function inGroupsOf<Type>(array: Type[], n: number): Type[][] {
  let index = -n;
  const groups = [];

  while ((index += n) < array.length) {
    groups.push(array.slice(index, index + n));
  }

  return groups;
}
