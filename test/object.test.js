const { before, beforeEach, after, afterEach, describe, it } = require('zunit');
const { string, number, object } = require('yup');
const { Stats } = require('fast-stats');

const { lt, gt, isInteger, isString, includes, excludes } = require('./assert');
const sample = require('./sample');
const TestDataFactory = require('../src/TestDataFactory');

describe('object generator', () => {

  beforeEach(() => {
    TestDataFactory.init();
  });

  it('should generate random objects', async () => {
    const schema = object().shape({
      name: string().example(),
      age: number().positive().integer().max(100)
        .example(),
    }).example();

    for (let i = 0; i < 1000; i++) {
      const value = await TestDataFactory.generateValid(schema);
      includes(Object.keys(value), 'name');
      includes(Object.keys(value), 'age');
      isString(value.name);
      isInteger(value.age);
      gt(value.age, 0);
      lt(value.age, 101);
    }
  });

  it('should skip fields with no example', async () => {
    const schema = object().shape({
      name: string().strip(),
      age: number().example(),
    }).example();

    const value = await TestDataFactory.generateValid(schema);
    excludes(Object.keys(value), 'name');
    includes(Object.keys(value), 'age');
  });

  it('should obey specified one of values', async () => {
    const schema = object().oneOf([{ x: 1 }, { x: 2 }, { x: 3 }]).example();
    const { counts, values } = await sample(999, () => TestDataFactory.generateValid(schema), (v) => v.x);

    const stats = new Stats().push(counts);
    const [lower, upper] = stats.range();

    lt(lower, 333);
    gt(upper, 333);
    values.map(Number).forEach((value) => includes([1, 2, 3], value));
  });
});
