const { mixed } = require('yup');
const { TestDataFactory } = require('../../lib');
const NiNumberGenerator = require('../src/NiNumberGenerator');
const initSchemas = require('../src/schemas');

/*
The yup schemas must be initialised after `addMethod` has been called,
otherwise they will be built using the `noop` example implmentation
(see schemas.js)
*/
const factory = new TestDataFactory()
  .addMethod(mixed, 'example')
  .addGenerator('ni-number', NiNumberGenerator);
const schemas = initSchemas();

factory.generateValid(schemas.users).then(users => {
  console.log(JSON.stringify(users, null, 2));
}).catch(console.error);


