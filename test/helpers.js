export let sample = (n, generate, transform = v => v) => {
  const results = {};
  for (let i = 0; i < n; i++) {
    const value = generate(i);
    const key = transform(value);
    results[key] ? results[key] = results[key] + 1 : results[key] = 1;
  }
  return {
    counts: Object.values(results),
    values: Object.keys(results),
  }
}

