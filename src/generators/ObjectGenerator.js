const debug = require('debug')('yup-by-example:generators:ObjectGenerator');
const BaseGenerator = require('./BaseGenerator');

class ArrayGenerator extends BaseGenerator {

  generate({ chance, schema }) {
    const value = this.hasWhitelist(schema)
      ? this.oneOf(chance, schema.oneOf)
      : Object.keys(schema.fields).reduce((obj, fieldName) => {
        return this.hasTransform(schema.fields[fieldName], 'yupByExample')
          ? Object.assign(obj, { [fieldName]: null })
          : obj;
      }, {});
    debug('Generated object{%o}', value);
    return value;
  }
}

module.exports = ArrayGenerator;
