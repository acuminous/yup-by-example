module.exports = async function sample(n, generate, transform = (v) => v) {
  const results = {};
  for (let i = 0; i < n; i++) {
    const value = await generate(i);
    const key = transform(value);
    if (results[key]) results[key] += 1;
    else results[key] = 1;
  }
  return {
    counts: Object.values(results),
    values: Object.keys(results),
  };
};
