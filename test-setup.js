global.chai = require('chai')
global.chai.use(require('chai-as-promised'))
global.chai.use(require('dirty-chai'))

global.expect = global.chai.expect;
global.chai.should();

Object.defineProperty(
  Promise.prototype,
  'should',
  Object.getOwnPropertyDescriptor(Object.prototype, 'should')
);

global.specify = global.it
