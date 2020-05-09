const { mixed } = require('yup');
const { TestDataFactory } = require('../../src');
const NiNumberGenerator = require('../src/NiNumberGenerator');
const initSchemas = require('../src/schemas');

/*
The yup schemas must be initialised after `addMethod` has been called,
otherwise they will be built using the `noop` example implmentation
(see schemas.js)
*/
const testDataFactory = new TestDataFactory()
  .addMethod(mixed, 'example')
  .addGenerator('ni-number', NiNumberGenerator);
const schemas = initSchemas();

testDataFactory.session.setProperty('users.length', 4);
testDataFactory.generateValid(schemas.users).then(users => {
  console.log(JSON.stringify(users, null, 2));
}).catch(console.error);


