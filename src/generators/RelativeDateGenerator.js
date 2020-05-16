const debug = require('debug')('yup-by-example:generators:RelativeDateGenerator');
const BaseGenerator = require('./BaseGenerator');
const { add } = require('date-fns');

class RelativeDateGenerator extends BaseGenerator {
  generate({ now, params }) {
    const value = params ? add(now, params) : new Date(now);
    debug('Generated relative date{%o}', value);
    return value;
  }
}

module.exports = RelativeDateGenerator;
