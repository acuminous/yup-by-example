import { addMethod } from 'yup';
import generators from './generators';

class TestDataFactory {

  constructor() {
    this.session = {};
  }

  addMethod(schema, name) {
    const factory = this;
    addMethod(schema, name, function(id) {
      return this.transform(function(value, originalValue) {
        const { type, meta = {} } = this.describe();
        const generator = factory._resolve([id, meta.example, meta.type, type].filter(Boolean));
        return generator.generate(this.describe(), value, originalValue);
      });
    })
  }

  _resolve(candidates) {
    const Generator = candidates.reduce((winner, candidate) => generators[candidate], null);
    if (!Generator) throw new Error(`Unable to resolve generator from ${candidates.join(', ')}`);
    return new Generator(this.session);
  }

}

export default TestDataFactory
