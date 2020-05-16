const debug = require('debug')('yup-by-example:generators:FunctionGenerator');
const BaseGenerator = require('./BaseGenerator');

class FunctionGenerator extends BaseGenerator {

  generate({ id, chance, session, params: fn }) {
    const value = fn({ id, chance, session });
    debug('Generated fn[%s](%o)', fn.name || 'anonymous', value);
    return value;
  }
}

module.exports = FunctionGenerator;
