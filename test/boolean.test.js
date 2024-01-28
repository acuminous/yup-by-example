const { before, beforeEach, after, afterEach, describe, it } = require('zunit');
const { boolean } = require('yup');
const { Stats } = require('fast-stats');

const { eq, gte, lte, isBoolean } = require('./assert');
const sample = require('./sample');
const TestDataFactory = require('../src/TestDataFactory');

describe('boolean generator', () => {

  beforeEach(() => {
    TestDataFactory.init();
  });

  it('should generate random booleans', async () => {
    const schema = boolean().example();
    const { counts, values } = await sample(1000, () => TestDataFactory.generateValid(schema));

    const stats = new Stats().push(counts);
    const [lower, upper] = stats.range();

    eq(counts.length, 2);
    eq(upper + lower, 1000);
    lte(lower, 500);
    gte(upper, 500);
    values.forEach(isBoolean);
  });

  it('should obey specified one of values', async () => {
    const schema = boolean().oneOf([true]).example();
    for (let i = 0; i < 1000; i++) {
      const value = await TestDataFactory.generateValid(schema);
      eq(value, true);
    }
  });
});
