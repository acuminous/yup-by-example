const { mixed, date } = require('yup');
const TestDataFactory = require('../src/TestDataFactory');

describe('relative date generator', () => {

  it('should generate relative dates', async () => {
    const now = new Date('2020-01-01T00:00:00.000Z');
    const testDataFactory = new TestDataFactory({ now }).addMethod(mixed, 'example');
    const schema = date().example('rel-date', { days: 1 });
    const value = await testDataFactory.generateValid(schema);
    expect(value.toISOString()).to.equal(new Date('2020-01-02T00:00:00.000').toISOString())
  })
});
