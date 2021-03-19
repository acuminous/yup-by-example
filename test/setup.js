const yup = require('yup');
const yupByExample = require('../src');

global.chai = require('chai')
global.chai.use(require('dirty-chai'))
global.chai.use(require('chai-as-promised'))

global.expect = global.chai.expect;
global.chai.should();

Object.defineProperty(
  Promise.prototype,
  'should',
  Object.getOwnPropertyDescriptor(Object.prototype, 'should')
);

yup.addMethod(yup.mixed, 'example', yupByExample);
