const { before, beforeEach, after, afterEach, describe, it } = require('zunit');
const { string } = require('yup');
const { Stats } = require('fast-stats');

const { eq, lt, gt, includes, match } = require('./assert');
const sample = require('./sample');
const TestDataFactory = require('../src/TestDataFactory');

describe('string generator', () => {

  beforeEach(() => {
    TestDataFactory.init();
  });

  it('should generate random strings', async () => {
    const schema = string().max(1).example();
    const { counts } = await sample(1000, () => TestDataFactory.generateValid(schema));

    const stats = new Stats().push(counts);
    const mean = stats.amean();
    const [lower, upper] = stats.range();

    eq(counts.length, 52);
    gt(mean, 18);
    lt(mean, 20);
    gt(lower, 2);
    lt(lower, 19);
    gt(upper, 19);
    lt(upper, 50);
  });

  it('shoud obey specified length values', async () => {
    const schema = string().length(10).example();
    const { values } = await sample(1000, () => TestDataFactory.generateValid(schema), (v) => v.length);

    const stats = new Stats().push(values.map(Number));
    const mean = stats.amean();
    const [lower, upper] = stats.range();

    eq(mean, 10);
    eq(lower, 10);
    eq(upper, 10);
  });

  it('should obey default min and max values', async () => {
    const schema = string().example();
    const { values } = await sample(1000, () => TestDataFactory.generateValid(schema), (v) => v.length);

    const stats = new Stats().push(values.map(Number));
    const mean = stats.amean();
    const [lower, upper] = stats.range();

    gt(mean, 14);
    lt(mean, 16);
    eq(lower, 10);
    eq(upper, 20);
  });

  it('should obey specified min values', async () => {
    const schema = string().min(30).example();
    const { values } = await sample(1000, () => TestDataFactory.generateValid(schema), (v) => v.length);

    const stats = new Stats().push(values.map(Number));
    const mean = stats.amean();
    const [lower, upper] = stats.range();

    gt(mean, 34);
    lt(mean, 36);
    eq(lower, 30);
    eq(upper, 40);
  });

  it('should obey specified max values', async () => {
    const schema = string().max(30).example();
    const { values } = await sample(1000, () => TestDataFactory.generateValid(schema), (v) => v.length);

    const stats = new Stats().push(values.map(Number));
    const mean = stats.amean();
    const [lower, upper] = stats.range();

    gt(mean, 24);
    lt(mean, 26);
    eq(lower, 20);
    eq(upper, 30);
  });

  it('should obey specified min and max values', async () => {
    const schema = string().min(50).max(60).example();
    const { values } = await sample(1000, () => TestDataFactory.generateValid(schema), (v) => v.length);

    const stats = new Stats().push(values.map(Number));
    const mean = stats.amean();
    const [lower, upper] = stats.range();

    gt(mean, 54);
    lt(mean, 56);
    eq(lower, 50);
    eq(upper, 60);
  });

  it('should generate random emails', async () => {
    const schema = string().email().example();
    const { values } = await sample(10, () => TestDataFactory.generateValid(schema));
    values.forEach((value) => match(value, /@/));
  });

  it('should generate random urls', async () => {
    const schema = string().url().example();
    const { values } = await sample(10, () => TestDataFactory.generateValid(schema));
    values.forEach((value) => match(value, /:\/\//));
  });

  it('should obey specified one of values', async () => {
    const schema = string().oneOf(['good', 'bad', 'ugly']).example();
    const { counts, values } = await sample(999, () => TestDataFactory.generateValid(schema));

    const stats = new Stats().push(counts);
    const [lower, upper] = stats.range();

    lt(lower, 333);
    gt(upper, 333);
    values.forEach((value) => includes(['good', 'bad', 'ugly'], value));
  });
});
