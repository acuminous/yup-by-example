const BaseGenerator = require('./BaseGenerator');
const { add } = require('date-fns');

class RelativeDateGenerator extends BaseGenerator {
  generate({ session, params }) {
    return params ? add(session.now, params) : new Date(session.now)
  }
}

module.exports = RelativeDateGenerator;
