import BaseGenerator from './BaseGenerator';
import _get from 'lodash.get';

const MIN_ARRAY_SIZE = 3;
const MAX_ARRAY_SIZE = 5;

class ArrayGenerator extends BaseGenerator {

  generate({ schema, session }) {
    if (this.hasWhitelist(schema)) return this.oneOf(schema.whitelist);
    const { min } = this.getTestParameters(schema, 'min');
    const { max } = this.getTestParameters(schema, 'max');
    const length = this.getLength({
      session,
      sessionKey: this.getSessionKey(schema, 'meta.sessionKey'),
      min: this.getMin(min),
      max: this.getMax(max)
    });
    return new Array(length).fill(null);
  }

  getSessionKey(schema, path) {
    return _get(schema, path);
  }

  getMin(min) {
    return min !== undefined ? min : MIN_ARRAY_SIZE;
  }

  getMax(max) {
    return max !== undefined ? max : MAX_ARRAY_SIZE;
  }

  getLength({ session, sessionKey, min, max }) {
    return session.hasProperty(`${sessionKey}.length`)
      ? session.getProperty(`${sessionKey}.length`)
      : this.chance.integer({ min, max });
  }
}

export default ArrayGenerator;
