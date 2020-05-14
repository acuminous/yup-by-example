const yup = require('yup');
const Chance = require('chance');
const _get = require('lodash.get');
const standardGenerators = require('./generators');
const TestDataSession = require('./TestDataSession');

class TestDataFactory {

  static init(params = {}) {
    return new TestDataFactory(params).addMethod(yup.mixed, params.methodName);
  }

  static stub(params = {}) {
    return new TestDataFactory(params).addNoopMethod(yup.mixed, params.methodName);
  }

  constructor(params) {
    this.reset(params);
  }

  reset(params = {}) {
    if (this._session) this.session.close();
    this._methodName = _get(params, 'methodName', 'example');
    this._session = new TestDataSession({ now: _get(params, 'now', new Date()) });
    this._seed = _get(params, 'seed', Math.ceil(Math.random() * 999999999));
    this._chance = new Chance(this._seed);
    this._generators = Object.assign({}, standardGenerators);
    this._bypass = true;
  }

  get session() {
    return this._session;
  }

  async generate(schema, options) {
    this._bypass = false;
    try {
      return schema.cast(null, options);
    } finally {
      this._bypass = true;
    }
  }

  async generateValid(schema, options) {
    const document = await this.generate(schema, options);
    await schema.validate(document, options);
    return document;
  }

  addMethod(schema, name = 'example') {
    const factory = this;
    yup.addMethod(yup.mixed, name, function({ id, generator: generatorName } = {}, params) {
      return this.transform(function yupByExample(value, originalValue) {
        if (factory._bypass) return value;
        if (generatorName && !factory._generators[generatorName]) throw new Error(`No such generator: '${generatorName}'`);
        const { type, meta = {} } = this.describe();
        const generator = factory._resolve([generatorName, meta.type, type].filter(Boolean));
        const generatedValue = generator.generate({
          id,
          params,
          session: factory.session,
          schema: factory._describe(this),
          value,
          originalValue
        });
        return factory._notify([id, generatorName, meta.type, type, name], generatedValue);
      });
    })
    return factory;
  }

  addNoopMethod(schema, name = 'example') {
    const factory = this;
    yup.addMethod(yup.mixed, name, function() {
      return this.transform(function(value) {
        return value;
      })
    })
    return factory;
  }

  addGenerator(id, Generator) {
    this._generators[id] = Generator;
    return this;
  }

  removeGenerator(id) {
    delete this._generators[id];
    return this;
  }

  _resolve(candidates) {
    const found = candidates.find(candidate => Boolean(this._generators[candidate]));
    const Generator = this._generators[found];
    if (!Generator) {
      const names = candidates.map(candidate => `'${candidate}'`).join(', ');
      throw new Error(`Unable to resolve generator from [${names}]`);
    }
    return new Generator({ chance: this._chance });
  }

  _describe(schema) {
    // See https://github.com/jquense/yup/issues/883
    const description = schema.describe();
    description.whitelist = schema._whitelist ? Array.from(schema._whitelist.list) : [];
    description.blacklist = schema._blacklist ? Array.from(schema._blacklist.list) : [];
    Object.keys(schema.fields || []).forEach(fieldName => {
      const transforms = schema.fields[fieldName].transforms
        .filter(t => Boolean(t.name))
        .map(t => ({ name: t.name }));
      description.fields[fieldName].transforms = transforms;
    })
    return description;
  }

  _notify(events, value) {
    const wrapped = { value }
    events.find(event => this.session.emit(event, wrapped));
    return wrapped.value;
  }

}

module.exports = TestDataFactory
