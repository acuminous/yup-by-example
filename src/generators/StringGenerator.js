import BaseGenerator from './BaseGenerator';

const MIN = 10;
const SPREAD = 10;

class StringGenerator extends BaseGenerator {

  generate({ schema }) {
    if (this.hasWhitelist(schema)) return this.oneOf(schema.whitelist);
    const { min } = this.getTestParameters(schema, 'min');
    const { max } = this.getTestParameters(schema, 'max');
    const { length = this.getLength(min, max) } = this.getTestParameters(schema, 'length');
    if (this.hasTest(schema, 'email')) return this.chance.email();
    if (this.hasTest(schema, 'url')) return this.chance.url();
    return this.chance.string({ length, alpha: true });
  }

  getLength(min, max) {
    if (typeof min === 'number' && typeof max === 'number') return this.chance.integer({ min, max });
    if (typeof min === 'number') return this.chance.integer({ min, max: min + SPREAD });
    if (typeof max === 'number') return this.chance.integer({ min: Math.max(1, max - SPREAD), max });
    return this.chance.integer({ min: MIN, max: MIN + SPREAD });
  }
}

export default StringGenerator;
