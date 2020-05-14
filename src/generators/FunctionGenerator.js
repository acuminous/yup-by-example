const debug = require('debug')('yup-by-example:generators:FunctionGenerator');
const BaseGenerator = require('./BaseGenerator');

class FunctionGenerator extends BaseGenerator {

  generate({ id, session, params: fn }) {
    const value = fn({ id, session, chance: this.chance });
    debug('Generated fn[%s](%o)', fn.name || 'anonymous', value);
    return value;
  }
}

module.exports = FunctionGenerator;
