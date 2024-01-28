const EventEmitter = require('events');
const _has = require('lodash.has');
const _get = require('lodash.get');
const _set = require('lodash.set');
const _unset = require('lodash.unset');

class TestDataSession extends EventEmitter {

  constructor() {
    super();
    this._store = {};
  }

  hasProperty(path) {
    return _has(this._store, path);
  }

  getProperty(path, fallback) {
    return _get(this._store, path, fallback);
  }

  setProperty(path, value) {
    return _set(this._store, path, value);
  }

  incrementProperty(path) {
    const value = this.getProperty(path, 0) + 1;
    this.setProperty(path, value);
    return value;
  }

  consumeProperty(path, fallback) {
    const value = _get(this._store, path, fallback);
    this.removeProperty(path, value + 1);
    return value;
  }

  removeProperty(path) {
    return _unset(this._store, path);
  }

  close() {
    this.removeAllListeners();
    this._store = {};
  }
}

module.exports = TestDataSession;
