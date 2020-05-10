const dateFns = require('date-fns');
const { Stats } = require('fast-stats');
const { sample, expectAllStrings } = require('./helpers');
const { mixed, string, array, object, date } = require('yup');
const TestDataFactory = require('../src/TestDataFactory');

describe('array generator', () => {

  let testDataFactory;

  beforeEach(() => {
    testDataFactory = new TestDataFactory().addMethod(mixed, 'example');
  });

  it('should generate arrays of strings', async () => {
    const items = string().example();
    const schema = array().of(items).example();
    const { counts, values } = await sample(1000, () => testDataFactory.generateValid(schema));

    expect(counts.length).to.be.above(900);
    expectAllStrings(values);
  })

  it('should obey specified min values', async () => {
    const items = string().example();
    const schema = array().of(items).min(1).example();
    const { values } = await sample(1000, () => testDataFactory.generateValid(schema), v => v.length);

    const stats = new Stats().push(values.map(Number));
    const [lower, upper] = stats.range();

    expect(lower).to.equal(1);
    expect(upper).to.equal(5);
  })

  it('should obey specified max values', async () => {
    const items = string().example();
    const schema = array().of(items).max(10).example();
    const { values } = await sample(1000, () => testDataFactory.generateValid(schema), v => v.length);

    const stats = new Stats().push(values.map(Number));
    const mean = stats.amean();
    const [lower, upper] = stats.range();

    expect(mean).to.be.above(6);
    expect(mean).to.be.below(8);
    expect(lower).to.equal(3);
    expect(upper).to.equal(10);
  })

  it('should obey specified min and max values', async () => {
    const items = string().example();
    const schema = array().of(items).min(1).max(2).example();
    const { values } = await sample(1000, () => testDataFactory.generateValid(schema), v => v.length);

    const stats = new Stats().push(values.map(Number));
    const [lower, upper] = stats.range();

    expect(lower).to.equal(1);
    expect(upper).to.equal(2);
  })

  it('should obey specified one of values', async () => {
    const schema = array().oneOf([[1], [2], [3]]).example();
    const { counts, values } = await sample(999, () => testDataFactory.generateValid(schema), v => v[0]);

    const stats = new Stats().push(counts);
    const [lower, upper] = stats.range();

    expect(lower).to.be.below(333);
    expect(upper).to.be.above(333);
    values.forEach(value => {
      expect(Number(value)).to.be.oneOf([1, 2, 3]);
    });
  })

  it('should obey length defined in session', async () => {
    testDataFactory.session.setProperty('foo.length', 100)
    const items = string().example();
    const schema = array().of(items).min(1).max(2).meta({ sessionKey: 'foo' }).example();
    const value = await testDataFactory.generate(schema);

    expect(value).to.have.length(100);
  })

  it('should be able to adjust items via events', async () => {
    testDataFactory.reset({ now: new Date('2020-01-01T00:00:00.000Z') });

    const schema = array().of(
      object().shape({
        date: date().example('rel-date', { days: 0 })
      })
      .meta({ type: 'user' })
      .example()
    ).min(3).max(3).example();

    let userIndex = 0;
    testDataFactory.session.on('user', event => {
      userIndex++;
    })
    testDataFactory.session.on('rel-date', event => {
      event.value = dateFns.add(event.value, { days: userIndex })
    })

    const users = await testDataFactory.generateValid(schema);
    expect(users[0].date.toISOString()).to.equal('2020-01-02T00:00:00.000Z');
    expect(users[1].date.toISOString()).to.equal('2020-01-03T00:00:00.000Z');
    expect(users[2].date.toISOString()).to.equal('2020-01-04T00:00:00.000Z');
  });
});
