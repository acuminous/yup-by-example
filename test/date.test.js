const { before, beforeEach, after, afterEach, describe, it } = require('zunit');
const { date } = require('yup');
const { Stats } = require('fast-stats');

const { gt, gte, lt, lte, includes, isDate } = require('./assert');
const sample = require('./sample');
const TestDataFactory = require('../src/TestDataFactory');

describe('date generator', () => {

  beforeEach(() => {
    TestDataFactory.init();
  });

  it('should generate random dates', async () => {
    const schema = date().example();
    const { values } = await sample(1000, () => TestDataFactory.generateValid(schema));
    gt(values.length, 900);

    const dates = await Promise.all(new Array(1000).fill(null).map(() => TestDataFactory.generateValid(schema)));
    dates.forEach(isDate);
  });

  it('should obey specified min dates', async () => {
    const minDate = new Date('2000-01-01T00:00:00.000Z');
    const schema = date().min(minDate).example();
    const dates = await Promise.all(new Array(1000).fill(null).map(() => TestDataFactory.generateValid(schema)));
    dates.forEach((actual) => gte(actual, minDate));
  });

  it('should obey specified max dates', async () => {
    const maxDate = new Date('2000-01-01T00:00:00.000Z');
    const schema = date().max(maxDate).example();
    const dates = await Promise.all(new Array(1000).fill(null).map(() => TestDataFactory.generateValid(schema)));
    dates.forEach((actual) => lte(actual, maxDate));
  });

  it('should obey specified one of values', async () => {
    const schema = date().oneOf([new Date(1), new Date(2), new Date(3)]).example();
    const { counts, values } = await sample(999, () => TestDataFactory.generateValid(schema), (v) => v.getTime());

    const stats = new Stats().push(counts);
    const [lower, upper] = stats.range();

    lt(lower, 333);
    gt(upper, 333);
    values.map(Number).forEach((value) => includes([1, 2, 3], value));
  });
});
