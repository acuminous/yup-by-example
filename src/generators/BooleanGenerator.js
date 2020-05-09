const BaseGenerator = require('./BaseGenerator');

class BooleanGenerator extends BaseGenerator {

  generate({ schema }) {
    if (this.hasWhitelist(schema)) return this.oneOf(schema.whitelist);
    return this.chance.bool();
  }
}

module.exports = BooleanGenerator;
