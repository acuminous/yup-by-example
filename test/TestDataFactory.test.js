import TestDataFactory from '../src/TestDataFactory';
import { mixed, string, object } from 'yup';

describe('TestDataFactory', () => {

  const testDataFactory = new TestDataFactory().addMethod(mixed, 'example');

  it('should report missing id generators', function() {
    const schema = string().example('missing');
    expect(() => testDataFactory.generate(schema))
      .to.throw('No generator for id: \'missing\'');
  })

  it('should report unresolvable generators', function() {
    testDataFactory.removeGenerator('object');
    const schema = object().meta({ type: 'name' }).example();
    expect(() => testDataFactory.generate(schema))
      .to.throw('Unable to resolve generator from [\'name\', \'object\']');
  })

  it('should select generator by id', function() {
    testDataFactory.addGenerator('wibble', CustomGenerator);
    const schema = string().example('wibble');
    const value = testDataFactory.generate(schema);
    expect(value).to.equal('WIBBLE');
  })

  it('should select generator by meta.type', function() {
    testDataFactory.addGenerator('wibble', CustomGenerator);
    const schema = string().meta({ type: 'wibble' }).example();
    const value = testDataFactory.generate(schema);
    expect(value).to.equal('WIBBLE');
  })

  it('should select generator by type', function() {
    const schema = string().example();
    const value = testDataFactory.generate(schema);
    expect(value).to.be.a('string');
  })

  it('should tolerate missing generators for meta.type', function() {
    const schema = string().meta({ type: 'missing' }).example();
    const value = testDataFactory.generate(schema);
    expect(value).to.be.a('string');
  })

  it('should bypass generator when using schema.cast', function() {
    const schema = string().example();
    const value = schema.cast('valid');
    expect(value).to.equal('valid');
  });

  it('should bypass generator when using schema.validate', function() {
    const schema = string().example();
    expect(() => schema.validate('valid')).to.not.throw()
  });

  class CustomGenerator {
    generate() {
      return 'WIBBLE'
    }
  }
});

