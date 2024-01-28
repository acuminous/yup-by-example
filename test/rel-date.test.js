const { before, beforeEach, after, afterEach, describe, it } = require('zunit');
const { date } = require('yup');

const { eq } = require('./assert');
const TestDataFactory = require('../src/TestDataFactory');

describe('relative date generator', () => {

  it('should generate relative dates', async () => {
    const now = new Date('2020-01-01T00:00:00.000Z');
    TestDataFactory.init({ now });
    const schema = date().example({ generator: 'rel-date' }, { days: 1 });
    const value = await TestDataFactory.generateValid(schema);
    eq(value.toISOString(), '2020-01-02T00:00:00.000Z');
  });

  it('should default to no change', async () => {
    const now = new Date('2020-01-01T00:00:00.000Z');
    TestDataFactory.init({ now });
    const schema = date().example({ generator: 'rel-date' });
    const value = await TestDataFactory.generateValid(schema);
    eq(value.toISOString(), '2020-01-01T00:00:00.000Z');
  });
});
