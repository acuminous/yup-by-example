const _has = require('lodash.has');
const _get = require('lodash.get');
const _set = require('lodash.set');
const _unset = require('lodash.unset');

class TestDataSession {

  constructor(params = {}) {
    this._now = params.now || new Date();
    this._store = {};
  }

  get now() {
    return this._now;
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

  removeProperty(path) {
    return _unset(this._store, path);
  }
}

module.exports = TestDataSession
