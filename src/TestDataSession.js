import _has from 'lodash.has';
import _get from 'lodash.get';
import _set from 'lodash.set';
import _unset from 'lodash.unset';

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

export default TestDataSession
