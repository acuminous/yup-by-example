import * as yup from 'yup';
import standardGenerators from './generators';
import Chance from 'chance';
import get from 'lodash.get';

class TestDataFactory {

  constructor(params = {}) {
    this.seed = get(params, 'seed', this.seed());
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

  seed() {
    return Math.ceil(Math.random() * 999999999);
  }

  addMethod(schema, name) {
    const factory = this;
    yup.addMethod(schema, name, function(id) {
      return this.transform(function(value, originalValue) {
        if (factory.bypass) return value;
        if (id && !factory.generators[id]) throw new Error(`No generator for id: '${id}'`);
        const { type, meta = {} } = this.describe();
        const generator = factory._resolve([id, meta.type, type].filter(Boolean));
        return generator.generate(this.describe(), value, originalValue);
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

}

export default TestDataFactory
