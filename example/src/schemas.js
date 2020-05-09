const { TestDataFactory } = require('../..');
const { mixed, array, object, string, number } = require('yup');

// Prevents yup from erroring when `example()` is called.
new TestDataFactory().addNoopMethod(mixed, 'example');

/*
Yup schemas must be "hidden" behind an init method, so they are not
built before the real `example()` method has been added in the test
code (see api.test.js).
*/

module.exports = function init() {

  const user = object().shape({
    name: string().max(255).required().example(),
    age: number().positive().integer().max(200).required().example(),
    email: string().email().required().example(),
    username: string().min(8).max(32).required().example(),
    password: string().min(12).max(32).required().example(),
    niNumber: string().matches(/^[A-Z]{2}\d{6}[A-Z]$/).required().example('ni-number'),

  }).example();

  const users = array(user).min(3).max(6).example();

  return {
    user,
    users
  }
}
