const { before, beforeEach, after, afterEach, describe, it } = require('zunit');
const { number } = require('yup');
const { Stats } = require('fast-stats');

const { eq, lt, gt, includes, isInteger, mostlyFloatingPoints } = require('./assert');
const sample = require('./sample');
const TestDataFactory = require('../src/TestDataFactory');

describe('number generator', () => {

  beforeEach(() => {
    TestDataFactory.init();
  });

  describe('floating points', () => {
    it('should generate random floating point numbers', async () => {
      const schema = number().example();
      const { values } = await sample(1000, () => TestDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      gt(values.length, 900);
      gt(upper, 1000000);
      lt(lower, -1000000);
      mostlyFloatingPoints(values);
    });

    it('should obey specified min values', async () => {
      const schema = number().min(0).example();
      const { values } = await sample(1000, () => TestDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      gt(values.length, 900);
      gt(lower, -1);
      gt(upper - lower, 100000);
      mostlyFloatingPoints(values);
    });

    it('should obey specified max values', async () => {
      const schema = number().max(30).example();
      const { values } = await sample(1000, () => TestDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      gt(values.length, 100);
      lt(upper, 31);
      gt(upper - lower, 100000);
      mostlyFloatingPoints(values);
    });

    it('should obey specified min and max values', async () => {
      const schema = number().min(50).max(60).example();
      const { values } = await sample(1000, () => TestDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      gt(values.length, 100);
      lt(upper, 60.0000001);
      gt(lower, 49.9999999);
      mostlyFloatingPoints(values);
    });

    it('should generate positive floating point numbers', async () => {
      const schema = number().positive().example();
      const { values } = await sample(1000, () => TestDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      gt(values.length, 900);
      gt(upper, 1000000);
      gt(lower, 0);
      mostlyFloatingPoints(values);
    });

    it('should generate negative floating point numbers', async () => {
      const schema = number().negative().example();
      const { values } = await sample(1000, () => TestDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      gt(values.length, 900);
      lt(upper, 0);
      lt(lower, 1000000);
      mostlyFloatingPoints(values);
    });

    it('should generate floating point numbers below the specified limit', async () => {
      const schema = number().lessThan(100).example();
      const { values } = await sample(1000, () => TestDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      gt(values.length, 900);
      lt(upper, 100);
      lt(lower, -1000000);
      mostlyFloatingPoints(values);
    });

    it('should generate floating point numbers above the specified limit', async () => {
      const schema = number().moreThan(100).example();
      const { values } = await sample(1000, () => TestDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      gt(values.length, 900);
      gt(upper, 1000000);
      gt(lower, 100);
      mostlyFloatingPoints(values);
    });

    it('should obey specified one of values', async () => {
      const schema = number().oneOf([1.1, 2.2, 3.3]).example();
      const { counts, values } = await sample(999, () => TestDataFactory.generateValid(schema));

      const stats = new Stats().push(counts);
      const [lower, upper] = stats.range();

      lt(lower, 333);
      gt(upper, 333);
      values.map(Number).forEach((value) => includes([1.1, 2.2, 3.3], value));
    });
  });

  describe('integers', () => {
    it('should generate random integers', async () => {
      const schema = number().integer().example();
      const { values } = await sample(1000, () => TestDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      gt(values.length, 900);
      gt(upper, 1000000);
      lt(lower, -1000000);
      values.map(Number).forEach(isInteger);
    });

    it('should obey specified min values', async () => {
      const schema = number().integer().min(0).example();
      const { values } = await sample(1000, () => TestDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      gt(values.length, 900);
      gt(lower, -1);
      gt(upper - lower, 100000);
      values.map(Number).forEach(isInteger);
    });

    it('should obey specified max values', async () => {
      const schema = number().integer().max(30).example();
      const { values } = await sample(1000, () => TestDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      gt(values.length, 100);
      lt(upper, 31);
      gt(upper - lower, 100000);
      values.map(Number).forEach(isInteger);
    });

    it('should obey specified min and max values', async () => {
      const schema = number().integer().min(50).max(60)
        .example();
      const { values } = await sample(1000, () => TestDataFactory.generateValid(schema), (v) => Math.floor(v));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      eq(values.length, 11);
      eq(upper, 60);
      eq(lower, 50);
      values.map(Number).forEach(isInteger);
    });

    it('should generate positive integers', async () => {
      const schema = number().integer().positive().example();
      const { values } = await sample(1000, () => TestDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      gt(values.length, 900);
      gt(upper, 1000000);
      gt(lower, 0);
      values.map(Number).forEach(isInteger);
    });

    it('should generate negative integers', async () => {
      const schema = number().integer().negative().example();
      const { values } = await sample(1000, () => TestDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      gt(values.length, 900);
      lt(upper, 0);
      lt(lower, 1000000);
      values.map(Number).forEach(isInteger);
    });

    it('should generate integers below the specified limit', async () => {
      const schema = number().integer().lessThan(100).example();
      const { values } = await sample(1000, () => TestDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      gt(values.length, 900);
      lt(upper, 100);
      lt(lower, -1000000);
      values.map(Number).forEach(isInteger);
    });

    it('should generate integers above the specified limit', async () => {
      const schema = number().integer().moreThan(100).example();
      const { values } = await sample(1000, () => TestDataFactory.generateValid(schema));

      const stats = new Stats().push(values.map(Number));
      const [lower, upper] = stats.range();

      gt(values.length, 900);
      gt(upper, 1000000);
      gt(lower, 100);
      values.map(Number).forEach(isInteger);
    });

    it('should obey specified one of values', async () => {
      const schema = number().oneOf([1, 2, 3]).example();
      const { counts, values } = await sample(999, () => TestDataFactory.generateValid(schema));

      const stats = new Stats().push(counts);
      const [lower, upper] = stats.range();

      lt(lower, 333);
      gt(upper, 333);
      values.map(Number).forEach((value) => includes([1, 2, 3], value));
    });
  });
});
