const TestDataFactory = require('../src/TestDataFactory');
const { mixed, string, date } = require('yup');

describe('TestDataFactory', () => {

  const testDataFactory = new TestDataFactory().addMethod(mixed, 'example');

  it('should report missing id generators', async function() {
    const schema = string().example('missing');
    await expect(testDataFactory.generateValid(schema))
      .to.be.rejectedWith('No generator for id: \'missing\'');
  })

  it('should report unresolvable generators', async function() {
    testDataFactory.removeGenerator('date');
    const schema = date().meta({ type: 'missing' }).example();
    await expect(testDataFactory.generateValid(schema))
      .to.be.rejectedWith('Unable to resolve generator from [\'missing\', \'date\']');
  })

  it('should select generator by id', async function() {
    testDataFactory.addGenerator('wibble', CustomGenerator);
    const schema = string().example('wibble');
    const value = await testDataFactory.generateValid(schema);
    expect(value).to.equal('WIBBLE');
  })

  it('should select generator by meta.type', async function() {
    testDataFactory.addGenerator('wibble', CustomGenerator);
    const schema = string().meta({ type: 'wibble' }).example();
    const value = await testDataFactory.generateValid(schema);
    expect(value).to.equal('WIBBLE');
  })

  it('should select generator by type', async function() {
    const schema = string().example();
    const value = await testDataFactory.generateValid(schema);
    expect(value).to.be.a('string');
  })

  it('should tolerate missing generators for meta.type', async function() {
    const schema = string().meta({ type: 'missing' }).example();
    const value = await testDataFactory.generateValid(schema);
    expect(value).to.be.a('string');
  })

  it('should report validation errors when using generateValid', async function() {
    const schema = string().matches('does not match').example();
    await expect(testDataFactory.generateValid(schema))
      .to.be.rejectedWith('this must match the following: "does not match"');
  });

  it('should permit validation errors when using generate', async function() {
    const schema = string().matches('does not match').example();
    await expect(testDataFactory.generate(schema))
      .to.not.be.rejected();
  });

  it('should bypass generator when using schema.cast', function() {
    const schema = string().example();
    const value = schema.cast('valid');
    expect(value).to.equal('valid');
  });

  it('should bypass generator when using schema.validate', async function() {
    const schema = string().example();
    await expect(schema.validate('valid')).to.not.be.rejected()
  });

  class CustomGenerator {
    generate() {
      return 'WIBBLE'
    }
  }
});

