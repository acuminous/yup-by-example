const { sample } = require('./helpers');
const { mixed, string } = require('yup');
const TestDataFactory = require('../src/TestDataFactory');

describe('literal generator', () => {

  it('should generate literal values', async () => {
    const testDataFactory = new TestDataFactory().addMethod(mixed, 'example');
    const schema = string().example({ generator: 'literal' }, 'wibble');
    const value = await testDataFactory.generateValid(schema);
    expect(value).to.equal('wibble');
  })
});
