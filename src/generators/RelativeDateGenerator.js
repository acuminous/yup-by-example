const BaseGenerator = require('./BaseGenerator');
const { add } = require('date-fns');

class RelativeDateGenerator extends BaseGenerator {
  generate({ session, params }) {
    return add(session.now, params)
  }
}

module.exports = RelativeDateGenerator;
