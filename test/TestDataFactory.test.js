const TestDataFactory = require('../src/TestDataFactory');
const { mixed, object, string, number, date } = require('yup');

describe('TestDataFactory', () => {

  beforeEach(() => {
    TestDataFactory.init();
  });

  it('should generate test data without options', async () => {
    const schema = number().when('$required', {
      is: true,
      then: number().min(1).max(1).integer().required().example(),
      otherwise: number().min(2).max(2).integer().required().example(),
    }).example()

    const mandatory = await TestDataFactory.generate(schema, { context: { required: true } });
    const optional = await TestDataFactory.generate(schema, { context: { required: false } });
    expect(mandatory).to.equal(1);
    expect(optional).to.equal(2);
  })

  it('should tolerate validation options passed to cast', async () => {
    const schema = number().when('$enabled', {
      is: true,
      then: number().example().required(),
      otherwise: number().example().notRequired(),
    }).example()

    const mandatory = await TestDataFactory.generate(schema, { context: { required: true, abortEarly: true } });
    const optional = await TestDataFactory.generate(schema, { context: { required: false, abortEarly: true } });

    expect(mandatory).to.be.a('number');
    expect(optional).to.be.null;
  })

  it('should validate test data without options', async () => {
    const schema = object().shape({
      a: string().matches(/wibble/).required(),
      b: string().matches(/wobble/).required(),
    }).example();
    try {
      await TestDataFactory.generateValid(schema);
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
      await TestDataFactory.generateValid(schema, { abortEarly: false });
      expect.fail('Should have reported a validation error')
    } catch (err) {
      expect(err.errors.length).to.equal(2)
    }
  })

  it('should report missing id generators', async () => {
    const schema = string().example({ generator: 'missing' });
    await expect(TestDataFactory.generateValid(schema))
      .to.be.rejectedWith('Unable to resolve generator from [\'missing\']');
  })

  it('should report missing type generators', async () => {
    TestDataFactory.removeGenerator('date');
    const schema = date().meta({ type: 'missing' }).example();
    await expect(TestDataFactory.generateValid(schema))
      .to.be.rejectedWith('Unable to resolve generator from [\'missing\', \'date\']');
  })

  it('should select generator by id', async () => {
    TestDataFactory.addGenerator('wibble', new CustomGenerator());
    const schema = string().example({ generator: 'wibble' });
    const value = await TestDataFactory.generateValid(schema);
    expect(value).to.equal('WIBBLE');
  })

  it('should select generator by meta.type', async () => {
    TestDataFactory.addGenerator('wibble', new CustomGenerator());
    const schema = string().meta({ type: 'wibble' }).example();
    const value = await TestDataFactory.generateValid(schema);
    expect(value).to.equal('WIBBLE');
  })

  it('should select generator by type', async () => {
    const schema = string().example();
    const value = await TestDataFactory.generateValid(schema);
    expect(value).to.be.a('string');
  })

  it('should tolerate missing generators for meta.type', async () => {
    const schema = string().meta({ type: 'missing' }).example();
    const value = await TestDataFactory.generateValid(schema);
    expect(value).to.be.a('string');
  })

  it('should report validation errors when using generateValid', async () => {
    const schema = string().matches('does not match').example();
    await expect(TestDataFactory.generateValid(schema))
      .to.be.rejectedWith('this must match the following: "does not match"');
  });

  it('should permit validation errors when using generate', async () => {
    const schema = string().matches('does not match').example();
    await expect(TestDataFactory.generate(schema))
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

  it('should notify via type event', async () => {
    const schema = string().oneOf(['WIBBLE']).example();
    TestDataFactory.session.once('string', event => {
      expect(event.value).to.equal('WIBBLE');
      event.value = 'wobble';
    });
    const value = await TestDataFactory.generate(schema);
    expect(value).to.equal('wobble');
  })

  it('should notify via meta.type event', async () => {
    const schema = string().meta({ type: 'metatype' }).oneOf(['WIBBLE']).example();
    TestDataFactory.session.once('metatype', event => {
      expect(event.value).to.equal('WIBBLE');
      event.value = 'wobble';
    });
    const value = await TestDataFactory.generate(schema);
    expect(value).to.equal('wobble');
  })

  it('should notify via id event', async () => {
    TestDataFactory.addGenerator('wibble', new CustomGenerator());
    const schema = string().example({ generator: 'wibble' });
    TestDataFactory.session.once('wibble', event => {
      expect(event.value).to.equal('WIBBLE');
      event.value = 'wobble';
    });
    const value = await TestDataFactory.generate(schema);
    expect(value).to.equal('wobble');
  })

  it('should reinitialise', async () => {
    const session = TestDataFactory.session;
    session.setProperty('wibble', 'wobble');
    session.on('some-event', () => {
      expect.fail('Event handler was not reset');
    })

    TestDataFactory.init();

    expect(session.emit('some-event')).to.equal(false);
    expect(session.getProperty('wibble')).to.be.undefined;
  })

  it('should support adding multiple generators', async () => {
    TestDataFactory.init().addGenerators({
      wibble: new CustomGenerator(),
    });
    const schema = string().example({ generator: 'wibble' });
    const value = await TestDataFactory.generate(schema);
    expect(value).to.equal('WIBBLE');
  })

  it('should support adding multiple generators during intialisation', async () => {
    TestDataFactory.init({
      generators: {
        wibble: new CustomGenerator()
      }
    });

    const schema = string().example({ generator: 'wibble' });
    const value = await TestDataFactory.generate(schema);
    expect(value).to.equal('WIBBLE');
  })

  class CustomGenerator {
    generate() {
      return 'WIBBLE'
    }
  }
});

