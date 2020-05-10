const BaseGenerator = require('./BaseGenerator');

const MIN_ARRAY_SIZE = 3;
const MAX_ARRAY_SIZE = 5;

class ArrayGenerator extends BaseGenerator {

  generate({ schema, session }) {
    return this.hasWhitelist(schema)
      ? this.generateFromWhitelist(schema, session)
      : this.generateFromParameters(schema, session);
  }

  generateFromWhitelist(schema, session) {
    return this.oneOf(schema.whitelist);
  }

  generateFromParameters(schema, session) {
    const sessionKey = this.getSessionKey(schema);
    const { min } = this.getTestParameters(schema, 'min');
    const { max } = this.getTestParameters(schema, 'max');
    const length = this.getLength({
      session,
      sessionKey,
      min: this.getMin(min),
      max: this.getMax(max)
    });
    return new Array(length).fill(null);
  }

  getMin(min) {
    return min !== undefined ? min : MIN_ARRAY_SIZE;
  }

  getMax(max) {
    return max !== undefined ? max : MAX_ARRAY_SIZE;
  }

  getLength({ session, sessionKey, min, max }) {
    return session.hasProperty(`${sessionKey}.length`)
      ? session.getProperty(`${sessionKey}.length`)
      : this.chance.integer({ min, max });
  }
}

module.exports = ArrayGenerator;
