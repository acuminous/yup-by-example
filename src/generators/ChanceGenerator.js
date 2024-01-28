const debug = require('debug')('yup-by-example:generators:ChanceGenerator');
const BaseGenerator = require('./BaseGenerator');

class ChanceGenerator extends BaseGenerator {

  generate({ chance, params }) {
    const generator = chance[params.method];
    if (!generator) throw new Error(`The installed version of Chance does not have the '${params.method}' generator`);
    const value = chance[params.method](params.params);
    debug('Generated chance[%s]{%o}', params.method, value);
    return value;
  }
}

module.exports = ChanceGenerator;
