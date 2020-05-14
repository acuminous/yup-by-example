const TestDataFactory = require('../src/TestDataFactory');
const { mixed, object, string, number, date } = require('yup');

describe('TestDataFactory', () => {

  let testDataFactory;

  beforeEach(() => {
    testDataFactory = TestDataFactory.init();
  });

  it('should generate test data without options', async () => {
    const schema = number().when('$required', {
      is: true,
      then: number().min(1).max(1).integer().required().example(),
      otherwise: number().min(2).max(2).integer().required().example(),
    }).example()

    const mandatory = await testDataFactory.generate(schema, { context: { required: true } });
    const optional = await testDataFactory.generate(schema, { context: { required: false } });
    expect(mandatory).to.equal(1);
    expect(optional).to.equal(2);
  })

  it('should tolerate validation options passed to cast', async () => {
    const schema = number().when('$enabled', {
      is: true,
      then: number().example().required(),
      otherwise: number().example().notRequired(),
    }).example()

    const mandatory = await testDataFactory.generate(schema, { context: { required: true, abortEarly: true } });
    const optional = await testDataFactory.generate(schema, { context: { required: false, abortEarly: true } });

    expect(mandatory).to.be.a('number');
    expect(optional).to.be.null;
  })

  it('should validate test data without options', async () => {
    const schema = object().shape({
      a: string().matches(/wibble/).required(),
      b: string().matches(/wobble/).required(),
    }).example();
    try {
      await testDataFactory.generateValid(schema);
      expect.fail('Should have reported a validation error')
    } catch (err) {
      expect(err.errors.length).to.equal(1)
    }
  })

  it('should validate test data with options', async () => {
    const schema = object().shape({
      a: string().matches(/wibble/).required(),
      b: string().matches(/wobble/).required(),
    }).example();
    try {
      await testDataFactory.generateValid(schema, { abortEarly: false });
      expect.fail('Should have reported a validation error')
    } catch (err) {
      expect(err.errors.length).to.equal(2)
    }
  })

  it('should report missing generators', async () => {
    const schema = string().example({ generator: 'missing' });
    await expect(testDataFactory.generateValid(schema))
      .to.be.rejectedWith('No such generator: \'missing\'');
  })

  it('should report unresolvable generators', async () => {
    testDataFactory.removeGenerator('date');
    const schema = date().meta({ type: 'missing' }).example();
    await expect(testDataFactory.generateValid(schema))
      .to.be.rejectedWith('Unable to resolve generator from [\'missing\', \'date\']');
  })

  it('should select generator by id', async () => {
    testDataFactory.addGenerator('wibble', CustomGenerator);
    const schema = string().example({ generator: 'wibble' });
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
    TestDataFactory.stub();
    const schema = string().example();
    const value = schema.cast('WIBBLE');
    expect(value).to.equal('WIBBLE');
  });

  it('should notify via example event', async () => {
    const schema = string().oneOf(['WIBBLE']).example();
    testDataFactory.session.once('example', event => {
      expect(event.value).to.equal('WIBBLE');
      event.value = 'wobble';
    });
    const value = await testDataFactory.generate(schema);
    expect(value).to.equal('wobble');
  })

  it('should notify via renamed example event', async () => {
    testDataFactory = TestDataFactory.init({ methodName: 'generate' });
    const schema = string().oneOf(['WIBBLE']).generate();
    testDataFactory.session.once('generate', event => {
      expect(event.value).to.equal('WIBBLE');
      event.value = 'wobble';
    });
    const value = await testDataFactory.generate(schema);
    expect(value).to.equal('wobble');
  })

  it('should notify via type event', async () => {
    const schema = string().oneOf(['WIBBLE']).example();
    testDataFactory.session.once('string', event => {
      expect(event.value).to.equal('WIBBLE');
      event.value = 'wobble';
    });
    const value = await testDataFactory.generate(schema);
    expect(value).to.equal('wobble');
  })

  it('should notify via meta.type event', async () => {
    const schema = string().meta({ type: 'metatype' }).oneOf(['WIBBLE']).example();
    testDataFactory.session.once('metatype', event => {
      expect(event.value).to.equal('WIBBLE');
      event.value = 'wobble';
    });
    const value = await testDataFactory.generate(schema);
    expect(value).to.equal('wobble');
  })

  it('should notify via id event', async () => {
    testDataFactory.addGenerator('wibble', CustomGenerator);
    const schema = string().example({ generator: 'wibble' });
    testDataFactory.session.once('wibble', event => {
      expect(event.value).to.equal('WIBBLE');
      event.value = 'wobble';
    });
    const value = await testDataFactory.generate(schema);
    expect(value).to.equal('wobble');
  })

  it('should reset', async () => {
    const session = testDataFactory.session;
    session.setProperty('wibble', 'wobble');
    session.on('example', () => {
      expect.fail('Event handler was not reset');
    })

    testDataFactory.reset();

    expect(session.emit('example')).to.equal(false);
    expect(session.getProperty('wibble')).to.be.undefined;
  })

  class CustomGenerator {
    generate() {
      return 'WIBBLE'
    }
  }
});

