const debug = require('debug')('yup-by-example:generators:LiteralGenerator');
const BaseGenerator = require('./BaseGenerator');

class LiteralGenerator extends BaseGenerator {

  generate({ params: value }) {
    debug('Generated literal{%o}', value);
    return value;
  }
}

module.exports = LiteralGenerator;
