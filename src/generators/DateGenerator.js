const debug = require('debug')('yup-by-example:generators:DateGenerator');
const BaseGenerator = require('./BaseGenerator');

const MIN_DATE = new Date('1970-01-01T00:00:00.000Z');
const MAX_DATE = new Date('3000-01-01T00:00:00.000Z');

class DateGenerator extends BaseGenerator {

  generate({ chance, schema }) {
    if (this.hasWhitelist(schema)) return this.oneOf(chance, schema.whitelist);
    const { min } = this.getTestParameters(schema, 'min');
    const { max } = this.getTestParameters(schema, 'max');
    const millies = this.getMillis(chance, min, max);
    const value = new Date(millies);
    debug('Generated date{%o}', value);
    return value;
  }

  getMillis(chance, min = MIN_DATE, max = MAX_DATE) {
    return chance.integer({ min: min.getTime(), max: max.getTime() });
  }
}

module.exports = DateGenerator;
