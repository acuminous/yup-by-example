const { before, beforeEach, after, afterEach, describe, it } = require('zunit');
const { string, array, object, date } = require('yup');
const dateFns = require('date-fns');
const { Stats } = require('fast-stats');

const sample = require('./sample');
const { includes, eq, gt, lt, isString } = require('./assert');

const { TestDataFactory } = require('..');

describe('array generator', () => {

  beforeEach(() => {
    TestDataFactory.init();
  });

  it('should generate arrays of strings', async () => {
    const items = string().example();
    const schema = array().of(items).example();
    const { counts, values } = await sample(1000, () => TestDataFactory.generateValid(schema));

    gt(counts.length, 900);
    values.forEach(isString);
  });

  it('should obey specified min values', async () => {
    const items = string().example();
    const schema = array().of(items).min(1).example();
    const { values } = await sample(1000, () => TestDataFactory.generateValid(schema), (v) => v.length);

    const stats = new Stats().push(values.map(Number));
    const [lower, upper] = stats.range();

    eq(lower, 1);
    eq(upper, 5);
  });

  it('should obey specified max values', async () => {
    const items = string().example();
    const schema = array().of(items).max(10).example();
    const { values } = await sample(1000, () => TestDataFactory.generateValid(schema), (v) => v.length);

    const stats = new Stats().push(values.map(Number));
    const mean = stats.amean();
    const [lower, upper] = stats.range();

    gt(mean, 6);
    lt(mean, 8);
    eq(lower, 3);
    eq(upper, 10);
  });

  it('should obey specified min and max values', async () => {
    const items = string().example();
    const schema = array().of(items).min(1).max(2)
      .example();
    const { values } = await sample(1000, () => TestDataFactory.generateValid(schema), (v) => v.length);

    const stats = new Stats().push(values.map(Number));
    const [lower, upper] = stats.range();

    eq(lower, 1);
    eq(upper, 2);
  });

  it('should obey specified one of values', async () => {
    const schema = array().oneOf([[1], [2], [3]]).example();
    const { counts, values } = await sample(999, () => TestDataFactory.generateValid(schema), (v) => v[0]);

    const stats = new Stats().push(counts);
    const [lower, upper] = stats.range();

    lt(lower, 333);
    gt(upper, 333);
    values.map(Number).forEach((value) => includes([1, 2, 3], value));
  });

  it('should obey length defined in session', async () => {
    TestDataFactory.session.setProperty('foo.length', 100);
    const items = string().example();
    const schema = array().of(items).min(1).max(2)
      .example({ id: 'foo' });
    const value = await TestDataFactory.generate(schema);

    eq(value.length, 100);
  });

  it('should be able to adjust items via events', async () => {
    TestDataFactory.init({ now: new Date('2020-01-01T00:00:00.000Z') });

    const schema = array().of(
      object().shape({
        date: date().example({ id: 'dob', generator: 'rel-date' }),
      })
        .meta({ type: 'user' })
        .example(),
    ).min(3).max(3)
      .example();

    TestDataFactory.session.on('user', () => {
      TestDataFactory.session.incrementProperty('user.index');
    });

    TestDataFactory.session.on('dob', (data) => {
      // eslint-disable-next-line no-param-reassign
      data.value = dateFns.add(data.value, {
        days: TestDataFactory.session.getProperty('user.index'),
      });
    });

    const users = await TestDataFactory.generateValid(schema);
    eq(users[0].date.toISOString(), '2020-01-02T00:00:00.000Z');
    eq(users[1].date.toISOString(), '2020-01-03T00:00:00.000Z');
    eq(users[2].date.toISOString(), '2020-01-04T00:00:00.000Z');
  });
});
