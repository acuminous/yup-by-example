const BaseGenerator = require('./BaseGenerator');

class ArrayGenerator extends BaseGenerator {

  generate({ schema }) {
    if (this.hasWhitelist(schema)) return this.oneOf(schema.whitelist);
    return Object.keys(schema.fields).reduce((obj, fieldName) => {
      return this.hasTransform(schema.fields[fieldName], 'yupByExample')
        ? Object.assign(obj, { [fieldName]: null })
        : obj;
    }, {});
  }
}

module.exports = ArrayGenerator;
