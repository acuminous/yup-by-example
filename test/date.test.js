const { sample, expectAllDates } = require('./helpers');
const { mixed, date } = require('yup');
const { Stats } = require('fast-stats');
const TestDataFactory = require('../src/TestDataFactory');

describe('date generator', () => {

  let testDataFactory;

  beforeEach(() => {
    testDataFactory = new TestDataFactory().addMethod(mixed, 'example');
  });

  it('should generate random dates', async () => {
    const schema = date().example();
    const { values } = await sample(1000, () => testDataFactory.generateValid(schema));
    expect(values.length).to.be.above(900);

    const dates = await Promise.all(new Array(1000).fill(null).map(() => testDataFactory.generateValid(schema)));
    expectAllDates(dates);
  })

  it('should obey specified min dates', async () => {
    const minDate = new Date('2000-01-01T00:00:00.000Z');
    const schema = date().min(minDate).example();
    const dates = await Promise.all(new Array(1000).fill(null).map(() => testDataFactory.generateValid(schema)));
    dates.forEach(date => {
      expect(date).to.be.at.least(minDate);
    });
  })

  it('should obey specified max dates', async () => {
    const maxDate = new Date('2000-01-01T00:00:00.000Z');
    const schema = date().max(maxDate).example();
    const dates = await Promise.all(new Array(1000).fill(null).map(() => testDataFactory.generateValid(schema)));
    dates.forEach(date => {
      expect(date).to.be.at.most(maxDate);
    });
  })

  it('should obey specified one of values', async () => {
    const schema = date().oneOf([new Date(1), new Date(2), new Date(3)]).example();
    const { counts, values } = await sample(999, () => testDataFactory.generateValid(schema), v => v.getTime());

    const stats = new Stats().push(counts);
    const [lower, upper] = stats.range();

    expect(lower).to.be.below(333);
    expect(upper).to.be.above(333);
    values.forEach(value => {
      expect(Number(value)).to.be.oneOf([1, 2, 3]);
    });
  })
});
