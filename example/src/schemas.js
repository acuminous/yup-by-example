const yupByExample = require('../..');
const { mixed, array, object, string, number, ...yup } = require('yup');

yup.addMethod(mixed, 'example', yupByExample);

// Delegates to https://chancejs.com
const name = string()
  .max(255)
  .example({ generator: 'chance' }, {
    method: 'name',
    params: {
      middle_initial: true,
    }
  });

const age = number()
  .positive()
  .integer()
  .max(200)
  .example({ generator: 'chance' }, {
    method: 'age',
   });

// Since `email` is a Yup validation, yup-by-example can support it natively
const email = string()
  .email()
  .example();

// You can also use inline functions to generate example data
const username = string()
  .min(8)
  .max(32)
  .example({ generator: 'fn' }, ({ chance }) => {
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
  .example({ generator: 'ni-number' });

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
// test basis by defining a generator id, then setting
// the length from your test, e.g. TestDataFactory.session.setProperty('users.length', 4)
const users = array(user)
  .min(3)
  .max(6)
  .example({
    id: 'users',
    generator: 'array',
  });

module.exports = {
  user,
  users
}
