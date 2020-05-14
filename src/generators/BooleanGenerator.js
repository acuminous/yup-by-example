const debug = require('debug')('yup-by-example:generators:BooleanGenerator');

const BaseGenerator = require('./BaseGenerator');

class BooleanGenerator extends BaseGenerator {

  generate({ schema }) {
    const value = this.hasWhitelist(schema)
      ? this.oneOf(schema.whitelist)
      : this.chance.bool();

    debug('Generated boolean{%o}', value);
    return value
  }
}

module.exports = BooleanGenerator;
