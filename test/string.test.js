const { sample } = require('./helpers');
const { mixed, string } = require('yup');
const { Stats } = require('fast-stats');
const TestDataFactory = require('../src/TestDataFactory');

describe('string generator', () => {

  const testDataFactory = new TestDataFactory().addMethod(mixed, 'example');

  it('should generate random strings', async function() {
    const schema = string().max(1).example();
    const { counts } = await sample(1000, () => testDataFactory.generateValid(schema));

    const stats = new Stats().push(counts);
    const mean = stats.amean();
    const [lower, upper] = stats.range();

    expect(counts.length).to.equal(52);
    expect(mean).to.be.above(18);
    expect(mean).to.be.below(20);
    expect(lower).to.be.above(2);
    expect(lower).to.be.below(19);
    expect(upper).to.be.above(19);
    expect(upper).to.be.below(50);
  })

  it('shoud obey specified length values', async function() {
    const schema = string().length(10).example();
    const { values } = await sample(1000, () => testDataFactory.generateValid(schema), v => v.length);

    const stats = new Stats().push(values.map(Number));
    const mean = stats.amean();
    const [lower, upper] = stats.range();

    expect(mean).to.equal(10);
    expect(lower).to.equal(10);
    expect(upper).to.equal(10);
  })

  it('should obey default min and max values', async function() {
    const schema = string().example();
    const { values } = await sample(1000, () => testDataFactory.generateValid(schema), v => v.length);

    const stats = new Stats().push(values.map(Number));
    const mean = stats.amean();
    const [lower, upper] = stats.range();

    expect(mean).to.be.above(14);
    expect(mean).to.be.below(16);
    expect(lower).to.equal(10);
    expect(upper).to.equal(20);
  })

  it('should obey specified min values', async function() {
    const schema = string().min(30).example();
    const { values } = await sample(1000, () => testDataFactory.generateValid(schema), v => v.length);

    const stats = new Stats().push(values.map(Number));
    const mean = stats.amean();
    const [lower, upper] = stats.range();

    expect(mean).to.be.above(34);
    expect(mean).to.be.below(36);
    expect(lower).to.equal(30);
    expect(upper).to.equal(40);
  })

  it('should obey specified max values', async function() {
    const schema = string().max(30).example();
    const { values } = await sample(1000, () => testDataFactory.generateValid(schema), v => v.length);

    const stats = new Stats().push(values.map(Number));
    const mean = stats.amean();
    const [lower, upper] = stats.range();

    expect(mean).to.be.above(24);
    expect(mean).to.be.below(26);
    expect(lower).to.equal(20);
    expect(upper).to.equal(30);
  })

  it('should obey specified min and max values', async function() {
    const schema = string().min(50).max(60).example();
    const { values } = await sample(1000, () => testDataFactory.generateValid(schema), v => v.length);

    const stats = new Stats().push(values.map(Number));
    const mean = stats.amean();
    const [lower, upper] = stats.range();

    expect(mean).to.be.above(54);
    expect(mean).to.be.below(56);
    expect(lower).to.equal(50);
    expect(upper).to.equal(60);
  })

  it('should generate random emails', async function() {
    const schema = string().email().example();
    const { values } = await sample(10, () => testDataFactory.generateValid(schema));
    values.forEach(value => {
      expect(value).to.match(/@/);
    });
  })

  it('should generate random urls', async function() {
    const schema = string().url().example();
    const { values } = await sample(10, () => testDataFactory.generateValid(schema));
    values.forEach(value => {
      expect(value).to.match(/:\/\//);
    });
  })

  it('should obey specified one of values', async function() {
    const schema = string().oneOf(['good', 'bad', 'ugly']).example();
    const { counts, values } = await sample(999, () => testDataFactory.generateValid(schema));

    const stats = new Stats().push(counts);
    const [lower, upper] = stats.range();

    expect(lower).to.be.below(333);
    expect(upper).to.be.above(333);
    values.forEach(value => {
      expect(value).to.be.oneOf(['good', 'bad', 'ugly']);
    });
  })
});
