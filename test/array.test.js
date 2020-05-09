import { sample, expectAllStrings }from './helpers';
import { mixed, string, array } from 'yup';
import { Stats } from 'fast-stats';
import TestDataFactory from '../src/TestDataFactory';

describe('array generator', () => {

  const testDataFactory = new TestDataFactory().addMethod(mixed, 'example');

  it('should generate arrays of strings', function() {
    const items = string().example();
    const schema = array().of(items).example();
    const { counts, values } = sample(1000, () => testDataFactory.generate(schema));

    expect(counts.length).to.be.above(900);
    expectAllStrings(values);
  })

  it('should obey specified min values', function() {
    const items = string().example();
    const schema = array().of(items).min(1).example();
    const { values } = sample(1000, () => testDataFactory.generate(schema), v => v.length);

    const stats = new Stats().push(values.map(Number));
    const [lower, upper] = stats.range();

    expect(lower).to.equal(1);
    expect(upper).to.equal(5);
  })

  it('should obey specified max values', function() {
    const items = string().example();
    const schema = array().of(items).max(10).example();
    const { values } = sample(1000, () => testDataFactory.generate(schema), v => v.length);

    const stats = new Stats().push(values.map(Number));
    const mean = stats.amean();
    const [lower, upper] = stats.range();

    expect(mean).to.be.above(6);
    expect(mean).to.be.below(8);
    expect(lower).to.equal(3);
    expect(upper).to.equal(10);
  })

  it('should obey specified min and max values', function() {
    const items = string().example();
    const schema = array().of(items).min(1).max(2).example();
    const { values } = sample(1000, () => testDataFactory.generate(schema), v => v.length);

    const stats = new Stats().push(values.map(Number));
    const [lower, upper] = stats.range();

    expect(lower).to.equal(1);
    expect(upper).to.equal(2);
  })
});
