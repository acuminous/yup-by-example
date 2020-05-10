const { sample, expectAllBooleans } = require('./helpers');
const { mixed, boolean } = require('yup');
const { Stats } = require('fast-stats');
const TestDataFactory = require('../src/TestDataFactory');

describe('boolean generator', () => {

  let testDataFactory;

  beforeEach(() => {
    testDataFactory = new TestDataFactory().addMethod(mixed, 'example');
  });

  it('should generate random booleans', async () => {
    const schema = boolean().example();
    const { counts, values } = await sample(1000, () => testDataFactory.generateValid(schema));

    const stats = new Stats().push(counts);
    const [lower, upper] = stats.range();

    expect(counts.length).to.be.equal(2);
    expect(upper + lower).to.be.equal(1000);
    expect(lower).to.be.at.most(500);
    expect(upper).to.be.at.least(500);
    expectAllBooleans(values);
  })

  it('should obey specified one of values', async () => {
    const schema = boolean().oneOf([true]).example();
    for (let i = 0; i < 1000; i++) {
      const value = await testDataFactory.generateValid(schema);
      expect(value).to.equal(true);
    }
  })
});
