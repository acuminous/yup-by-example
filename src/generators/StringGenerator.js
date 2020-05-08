import { random, internet } from 'faker';

const DEFAULT_MIN = 10;
const DEFAULT_MAX = 20;

class StringGenerator {
  constructor(session) {
    this.session = session;
  }

  generate(schema) {
    const { min } = this.getTestParameters(schema, 'min');
    const { max } = this.getTestParameters(schema, 'max');
    const { length } = this.getTestParameters(schema, 'length');
    if (this.hasTest(schema, 'email')) return internet.email();
    if (this.hasTest(schema, 'url')) return internet.url();
    return random.alphaNumeric(length || this.getLength(min, max));
  }

  getTest(schema, testName) {
    return schema.tests.find(test => test.name === testName);
  }

  hasTest(schema, testName) {
    return !!this.getTest(schema, testName);
  }

  getTestParameters(schema, testName) {
    const test = this.getTest(schema, testName);
    return test ? test.params : {};
  }

  getLength(min, max) {
    if (typeof min === 'number' && typeof max === 'number') return random.number({ min, max });
    if (typeof min === 'number') return random.number({ min, max: min + 10 });
    if (typeof max === 'number') return random.number({ min: Math.max(1, max - 10), max });
    return random.number({ min: DEFAULT_MIN, max: DEFAULT_MAX });
  }
}

export default StringGenerator;
