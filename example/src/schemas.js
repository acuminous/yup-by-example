const { TestDataFactory } = require('../..');
const { mixed, array, object, string, number } = require('yup');

// Prevents yup from erroring when `example()` is called.
new TestDataFactory().addNoopMethod(mixed, 'example');

// Yup schemas must be placed behind an init method, so they are not
// built on import - before the real `example()` method has been added
// in the test code (see api.test.js).
module.exports = function init() {

  // Delegates to https://chancejs.com
  const name = string()
    .max(255)
    .example('chance', {
      method: 'name',
      params: {
        middle_initial: true,
      }
    });

  const age = number()
    .positive()
    .integer()
    .max(200)
    .example('chance', { method: 'age' });

  // Since `email` is a Yup validation, yup-by-example can support it natively
  const email = string()
    .email()
    .example();

  // You can also use inline functions to generate example data
  const username = string()
    .min(8)
    .max(32)
    .example('fn', (chance) => {
      return [].concat(
        chance.profession().split(/\W/g),
        chance.integer({ min: 1, max: 99 })
      ).join('_').toLowerCase();
    });

  const password = string()
    .min(12)
    .max(32)
    .example();

  // ni-number uses a custom generator. These can greatly simplify your schema.
  const niNumber = string()
    .matches(/^[A-Z]{2}\d{6}[A-Z]$/)
    .example('ni-number');

  // Without an `example()` postcode will not be randomly generated. If this is
  // also a required field, the resulting test data will be invalid
  const postcode = string()

  // Adding `example()` works too
  const user = object().shape({
    name: name.required(),
    age: age.required(),
    email: email.required(),
    username: username.required(),
    password: password.required(),
    niNumber: niNumber.required(),
    postcode: postcode,
  }).example();

  // You can also create example arrays. By default yup-by-example will obey
  // the max and min values, however you can also control this on a test by
  // test basis by defining a sessionKey in the schemas metadata, then setting
  // the length from your test, e.g. testDataFactory.session.setProperty('users.length', 4)
  const users = array(user)
    .min(3)
    .max(6)
    .meta({ sessionKey: 'users' })
    .example('array');

  return {
    user,
    users
  }
}
