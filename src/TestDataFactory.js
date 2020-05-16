const debug = require('debug')('yup-by-example:TestDataFactory');
const yup = require('yup');
const Chance = require('chance');
const _get = require('lodash.get');
const standardGenerators = require('./generators');
const TestDataSession = require('./TestDataSession');

class TestDataFactory {

  static init(params = {}) {
    TestDataFactory._session.removeAllListeners();
    TestDataFactory._now = _get(params, 'now', new Date());
    TestDataFactory._session = new TestDataSession();
    TestDataFactory._chance = new Chance(_get(params, 'seed', Math.ceil(Math.random() * 999999999)));
    TestDataFactory._generators = Object.assign({}, standardGenerators, params.generators);
    TestDataFactory._enabled = false;
    return TestDataFactory;
  }

  static get now() {
    return TestDataFactory._now;
  }

  static get session() {
    return TestDataFactory._session;
  }

  static get chance() {
    return TestDataFactory._chance;
  }

  static get generators() {
    return TestDataFactory._generators;
  }

  static get enabled() {
    return TestDataFactory._enabled;
  }

  static get disabled() {
    return !TestDataFactory._enabled;
  }

  static async generate(schema, options) {
    TestDataFactory._enabled = true;
    try {
      return schema.cast(null, options);
    } finally {
      TestDataFactory._enabled = false;
    }
  }

  static async generateValid(schema, options) {
    const document = await TestDataFactory.generate(schema, options);
    await schema.validate(document, options);
    return document;
  }

  static addGenerator(id, Generator) {
    TestDataFactory._generators[id] = Generator;
    return TestDataFactory;
  }

  static addGenerators(generators) {
    Object.assign(TestDataFactory._generators, generators);
  }

  static removeGenerator(id) {
    delete TestDataFactory._generators[id];
    return TestDataFactory;
  }

  static getGenerator(candidates) {
    const names = candidates.map(candidate => `'${candidate}'`).join(', ');
    const found = candidates.find(candidate => Boolean(TestDataFactory._generators[candidate]));
    const Generator = TestDataFactory._generators[found];
    if (!Generator) throw new Error(`Unable to resolve generator from [${names}]`);

    debug('Resolved generator{%s} from candidates{[%s]}', found, names)
    return new Generator({ chance: TestDataFactory._chance });
  }

  static notify(events, data) {
    events.find(event => {
      const handled = TestDataFactory._session.emit(event, data)
      debug('Emitted event{%s}, handled{%o}', event, handled)
      return handled;
    });
  }
}

TestDataFactory._now = new Date();
TestDataFactory._session = new TestDataSession();
TestDataFactory._chance = new Chance();
TestDataFactory._generators = {};
TestDataFactory._enabled = false;

module.exports = TestDataFactory
