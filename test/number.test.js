const { sample, expectMostlyFloatingPoints, expectAllIntegers } = require('./helpers');
const { mixed, number } = require('yup');
const { Stats } = require('fast-stats');
const TestDataFactory = require('../src/TestDataFactory');

describe('number generator', () => {

  const testDataFactory = new TestDataFactory().addMethod(mixed, 'example');

  describe('floating points', () => {
    it('should generate random floating point numbers', async function() {
      const schema = number().example();
      const { values } = await sample(1000, () => testDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900);
      expect(upper).to.be.above(1000000);
      expect(lower).to.be.below(-1000000);
      expectMostlyFloatingPoints(values);
    })

    it('should obey specified min values', async function() {
      const schema = number().min(0).example();
      const { values } = await sample(1000, () => testDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900)
      expect(lower).to.be.above(-1);
      expect(upper - lower).to.be.above(100000);
      expectMostlyFloatingPoints(values);
    })

    it('should obey specified max values', async function() {
      const schema = number().max(30).example();
      const { values } = await sample(1000, () => testDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(100)
      expect(upper).to.be.below(31);
      expect(upper - lower).to.be.above(100000);
      expectMostlyFloatingPoints(values);
    })

    it('should obey specified min and max values', async function() {
      const schema = number().min(50).max(60).example();
      const { values } = await sample(1000, () => testDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(100)
      expect(upper).to.be.below(60.0000001);
      expect(lower).to.be.above(49.9999999);
      expectMostlyFloatingPoints(values);
    })

    it('should generate positive floating point numbers', async function() {
      const schema = number().positive().example();
      const { values } = await sample(1000, () => testDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900)
      expect(upper).to.be.above(1000000);
      expect(lower).to.be.above(0);
      expectMostlyFloatingPoints(values);
    })

    it('should generate negative floating point numbers', async function() {
      const schema = number().negative().example();
      const { values } = await sample(1000, () => testDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900)
      expect(upper).to.be.below(0);
      expect(lower).to.be.below(1000000);
      expectMostlyFloatingPoints(values);
    })

    it('should generate floating point numbers below the specified limit', async function() {
      const schema = number().lessThan(100).example();
      const { values } = await sample(1000, () => testDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900)
      expect(upper).to.be.below(100);
      expect(lower).to.be.below(-1000000);
      expectMostlyFloatingPoints(values);
    })

    it('should generate floating point numbers above the specified limit', async function() {
      const schema = number().moreThan(100).example();
      const { values } = await sample(1000, () => testDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900)
      expect(upper).to.be.above(1000000);
      expect(lower).to.be.above(100);
      expectMostlyFloatingPoints(values);
    })

    it('should obey specified one of values', async function() {
      const schema = number().oneOf([1.1, 2.2, 3.3]).example();
      const { counts, values } = await sample(999, () => testDataFactory.generateValid(schema));

      const stats = new Stats().push(counts);
      const [lower, upper] = stats.range();

      expect(lower).to.be.below(333);
      expect(upper).to.be.above(333);
      values.forEach(value => {
        expect(Number(value)).to.be.oneOf([1.1, 2.2, 3.3]);
      });
    })
  });

  describe('integers', () => {
    it('should generate random integers', async function() {
      const schema = number().integer().example();
      const { values } = await sample(1000, () => testDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900)
      expect(upper).to.be.above(1000000);
      expect(lower).to.be.below(-1000000);
      expectAllIntegers(values);
    })

    it('should obey specified min values', async function() {
      const schema = number().integer().min(0).example();
      const { values } = await sample(1000, () => testDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900)
      expect(lower).to.be.above(-1);
      expect(upper - lower).to.be.above(100000);
      expectAllIntegers(values);
    })

    it('should obey specified max values', async function() {
      const schema = number().integer().max(30).example();
      const { values } = await sample(1000, () => testDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(100)
      expect(upper).to.be.below(31);
      expect(upper - lower).to.be.above(100000);
      expectAllIntegers(values);
    })

    it('should obey specified min and max values', async function() {
      const schema = number().integer().min(50).max(60).example();
      const { values } = await sample(1000, () => testDataFactory.generateValid(schema), v => Math.floor(v));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.equal(11)
      expect(upper).to.be.equal(60);
      expect(lower).to.be.equal(50);
      expectAllIntegers(values);
    })

    it('should generate positive integers', async function() {
      const schema = number().integer().positive().example();
      const { values } = await sample(1000, () => testDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900)
      expect(upper).to.be.above(1000000);
      expect(lower).to.be.above(0);
      expectAllIntegers(values);
    })

    it('should generate negative integers', async function() {
      const schema = number().integer().negative().example();
      const { values } = await sample(1000, () => testDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900)
      expect(upper).to.be.below(0);
      expect(lower).to.be.below(1000000);
      expectAllIntegers(values);
    })

    it('should generate integers below the specified limit', async function() {
      const schema = number().integer().lessThan(100).example();
      const { values } = await sample(1000, () => testDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900)
      expect(upper).to.be.below(100);
      expect(lower).to.be.below(-1000000);
      expectAllIntegers(values);
    })

    it('should generate integers above the specified limit', async function() {
      const schema = number().integer().moreThan(100).example();
      const { values } = await sample(1000, () => testDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      expect(values.length).to.be.above(900)
      expect(upper).to.be.above(1000000);
      expect(lower).to.be.above(100);
      expectAllIntegers(values);
    })

    it('should obey specified one of values', async function() {
      const schema = number().oneOf([1, 2, 3]).example();
      const { counts, values } = await sample(999, () => testDataFactory.generateValid(schema));

      const stats = new Stats().push(counts);
      const [lower, upper] = stats.range();

      expect(lower).to.be.below(333);
      expect(upper).to.be.above(333);
      values.forEach(value => {
        expect(Number(value)).to.be.oneOf([1, 2, 3]);
      });
    })
  })

});
