import { sample, expectMostlyFloatingPoints, expectAllIntegers }from './helpers';
import { mixed, number } from 'yup';
import { Stats } from 'fast-stats';
import TestDataFactory from '../src/TestDataFactory';

describe('number generator', () => {

  const testDataFactory = new TestDataFactory().addMethod(mixed, 'example');

  describe('floating points', () => {
    it('should generate random floating point numbers', function() {
      const schema = number().example();
      const { values } = sample(1000, () => testDataFactory.generate(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900);
      expect(upper).to.be.above(1000000);
      expect(lower).to.be.below(-1000000);
      expectMostlyFloatingPoints(values);
    })

    it('should obey specified min values', function() {
      const schema = number().min(0).example();
      const { values } = sample(1000, () => testDataFactory.generate(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900)
      expect(lower).to.be.above(-1);
      expect(upper - lower).to.be.above(100000);
      expectMostlyFloatingPoints(values);
    })

    it('should obey specified max values', function() {
      const schema = number().max(30).example();
      const { values } = sample(1000, () => testDataFactory.generate(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(100)
      expect(upper).to.be.below(31);
      expect(upper - lower).to.be.above(100000);
      expectMostlyFloatingPoints(values);
    })

    it('should obey specified min and max values', function() {
      const schema = number().min(50).max(60).example();
      const { values } = sample(1000, () => testDataFactory.generate(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(100)
      expect(upper).to.be.below(60.0000001);
      expect(lower).to.be.above(49.9999999);
      expectMostlyFloatingPoints(values);
    })

    it('should generate positive floating point numbers', function() {
      const schema = number().positive().example();
      const { values } = sample(1000, () => testDataFactory.generate(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900)
      expect(upper).to.be.above(1000000);
      expect(lower).to.be.above(0);
      expectMostlyFloatingPoints(values);
    })

    it('should generate negative floating point numbers', function() {
      const schema = number().negative().example();
      const { values } = sample(1000, () => testDataFactory.generate(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900)
      expect(upper).to.be.below(0);
      expect(lower).to.be.below(1000000);
      expectMostlyFloatingPoints(values);
    })

    it('should generate floating point numbers below the specified limit', function() {
      const schema = number().lessThan(100).example();
      const { values } = sample(1000, () => testDataFactory.generate(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900)
      expect(upper).to.be.below(100);
      expect(lower).to.be.below(-1000000);
      expectMostlyFloatingPoints(values);
    })

    it('should generate floating point numbers above the specified limit', function() {
      const schema = number().moreThan(100).example();
      const { values } = sample(1000, () => testDataFactory.generate(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900)
      expect(upper).to.be.above(1000000);
      expect(lower).to.be.above(100);
      expectMostlyFloatingPoints(values);
    })
  });

  describe('integers', () => {
    it('should generate random integers', function() {
      const schema = number().integer().example();
      const { values } = sample(1000, () => testDataFactory.generate(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900)
      expect(upper).to.be.above(1000000);
      expect(lower).to.be.below(-1000000);
      expectAllIntegers(values);
    })

    it('should obey specified min values', function() {
      const schema = number().integer().min(0).example();
      const { values } = sample(1000, () => testDataFactory.generate(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900)
      expect(lower).to.be.above(-1);
      expect(upper - lower).to.be.above(100000);
      expectAllIntegers(values);
    })

    it('should obey specified max values', function() {
      const schema = number().integer().max(30).example();
      const { values } = sample(1000, () => testDataFactory.generate(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(100)
      expect(upper).to.be.below(31);
      expect(upper - lower).to.be.above(100000);
      expectAllIntegers(values);
    })

    it('should obey specified min and max values', function() {
      const schema = number().integer().min(50).max(60).example();
      const { values } = sample(1000, () => testDataFactory.generate(schema), v => Math.floor(v));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.equal(11)
      expect(upper).to.be.equal(60);
      expect(lower).to.be.equal(50);
      expectAllIntegers(values);
    })

    it('should generate positive integers', function() {
      const schema = number().integer().positive().example();
      const { values } = sample(1000, () => testDataFactory.generate(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900)
      expect(upper).to.be.above(1000000);
      expect(lower).to.be.above(0);
      expectAllIntegers(values);
    })

    it('should generate negative integers', function() {
      const schema = number().integer().negative().example();
      const { values } = sample(1000, () => testDataFactory.generate(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900)
      expect(upper).to.be.below(0);
      expect(lower).to.be.below(1000000);
      expectAllIntegers(values);
    })

    it('should generate integers below the specified limit', function() {
      const schema = number().integer().lessThan(100).example();
      const { values } = sample(1000, () => testDataFactory.generate(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900)
      expect(upper).to.be.below(100);
      expect(lower).to.be.below(-1000000);
      expectAllIntegers(values);
    })

    it('should generate integers above the specified limit', function() {
      const schema = number().integer().moreThan(100).example();
      const { values } = sample(1000, () => testDataFactory.generate(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900)
      expect(upper).to.be.above(1000000);
      expect(lower).to.be.above(100);
      expectAllIntegers(values);
    })
  })

});
