const debug = require('debug')('yup-by-example:generators:RelativeDateGenerator');
const { add } = require('date-fns');
const BaseGenerator = require('./BaseGenerator');

class RelativeDateGenerator extends BaseGenerator {
  generate({ now, params }) {
    const value = params ? add(now, params) : new Date(now);
    debug('Generated relative date{%o}', value);
    return value;
  }
}

module.exports = RelativeDateGenerator;
