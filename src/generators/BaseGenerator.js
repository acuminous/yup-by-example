class BaseGenerator {

  constructor({ chance }) {
    this.chance = chance;
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

  hasWhitelist(schema) {
    return schema.whitelist.length > 0;
  }

  oneOf(candidates) {
    const index = this.chance.integer({ min: 0, max: candidates.length - 1 });
    return candidates[index];
  }
}

export default BaseGenerator;
