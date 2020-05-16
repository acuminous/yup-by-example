const debug = require('debug')('yup-by-example:generators:BooleanGenerator');

const BaseGenerator = require('./BaseGenerator');

class BooleanGenerator extends BaseGenerator {

  generate({ chance, schema }) {
    const value = this.hasWhitelist(schema)
      ? this.oneOf(chance, schema.whitelist)
      : chance.bool();

    debug('Generated boolean{%o}', value);
    return value
  }
}

module.exports = BooleanGenerator;
