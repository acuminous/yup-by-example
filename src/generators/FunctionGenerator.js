const BaseGenerator = require('./BaseGenerator');

class FunctionGenerator extends BaseGenerator {

  generate({ id, session, params: fn }) {
    return fn({ id, session, chance: this.chance });
  }
}

module.exports = FunctionGenerator;
