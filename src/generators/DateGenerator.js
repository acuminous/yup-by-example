import BaseGenerator from './BaseGenerator';

const MIN_DATE = new Date('1970-01-01T00:00:00.000');
const MAX_DATE = new Date('3000-01-01T00:00:00.000');

class DateGenerator extends BaseGenerator {

  generate(schema) {
    if (this.hasWhitelist(schema)) return this.oneOf(schema.whitelist);
    const { min } = this.getTestParameters(schema, 'min');
    const { max } = this.getTestParameters(schema, 'max');
    const millies = this.getMillis(min, max);
    return new Date(millies);
  }

  getMillis(min = MIN_DATE, max = MAX_DATE) {
    return this.chance.integer({ min: min.getTime(), max: max.getTime() });
  }
}

export default DateGenerator;
