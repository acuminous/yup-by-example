const debug = require('debug')('yup-by-example:generators:RelativeDateGenerator');
const BaseGenerator = require('./BaseGenerator');
const { add } = require('date-fns');

class RelativeDateGenerator extends BaseGenerator {
  generate({ session, params }) {
    const value = params ?
      add(session.now, params)
      : new Date(session.now);
    debug('Generated relative date{%o}', value);
    return value;
  }
}

module.exports = RelativeDateGenerator;
