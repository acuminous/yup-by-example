const BaseGenerator = require('./BaseGenerator');

class FunctionGenerator extends BaseGenerator {

  generate({ params: fn }) {
    return fn(this.chance);
  }
}

module.exports = FunctionGenerator;
