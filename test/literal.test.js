const { sample } = require('./helpers');
const { mixed, string } = require('yup');
const TestDataFactory = require('../src/TestDataFactory');

describe('literal generator', () => {

  it('should generate literal values', async () => {
    TestDataFactory.init();
    const schema = string().example({ generator: 'literal' }, 'wibble');
    const value = await TestDataFactory.generateValid(schema);
    expect(value).to.equal('wibble');
  })
});
