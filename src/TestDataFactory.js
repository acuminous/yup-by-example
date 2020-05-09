const yup = require('yup');
const Chance = require('chance');
const _get = require('lodash.get');
const standardGenerators = require('./generators');
const TestDataSession = require('./TestDataSession');

class TestDataFactory {

  constructor(params) {
    this.reset(params);
  }

  reset(params = {}) {
    this._session = new TestDataSession({ now: _get(params, 'now', new Date()) });
    this._seed = _get(params, 'seed', Math.ceil(Math.random() * 999999999));
    this._chance = new Chance(this._seed);
    this._generators = Object.assign({}, standardGenerators);
    this._bypass = true;
  }

  get session() {
    return this._session;
  }

  async generate(schema) {
    this._bypass = false;
    try {
      return schema.cast(null);
    } finally {
      this._bypass = true;
    }
  }

  async generateValid(schema) {
    const document = await this.generate(schema);
    await schema.validate(document);
    return document;
  }

  addMethod(schema, name) {
    const factory = this;
    yup.addMethod(schema, name, function(id, params) {
      return this.transform(function yupByExample(value, originalValue) {
        if (factory._bypass) return value;
        if (id && !factory._generators[id]) throw new Error(`No generator for id: '${id}'`);
        const { type, meta = {} } = this.describe();
        const generator = factory._resolve([id, meta.type, type].filter(Boolean));
        return generator.generate({
          id,
          params,
          session: factory._session,
          schema: factory._describe(this),
          value,
          originalValue
        });
      });
    })
    return factory;
  }

  addNoopMethod(schema, name) {
    const factory = this;
    yup.addMethod(schema, name, function() {
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

}

module.exports = TestDataFactory
