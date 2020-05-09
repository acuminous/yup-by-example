import BaseGenerator from './BaseGenerator';

class ArrayGenerator extends BaseGenerator {

  generate(schema) {
    if (this.hasWhitelist(schema)) return this.oneOf(schema.whitelist);
    return Object.keys(schema.fields).reduce((obj, fieldName) => {
      return { ...obj, [fieldName]: null }
    }, {});
  }
}

export default ArrayGenerator;
