import { sample, expectAllIntegers, expectAllStrings }from './helpers';
import { mixed, number, string } from 'yup';
import TestDataFactory from '../src/TestDataFactory';

describe('chance generator', () => {

  const testDataFactory = new TestDataFactory().addMethod(mixed, 'example');

  it('should generate values using chance with params', function() {
    const schema = number().example('chance', {
      method: 'integer',
      params: { min: 1, max: 10 }
    })
    const { counts, values } = sample(1000, () => testDataFactory.generate(schema));

    expect(counts.length).to.be.equal(10);
    expectAllIntegers(values);
  })

  it('should generate values using chance without params', function() {
    const schema = string().example('chance', { method: 'name', });
    const { counts, values } = sample(1000, () => testDataFactory.generate(schema));

    expect(counts.length).to.be.above(900);
    expectAllStrings(values);
  })

  it('should report missing chance generators', function() {
    const schema = string().example('chance', { method: 'missing', });
    expect(() => testDataFactory.generate(schema))
      .to.throw('The installed version of Chance does not have the \'missing\' generator');
  })
});
