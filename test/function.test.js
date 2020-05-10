const { sample, expectMostlyFloatingPoints, expectAllIntegers } = require('./helpers');
const { mixed, number } = require('yup');
const TestDataFactory = require('../src/TestDataFactory');

describe('function generator', () => {

  let testDataFactory;

  beforeEach(() => {
    testDataFactory = new TestDataFactory().addMethod(mixed, 'example');
  });

  it('should generate values using the specified function', async () => {
    const schema = number().example({ generator: 'function' }, () => Math.random());
    const { counts, values } = await sample(1000, () => testDataFactory.generateValid(schema));

    expect(counts.length).to.be.above(900);
    expectMostlyFloatingPoints(values);
  })

  it('should accept fn as an alias for function', async () => {
    const schema = number().example({ generator: 'fn' }, () => Math.random());
    const { counts, values } = await sample(1000, () => testDataFactory.generateValid(schema));

    expect(counts.length).to.be.above(900);
    expectMostlyFloatingPoints(values);
  })

  it('should supply the chance instance', async () => {
    const schema = number().example({ generator: 'fn' }, ({ chance }) => chance.integer());
    const { counts, values } = await sample(1000, () => testDataFactory.generateValid(schema));

    expect(counts.length).to.be.above(900);
    expectAllIntegers(values);
  })
});
