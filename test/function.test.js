import { sample, expectMostlyFloatingPoints, expectAllIntegers }from './helpers';
import { mixed, number } from 'yup';
import TestDataFactory from '../src/TestDataFactory';

describe('function generator', () => {

  const testDataFactory = new TestDataFactory().addMethod(mixed, 'example');

  it('should generate values using the specified function', function() {
    const schema = number().example('function', () => Math.random());
    const { counts, values } = sample(1000, () => testDataFactory.generate(schema));

    expect(counts.length).to.be.above(900);
    expectMostlyFloatingPoints(values);
  })

  it('should accept fn as an alias for function', function() {
    const schema = number().example('fn', () => Math.random());
    const { counts, values } = sample(1000, () => testDataFactory.generate(schema));

    expect(counts.length).to.be.above(900);
    expectMostlyFloatingPoints(values);
  })

  it('should supply the chance instance', function() {
    const schema = number().example('fn', (chance) => chance.integer());
    const { counts, values } = sample(1000, () => testDataFactory.generate(schema));

    expect(counts.length).to.be.above(900);
    expectAllIntegers(values);
  })
});
