import * as yup from 'yup';
import Chance from 'chance';
import _get from 'lodash.get';
import standardGenerators from './generators';
import TestDataSession from './TestDataSession';

class TestDataFactory {

  constructor(params = {}) {
    this.session = new TestDataSession({ now: _get(params, 'now', new Date()) });
    this.seed = _get(params, 'seed', Math.ceil(Math.random() * 999999999));
    this.chance = new Chance(this.seed);
    this.generators = { ...standardGenerators };
    this.bypass = true;
  }

  generate(schema) {
    this.bypass = false;
    try {
      return schema.cast(null);
    } finally {
      this.bypass = true;
    }
  }

  addMethod(schema, name) {
    const factory = this;
    yup.addMethod(schema, name, function(id, params) {
      return this.transform(function(value, originalValue) {
        if (factory.bypass) return value;
        if (id && !factory.generators[id]) throw new Error(`No generator for id: '${id}'`);
        const { type, meta = {} } = this.describe();
        const generator = factory._resolve([id, meta.type, type].filter(Boolean));
        return generator.generate({
          id,
          params,
          session: factory.session,
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
    this.generators[id] = Generator;
    return this;
  }

  removeGenerator(id) {
    delete this.generators[id];
    return this;
  }

  _resolve(candidates) {
    const found = candidates.find(candidate => !!this.generators[candidate]);
    const Generator = this.generators[found];
    if (!Generator) {
      const names = candidates.map(candidate => `'${candidate}'`).join(', ');
      throw new Error(`Unable to resolve generator from [${names}]`);
    }
    return new Generator({ chance: this.chance });
  }

  _describe(schema) {
    // See https://github.com/jquense/yup/issues/883
    const description = schema.describe();
    description.whitelist = schema._whitelist ? Array.from(schema._whitelist.list) : [];
    description.blacklist = schema._blacklist ? Array.from(schema._blacklist.list) : [];
    return description;
  }

}

export default TestDataFactory
