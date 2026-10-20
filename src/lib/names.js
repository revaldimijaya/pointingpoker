// Names are stored as "<name>#<id suffix>"; show only the part the user typed.
export function displayName(name) {
  const suffixStart = name.lastIndexOf('#');
  return suffixStart === -1 ? name : name.slice(0, suffixStart);
}
