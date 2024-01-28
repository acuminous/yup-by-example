const assert = require('node:assert');

const extras = {
  gt: function gt(actual, expected, message) {
    if (!(actual > expected)) {
      throw new assert.AssertionError({
        message: message || `${actual} is not greater than ${expected}`,
        actual,
        expected,
        operator: '>',
        stackStartFn: gt,
      });
    }
  },
  gte: function gte(actual, expected, message) {
    if (!(actual >= expected)) {
      throw new assert.AssertionError({
        message: message || `${actual} is not greater than or equal to ${expected}`,
        actual,
        expected,
        operator: '>=',
        stackStartFn: gte,
      });
    }
  },
  lt: function lt(actual, expected, message) {
    if (!(actual < expected)) {
      throw new assert.AssertionError({
        message: message || `${actual} is not less than ${expected}`,
        actual,
        expected,
        operator: '<',
        stackStartFn: lt,
      });
    }
  },
  lte: function lte(actual, expected, message) {
    if (!(actual <= expected)) {
      throw new assert.AssertionError({
        message: message || `${actual} is not less than or equal to ${expected}`,
        actual,
        expected,
        operator: '<=',
        stackStartFn: lte,
      });
    }
  },
  includes: function includes(items, item) {
    assert.ok(items.includes(item), `${item} is not in [${items.join(',')}]`);
  },
  excludes: function includes(items, item) {
    assert.ok(!items.includes(item), `${item} is in [${items.join(',')}]`);
  },
  isNumber: function isNumber(actual) {
    assert.strictEqual(typeof actual, 'number');
  },
  isString: function isString(actual) {
    assert.strictEqual(typeof actual, 'string');
  },
  isInteger: function isInteger(actual) {
    extras.isNumber(actual);
    assert.strictEqual(actual, Math.floor(actual));
  },
  isBoolean: function isBoolean(actual) {
    assert.strictEqual(typeof JSON.parse(actual), 'boolean');
  },
  isDate: function isDate(actual) {
    assert.ok(actual instanceof Date, `${actual} is not a Date`);
  },
  mostlyFloatingPoints(values) {
    const threshold = Math.floor(values.length * 0.1);
    let failures = 0;
    values.map(Number).forEach((value) => {
      if (Math.floor(value) === value) failures++;
    });
    extras.lt(failures, threshold);
  },
  eq: assert.strictEqual,
  neq: assert.strictEqual,
  deq: assert.deepStrictEqual,
  ndeq: assert.notDeepEqual,
  accepts: assert.doesNotReject,
};

module.exports = { ...extras, ...assert };
