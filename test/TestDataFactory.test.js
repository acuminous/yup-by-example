const { object, string, number, date } = require('yup');
const { before, beforeEach, after, afterEach, describe, it } = require('zunit');
const TestDataFactory = require('../src/TestDataFactory');

const { eq, isString, fail, rejects, accepts } = require('./assert');

describe('TestDataFactory', () => {

  beforeEach(() => {
    TestDataFactory.init();
  });

  it('should generate test data without options', async () => {
    const schema = number().when('$required', {
      is: true,
      then: number().min(1).max(1).integer()
        .required()
        .example(),
      otherwise: number().min(2).max(2).integer()
        .required()
        .example(),
    }).example();

    const mandatory = await TestDataFactory.generate(schema, { context: { required: true } });
    const optional = await TestDataFactory.generate(schema, { context: { required: false } });
    eq(mandatory, 1);
    eq(optional, 2);
  });

  it('should tolerate validation options passed to cast', async () => {
    const schema = number().when('$required', {
      is: true,
      then: number().min(1).max(1).integer()
        .required()
        .example(),
      otherwise: number().min(2).max(2).integer()
        .required()
        .example(),
    }).example();

    const mandatory = await TestDataFactory.generate(schema, { context: { required: true, abortEarly: true } });
    const optional = await TestDataFactory.generate(schema, { context: { required: false, abortEarly: true } });
    eq(mandatory, 1);
    eq(optional, 2);
  });

  it('should validate test data without options', async () => {
    const schema = object().shape({
      a: string().matches(/wibble/).required(),
      b: string().matches(/wobble/).required(),
    }).example();
    try {
      await TestDataFactory.generateValid(schema);
      fail('Should have reported a validation error');
    } catch (err) {
      eq(err.errors.length, 1);
    }
  });

  it('should validate test data with options', async () => {
    const schema = object().shape({
      a: string().matches(/wibble/).required(),
      b: string().matches(/wobble/).required(),
    }).example();
    try {
      await TestDataFactory.generateValid(schema, { abortEarly: false });
      fail('Should have reported a validation error');
    } catch (err) {
      eq(err.errors.length, 2);
    }
  });

  it('should report missing id generators', async () => {
    const schema = string().example({ generator: 'missing' });
    await rejects(() => TestDataFactory.generateValid(schema), (err) => {
      eq(err.message, "Unable to resolve generator from ['missing']");
      return true;
    });
  });

  it('should report missing type generators', async () => {
    TestDataFactory.removeGenerator('date');
    const schema = date().meta({ type: 'missing' }).example();
    await rejects(() => TestDataFactory.generateValid(schema), (err) => {
      eq(err.message, "Unable to resolve generator from ['missing', 'date']");
      return true;
    });
  });

  it('should select generator by id', async () => {
    TestDataFactory.addGenerator('wibble', new CustomGenerator());
    const schema = string().example({ generator: 'wibble' });
    const value = await TestDataFactory.generateValid(schema);
    eq(value, 'WIBBLE');
  });

  it('should select generator by meta.type', async () => {
    TestDataFactory.addGenerator('wibble', new CustomGenerator());
    const schema = string().meta({ type: 'wibble' }).example();
    const value = await TestDataFactory.generateValid(schema);
    eq(value, 'WIBBLE');
  });

  it('should select generator by type', async () => {
    const schema = string().example();
    const value = await TestDataFactory.generateValid(schema);
    isString(value);
  });

  it('should tolerate missing generators for meta.type', async () => {
    const schema = string().meta({ type: 'missing' }).example();
    const value = await TestDataFactory.generateValid(schema);
    isString(value);
  });

  it('should report validation errors when using generateValid', async () => {
    const schema = string().matches('does not match').example();
    await rejects(() => TestDataFactory.generateValid(schema), (err) => {
      eq(err.message, 'this must match the following: "does not match"');
      return true;
    });
  });

  it('should permit validation errors when using generate', async () => {
    const schema = string().matches('does not match').example();
    await accepts(TestDataFactory.generate(schema));
  });

  it('should bypass generator when using schema.cast', () => {
    const schema = string().example();
    const value = schema.cast('valid');
    eq(value, 'valid');
  });

  it('should bypass generator when using schema.validate', async () => {
    const schema = string().example();
    await accepts(schema.validate('valid'));
  });

  it('should notify via type event', async () => {
    const schema = string().oneOf(['WIBBLE']).example();
    TestDataFactory.session.once('string', (event) => {
      eq(event.value, 'WIBBLE');
      // eslint-disable-next-line no-param-reassign
      event.value = 'wobble';
    });
    const value = await TestDataFactory.generate(schema);
    eq(value, 'wobble');
  });

  it('should notify via meta.type event', async () => {
    const schema = string().meta({ type: 'metatype' }).oneOf(['WIBBLE']).example();
    TestDataFactory.session.once('metatype', (event) => {
      eq(event.value, 'WIBBLE');
      // eslint-disable-next-line no-param-reassign
      event.value = 'wobble';
    });
    const value = await TestDataFactory.generate(schema);
    eq(value, 'wobble');
  });

  it('should notify via id event', async () => {
    TestDataFactory.addGenerator('wibble', new CustomGenerator());
    const schema = string().example({ generator: 'wibble' });
    TestDataFactory.session.once('wibble', (event) => {
      eq(event.value, 'WIBBLE');
      // eslint-disable-next-line no-param-reassign
      event.value = 'wobble';
    });
    const value = await TestDataFactory.generate(schema);
    eq(value, 'wobble');
  });

  it('should reinitialise', async () => {
    const session = TestDataFactory.session;
    session.setProperty('wibble', 'wobble');
    session.on('some-event', () => {
      fail('Event handler was not reset');
    });

    TestDataFactory.init();

    eq(session.emit('some-event'), false);
    eq(session.getProperty('wibble'), undefined);
  });

  it('should support adding multiple generators', async () => {
    TestDataFactory.init().addGenerators({
      wibble: new CustomGenerator(),
    });
    const schema = string().example({ generator: 'wibble' });
    const value = await TestDataFactory.generate(schema);
    eq(value, 'WIBBLE');
  });

  it('should support adding multiple generators during intialisation', async () => {
    TestDataFactory.init({
      generators: {
        wibble: new CustomGenerator(),
      },
    });

    const schema = string().example({ generator: 'wibble' });
    const value = await TestDataFactory.generate(schema);
    eq(value, 'WIBBLE');
  });

  class CustomGenerator {
    generate() {
      return 'WIBBLE';
    }
  }
});
