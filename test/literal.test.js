const { before, beforeEach, after, afterEach, describe, it } = require('zunit');
const { string } = require('yup');
const { eq } = require('./assert');

const TestDataFactory = require('../src/TestDataFactory');

describe('literal generator', () => {

  it('should generate literal values', async () => {
    TestDataFactory.init();
    const schema = string().example({ generator: 'literal' }, 'wibble');
    const value = await TestDataFactory.generateValid(schema);
    eq(value, 'wibble');
  });
});
