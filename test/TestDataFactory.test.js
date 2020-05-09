const TestDataFactory = require('../src/TestDataFactory');
const { mixed, string, date } = require('yup');

describe('TestDataFactory', () => {

  let testDataFactory;

  beforeEach(() => {
    testDataFactory = new TestDataFactory().addMethod(mixed, 'example');
  });

  it('should report missing id generators', async () => {
    const schema = string().example('missing');
    await expect(testDataFactory.generateValid(schema))
      .to.be.rejectedWith('No generator for id: \'missing\'');
  })

  it('should report unresolvable generators', async () => {
    testDataFactory.removeGenerator('date');
    const schema = date().meta({ type: 'missing' }).example();
    await expect(testDataFactory.generateValid(schema))
      .to.be.rejectedWith('Unable to resolve generator from [\'missing\', \'date\']');
  })

  it('should select generator by id', async () => {
    testDataFactory.addGenerator('wibble', CustomGenerator);
    const schema = string().example('wibble');
    const value = await testDataFactory.generateValid(schema);
    expect(value).to.equal('WIBBLE');
  })

  it('should select generator by meta.type', async () => {
    testDataFactory.addGenerator('wibble', CustomGenerator);
    const schema = string().meta({ type: 'wibble' }).example();
    const value = await testDataFactory.generateValid(schema);
    expect(value).to.equal('WIBBLE');
  })

  it('should select generator by type', async () => {
    const schema = string().example();
    const value = await testDataFactory.generateValid(schema);
    expect(value).to.be.a('string');
  })

  it('should tolerate missing generators for meta.type', async () => {
    const schema = string().meta({ type: 'missing' }).example();
    const value = await testDataFactory.generateValid(schema);
    expect(value).to.be.a('string');
  })

  it('should report validation errors when using generateValid', async () => {
    const schema = string().matches('does not match').example();
    await expect(testDataFactory.generateValid(schema))
      .to.be.rejectedWith('this must match the following: "does not match"');
  });

  it('should permit validation errors when using generate', async () => {
    const schema = string().matches('does not match').example();
    await expect(testDataFactory.generate(schema))
      .to.not.be.rejected();
  });

  it('should bypass generator when using schema.cast', function() {
    const schema = string().example();
    const value = schema.cast('valid');
    expect(value).to.equal('valid');
  });

  it('should bypass generator when using schema.validate', async () => {
    const schema = string().example();
    await expect(schema.validate('valid')).to.not.be.rejected()
  });

  it('should provide a harmless noop method', async () => {
    testDataFactory.addNoopMethod(mixed, 'example');
    const schema = string().example();
    const value = schema.cast('foo');
    expect(value).to.equal('foo');
  });

  class CustomGenerator {
    generate() {
      return 'WIBBLE'
    }
  }
});

