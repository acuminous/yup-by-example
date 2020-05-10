const BaseGenerator = require('./BaseGenerator');

class LiteralGenerator extends BaseGenerator {

  generate({ params }) {
    return params;
  }
}

module.exports = LiteralGenerator;
