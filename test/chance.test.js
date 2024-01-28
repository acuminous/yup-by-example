const { before, beforeEach, after, afterEach, describe, it } = require('zunit');
const { number, string } = require('yup');

const { eq, gt, isInteger, isString, rejects } = require('./assert');
const sample = require('./sample');
const TestDataFactory = require('../src/TestDataFactory');

describe('chance generator', () => {

  beforeEach(() => {
    TestDataFactory.init();
  });

  it('should generate values using chance with params', async () => {
    const schema = number().example({ generator: 'chance' }, {
      method: 'integer',
      params: { min: 1, max: 10 },
    });
    const { counts, values } = await sample(1000, () => TestDataFactory.generateValid(schema));

    eq(counts.length, 10);
    values.map(Number).forEach(isInteger);
  });

  it('should generate values using chance without params', async () => {
    const schema = string().example({ generator: 'chance' }, { method: 'name' });
    const { counts, values } = await sample(1000, () => TestDataFactory.generateValid(schema));

    gt(counts.length, 900);
    values.forEach(isString);
  });

  it('should report missing chance generators', async () => {
    const schema = string().example({ generator: 'chance' }, { method: 'missing' });
    await rejects(() => TestDataFactory.generateValid(schema), (err) => {
      eq(err.message, "The installed version of Chance does not have the 'missing' generator");
      return true;
    });
  });
});
