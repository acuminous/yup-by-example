import _has from 'lodash.has';
import _get from 'lodash.get';
import _set from 'lodash.set';
import _unset from 'lodash.unset';

class TestDataSession {

  constructor(params = {}) {
    this.session = {};
    this._now = params.now || new Date();
  }

  get now() {
    return this._now;
  }

  hasProperty(path) {
    return _has(this.session, path);
  }

  getProperty(path, fallback) {
    return _get(this.session, path, fallback);
  }

  setProperty(path, value) {
    return _set(this.session, path, value);
  }

  removeProperty(path) {
    return _unset(this.session, path);
  }

  reset() {
    this.session = {};
  }
}

export default TestDataSession
