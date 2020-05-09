import { sample, expectAllBooleans }from './helpers';
import { mixed, boolean } from 'yup';
import { Stats } from 'fast-stats';
import TestDataFactory from '../src/TestDataFactory';

describe('boolean generator', () => {

  const testDataFactory = new TestDataFactory().addMethod(mixed, 'example');

  it('should generate random booleans', async function() {
    const schema = boolean().example();
    const { counts, values } = await sample(1000, () => testDataFactory.generateValid(schema));

    const stats = new Stats().push(counts);
    const [lower, upper] = stats.range();

    expect(counts.length).to.be.equal(2);
    expect(upper + lower).to.be.equal(1000);
    expect(lower).to.be.below(500);
    expect(upper).to.be.above(500);
    expectAllBooleans(values);
  })

  it('should obey specified one of values', async function() {
    const schema = boolean().oneOf([true]).example();
    for (let i = 0; i < 1000; i++) {
      const value = await testDataFactory.generateValid(schema);
      expect(value).to.equal(true);
    }
  })
});
