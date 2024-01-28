const _get = require('lodash.get');

class BaseGenerator {

  getTest(schema, testName) {
    return schema.tests.find((test) => test.name === testName);
  }

  hasTest(schema, testName) {
    return !!this.getTest(schema, testName);
  }

  getTestParameters(schema, testName) {
    const test = this.getTest(schema, testName);
    return test ? test.params : {};
  }

  hasWhitelist(schema) {
    return schema.whitelist.length > 0;
  }

  hasTransform(field, transformName) {
    return field.transforms.find((t) => {
      return t.name === transformName;
    });
  }

  oneOf(chance, candidates) {
    const index = chance.integer({ min: 0, max: candidates.length - 1 });
    return candidates[index];
  }
}

module.exports = BaseGenerator;
