module.exports = {
  sample: async (n, generate, transform = v => v) => {
    const results = {};
    for (let i = 0; i < n; i++) {
      const value = await generate(i);
      const key = transform(value);
      results[key] ? results[key] = results[key] + 1 : results[key] = 1;
    }
    return {
      counts: Object.values(results),
      values: Object.keys(results),
    }
  },
  expectMostlyFloatingPoints: (values) => {
    const threshold = Math.floor(values.length * 0.1)
    let failures = 0;
    values.forEach(value => {
      if (Math.floor(value) === Number(value)) failures++;
    });
    expect(failures).to.be.below(threshold);
  },
  expectAllIntegers: (values) => {
    values.forEach(value => {
      expect(Math.floor(value)).to.equal(Number(value));
    });
  },
  expectAllStrings: (values) => {
    values.forEach(value => {
      expect(value).to.be.a('string');
    });
  },
  expectAllBooleans: (values) => {
    values.forEach(value => {
      expect(value).to.be.oneOf(['true', 'false']);
    });
  },
  expectAllDates: (values) => {
    values.forEach(value => {
      expect(value).to.be.an.instanceof(Date);
      /* eslint-disable-next-line no-unused-expressions */
      expect(value.valueOf()).to.not.be.NaN;
    });
  }
}
