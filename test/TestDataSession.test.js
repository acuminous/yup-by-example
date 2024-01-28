const { before, beforeEach, after, afterEach, describe, it } = require('zunit');

const { eq } = require('./assert');
const TestDataSession = require('../src/TestDataSession');

describe('TestDataSession', () => {

  describe('consumeProperty', () => {
    it('should consume properties', () => {
      const session = new TestDataSession();
      session.setProperty('foo.bar', 1);
      const value = session.consumeProperty('foo.bar');

      eq(value, 1);
      eq(session.hasProperty('foo.bar'), false);
    });

    it('should return default value', () => {
      const session = new TestDataSession();
      const value = session.consumeProperty('foo.bar', 2);

      eq(value, 2);
      eq(session.hasProperty('foo.bar'), false);
    });
  });

  describe('incrementProperty', () => {
    it('should increment existing properties', () => {
      const session = new TestDataSession();
      session.setProperty('foo.bar', 1);
      const value = session.incrementProperty('foo.bar');

      eq(value, 2);
      eq(session.getProperty('foo.bar'), 2);
    });

    it('should increment new properties', () => {
      const session = new TestDataSession();
      const value = session.incrementProperty('foo.bar');

      eq(value, 1);
      eq(session.getProperty('foo.bar'), 1);
    });
  });
});
