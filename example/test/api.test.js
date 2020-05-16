const { mixed } = require('yup');
const { TestDataFactory } = require('../..');
const NiNumberGenerator = require('../src/NiNumberGenerator');
const schemas = require('../src/schemas');

TestDataFactory.init({
  generators: {
    'ni-number': new NiNumberGenerator(),
  }
});

TestDataFactory.session.setProperty('users.length', 4);
TestDataFactory.generateValid(schemas.users).then(users => {
  console.log(JSON.stringify(users, null, 2));
}).catch(console.error);


