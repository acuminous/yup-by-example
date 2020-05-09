import BaseGenerator from './BaseGenerator';

class ArrayGenerator extends BaseGenerator {

  generate(schema) {
    return Object.keys(schema.fields).reduce((obj, fieldName) => {
      return { ...obj, [fieldName]: null }
    }, {});
  }
}

export default ArrayGenerator;
