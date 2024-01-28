const { before, beforeEach, after, afterEach, describe, it } = require('zunit');
const { number } = require('yup');

const { gt, isInteger, mostlyFloatingPoints } = require('./assert');
const sample = require('./sample');
const TestDataFactory = require('../src/TestDataFactory');

describe('function generator', () => {

  beforeEach(() => {
    TestDataFactory.init();
  });

  it('should generate values using the specified function', async () => {
    const schema = number().example({ generator: 'function' }, () => Math.random());
    const { counts, values } = await sample(1000, () => TestDataFactory.generateValid(schema));

    gt(counts.length, 900);
    mostlyFloatingPoints(values);
  });

  it('should accept fn as an alias for function', async () => {
    const schema = number().example({ generator: 'fn' }, () => Math.random());
    const { counts, values } = await sample(1000, () => TestDataFactory.generateValid(schema));

    gt(counts.length, 900);
    mostlyFloatingPoints(values);
  });

  it('should supply the chance instance', async () => {
    const schema = number().example({ generator: 'fn' }, ({ chance }) => chance.integer());
    const { counts, values } = await sample(1000, () => TestDataFactory.generateValid(schema));

    gt(counts.length, 900);
    values.map(Number).forEach(isInteger);
  });
});
