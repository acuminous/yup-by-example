const TestDataSession = require('../src/TestDataSession');

describe('TestDataSession', () => {

  describe('consumeProperty', () => {
    it('should consume properties', () => {
      const session = new TestDataSession();
      session.setProperty('foo.bar', 1);
      const value = session.consumeProperty('foo.bar');

      expect(value).to.equal(1);
      expect(session.hasProperty('foo.bar')).to.be.undefined;
    })

    it('should return default value', () => {
      const session = new TestDataSession();
      const value = session.consumeProperty('foo.bar', 2);

      expect(value).to.equal(2);
      expect(session.hasProperty('foo.bar')).to.be.undefined;
    })
  })

  describe('incrementProperty', () => {
    it('should increment existing properties', () => {
      const session = new TestDataSession();
      session.setProperty('foo.bar', 1);
      const value = session.incrementProperty('foo.bar');

      expect(value).to.equal(2);
      expect(session.getProperty('foo.bar')).to.equal(2);
    })

    it('should increment new properties', () => {
      const session = new TestDataSession();
      const value = session.incrementProperty('foo.bar');

      expect(value).to.equal(1);
      expect(session.getProperty('foo.bar')).to.equal(1);
    })
  })
});

