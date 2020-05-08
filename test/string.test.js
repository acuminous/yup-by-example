import * as TestHelpers from './helpers';
import { mixed, string } from 'yup';
import { Stats } from 'fast-stats';
import TestDataFactory from '../src/TestDataFactory';

new TestDataFactory().addMethod(mixed, 'example');

describe('string generator', () => {
  it('should generate random strings', function() {
    const schema = string().max(1).example();
    const { counts } = TestHelpers.sample(1000, () => schema.cast(null));
    const stats = new Stats().push(counts);

    const mean = stats.amean();
    expect(mean).to.be.above(25);
    expect(mean).to.be.below(35);

    const [lower, upper] = stats.range();
    expect(lower).to.be.above(10);
    expect(lower).to.be.below(40);
    expect(upper).to.be.above(20);
    expect(upper).to.be.below(100);
  })

  it('shoud obey specified length values', function() {
    const schema = string().length(10).example();
    const { values } = TestHelpers.sample(1000, () => schema.cast(null), v => v.length);
    const stats = new Stats().push(values.map(Number));

    const mean = stats.amean();
    expect(mean).to.equal(10);

    const [lower, upper] = stats.range();
    expect(lower).to.equal(10);
    expect(upper).to.equal(10);
  })

  it('should obey default min and max values', function() {
    const schema = string().example();
    const { values } = TestHelpers.sample(1000, () => schema.cast(null), v => v.length);
    const stats = new Stats().push(values.map(Number));

    const mean = stats.amean();
    expect(mean).to.be.above(14);
    expect(mean).to.be.below(16);

    const [lower, upper] = stats.range();
    expect(lower).to.equal(10);
    expect(upper).to.equal(20);
  })

  it('should obey specified min values', function() {
    const schema = string().min(30).example();
    const { values } = TestHelpers.sample(1000, () => schema.cast(null), v => v.length);
    const stats = new Stats().push(values.map(Number));

    const mean = stats.amean();
    expect(mean).to.be.above(34);
    expect(mean).to.be.below(36);

    const [lower, upper] = stats.range();
    expect(lower).to.equal(30);
    expect(upper).to.equal(40);
  })

  it('should obey specified max values', function() {
    const schema = string().max(30).example();
    const { values } = TestHelpers.sample(1000, () => schema.cast(null), v => v.length);
    const stats = new Stats().push(values.map(Number));

    const mean = stats.amean();
    expect(mean).to.be.above(24);
    expect(mean).to.be.below(26);

    const [lower, upper] = stats.range();
    expect(lower).to.equal(20);
    expect(upper).to.equal(30);
  })

  it('should obey specified min and max values', function() {
    const schema = string().min(50).max(60).example();
    const { values } = TestHelpers.sample(1000, () => schema.cast(null), v => v.length);
    const stats = new Stats().push(values.map(Number));

    const mean = stats.amean();
    expect(mean).to.be.above(54);
    expect(mean).to.be.below(56);

    const [lower, upper] = stats.range();
    expect(lower).to.equal(50);
    expect(upper).to.equal(60);
  })

  it('should generate random emails', function() {
    const schema = string().email().example();
    const { values } = TestHelpers.sample(10, () => schema.cast(null));
    values.forEach(value => {
      expect(value).to.match(/@/);
    });
  })

  it('should generate random urls', function() {
    const schema = string().url().example();
    const { values } = TestHelpers.sample(10, () => schema.cast(null));
    values.forEach(value => {
      expect(value).to.match(/:\/\//);
    });
  })
});
