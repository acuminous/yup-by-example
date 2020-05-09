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
}

export default BaseGenerator;
