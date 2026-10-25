export function action(type, key, value, error = false) {
  const a = {
    type,
    payload: { key, value },
  };
  if (error) {
    a.error = true;
  }
  return a;
}
