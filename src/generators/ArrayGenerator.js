const debug = require('debug')('yup-by-example:generators:ArrayGenerator');
const BaseGenerator = require('./BaseGenerator');

const MIN_ARRAY_SIZE = 3;
const MAX_ARRAY_SIZE = 5;

class ArrayGenerator extends BaseGenerator {

  generate({ id, chance, schema, session }) {
    const value = this.hasWhitelist(schema)
      ? this.generateFromWhitelist(chance, schema, session)
      : this.generateFromParameters(id, chance, schema, session);
    if (Array.isArray(value)) debug('Generated array{%d}', value.length);
    else debug('Generated {%o}', value);
    return value;
  }

  generateFromWhitelist(chance, schema) {
    return this.oneOf(chance, schema.whitelist);
  }

  generateFromParameters(id, chance, schema, session) {
    const { min } = this.getTestParameters(schema, 'min');
    const { max } = this.getTestParameters(schema, 'max');
    const length = this.getLength({
      id,
      chance,
      session,
      min: this.getMin(min),
      max: this.getMax(max),
    });
    return new Array(length).fill(null);
  }

  getMin(min) {
    return min !== undefined ? min : MIN_ARRAY_SIZE;
  }

  getMax(max) {
    return max !== undefined ? max : MAX_ARRAY_SIZE;
  }

  getLength({ id, chance, session, min, max }) {
    return session.hasProperty(`${id}.length`)
      ? session.getProperty(`${id}.length`)
      : chance.integer({ min, max });
  }
}

module.exports = ArrayGenerator;
