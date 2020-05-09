# yup-by-example
yup-by-example is a random data generator driven from [Yup](https://github.com/jquense/yup) schemas. Yup is a JavaScript schema builder for value parsing and validation, heavily inspired by [Joi](https://github.com/hapijs/joi), but with far less baggage, making it suitable for both server and client side validation.

For those practicing TDD, a rich and potentially shared schema increases the burden of managing test data. One  solution is to create a common, hard coded set of test data, but this is almost certainly a bad idea. Not only does it lead to brittle tests, but also means that the tests come to depend on something that's often hidden away, instead of the salient values being front and centre. Instead, by generating random sets of test data, and explicitly overwriting just the key values, the tests will be more robust and communicate far more clearly. However, maintaining random test data generators is complex and onerous. If only it could be automatically generated from the same schema used for validation! This is where yup and yup-by-example come in!

One of the best features of Yup, is the ability to add custom validators / transformers, through use of [yup.addMethod](https://github.com/jquense/yup/blob/master/README.md#yupaddmethodschematype-schema-name-string-method--schema-void). A second great feature is the ability to [describe](https://github.com/jquense/yup/blob/master/README.md#mixeddescribe-schemadescription) schemas. yup-by-example makes use of both features, by providing a transformation that interrorgates the schema and automatically generates compatible test data, with some [caveats](#caveats).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
- [yup-by-example](#yup-by-example)

- [TL;DR](#tldr)
  - [1. Define the schema, specifying examples](#1-define-the-schema-specifying-examples)
  - [2. Write the tests](#2-write-the-tests)
  - [3. Profit!](#3-profit)
- [The TestDataFactory Class](#the-testdatafactory-class)
  - [Generating test data](#generating-test-data)
  - [Adding the example method to yup](#adding-the-example-method-to-yup)
  - [Add Custom Generators](#add-custom-generators)
  - [Control the random seed used for test data generation](#control-the-random-seed-used-for-test-data-generation)
  - [Control the value of `now`, used for relative date generation](#control-the-value-of-now-used-for-relative-date-generation)
  - [Configure generators on a test-by-test basis](#configure-generators-on-a-test-by-test-basis)
- [Custom Generators](#custom-generators)
- [Function Generators](#function-generators)
- [Chance Generators](#chance-generators)
- [Relative Date Generator](#relative-date-generator)
- [Supported types and validations](#supported-types-and-validations)
  - [array](#array)
  - [boolean](#boolean)
  - [date](#date)
  - [object](#object)
  - [number](#number)
  - [string](#string)
- [Caveats](#caveats)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## TL;DR

### 1. Define the schema, specifying examples
```js
// schemas.js
const { TestDataFactory } = require('yup-by-example');
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
    .example('chance', {
      method: 'age'
    });

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

  // Adding `example()` works too
  const user = object().shape({
    name: name.required(),
    age: age.required(),
    email: email.required(),
    username: username.required(),
    password: password.required(),
    niNumber: niNumber.required(),
  }).example();

  // You can also create example arrays. By setting the sessionKey
  // we can specify exactly how many users we want to be created 
  // on a test-by-test basis
  const users = array(user)
    .min(3)
    .max(6)
    .meta({ sessionKey: 'users' })
    .example();

  return {
    user,
    users
  }
}
```

### 2. Write the tests
```js
// api.test.js
const { TestDataFactory } = require('yup-by-example');
const initSchemas = require('../src/schemas');

describe('API', () => {

  let testDataFactory;
  let schemas;

  before() {
    // Replace the noop method added in schemas.js
    testDataFactory = new TestDataFactory().addMethod('mixed', 'example');

    // Then initialise the schemas
    schemas = initSchemas();
  }

  it('should create users', async () => {
    testDataFactory.session.setProperty('users.length', 4);
    const users = await testDataFactory.generateValid(schemas.users);
    const res = await request.post('/api-under-test/users', users);
    expect(res.status).to.equal(200);
  })
})
```

### 3. Profit!
The following data was generated by the code in the example folder, based on the above configuration.
```json
[
  {
    "niNumber": "KH428917X",
    "password": "iIwRaSGjgMjrMi",
    "username": "network_specialist_45",
    "email": "nazfodo@pag.vu",
    "age": 33,
    "name": "Darrell N. Austin"
  },
  {
    "niNumber": "SX606837W",
    "password": "VSNKXJdJJDDYQlcIQHSjpEQZKojJ",
    "username": "building_contractor_62",
    "email": "tecpa@pinoba.as",
    "age": 31,
    "name": "Clayton B. Webb"
  },
  {
    "niNumber": "GQ717596H",
    "password": "HDlMbHYmpqbFvuJkRL",
    "username": "gourmet_chef_35",
    "email": "muvfug@sezecku.nf",
    "age": 37,
    "name": "Tommy I. Jefferson"
  },
  {
    "niNumber": "UP853912J",
    "password": "NWdTpZFDTYucraKrvYSIEclmJ",
    "username": "network_operator_86",
    "email": "jocvur@uhce.eh",
    "age": 43,
    "name": "Randy X. Patton"
  }
]
```

## The TestDataFactory Class
One of yup-by-examples key classes is the TestDataFactory. You use it to:
* generate test data
* add the example method to yup
* add [custom generators](#custom-generators)
* control the random seed used for test data generation
* control the value of `now`, used for relative date generation
* configure generators on a test-by-test basis

### Generating test data
To generate test data simply instantiate a testDataFactory, add the `example` method and call `generateValid` or `generate`, passing it a schema.
```js
const testDataFactory = new TestDataFactory().addMethod(mixed, 'example')
const document = await testDataFactory.generateValid(schema);
```
As the method name implies, generateValid, will validate the generated test data against the schema and throw an error if it is invalid. If you need to generate a partial or invalid document, then fix it after the fact, use `await testDataFactory.generate(schema)` instead.

### Adding the example method to yup
yup-by-example works by adding a new `example` transformer to yup. e.g.
```js
beforeEach(() => {
  testDataFactory = new TestDataFactory().addMethod(mixed, 'example');
})
```
The example transformer inspects the schema and selects the most appropriate test data generator based on

1. The generated id passed to the `example` function in your schema
1. The metadata `type` property (also specified in the schema)
1. The schema type (e.g. array, boolean, date, object, number or string)

You control whether examples are  through the schema, e.g.
```
string().min(10).max(20).example(); // Supports examples
string().min(10).max(20);           // Will be ignored
```
When you call `testDataFactory.generateValid` or `testDataFactory.generate` these functions enable the example transformer while test data is being generated, then disable it again afterwards. This means you can safely generate test data, then invoke the code that will validate the test data, without generating more examples, however we suspect this is only true while running tests sequencially. If you run tests concurrently, all bets are off.

When running in production you will still need an `example` method, otherwise Yup wont be able to build the schema. While it **should** be safe to use the same one as the test code (assuming nothing calls the testDataFactory `generateValid` or `generate` functions, however prefer using the dedicated noop method.
```js
new TestDataFactory().addNoopMethod(mixed, 'example');
```

Finally, if you don't like the term `example()` you can you can change to whatever you like, but remember to update your schema accordingly.

### Add Custom Generators
See the section on [custom generators](#custom-generates)

### Control the random seed used for test data generation
When you create random test data, it can be useful to repeatedly get the same "random" values for debugging purposes. When you instanciate the TestDataFactory you can pass the desired seed into the constructor.
```js
new TestDataFactory({ seed })
```
Now repeated runs should generate exactly the same data sets.

### Control the value of `now`, used for relative date generation
You can also control the value of `now` used to generate relative dates, once again, in order to aid debugging.
```js
new TestDataFactory({ now: new Date('2020-01-01T00:00:00.000' })
```

### Configure generators on a test-by-test basis
When generating test data, you often don't want it to be completely random. You're likely to overwrite part of the the generated data with values important to your test, and it can be especially if the document has too many or too few array elements. yup-by-example enables you to do this through session properties. When you instanciate (or reset) the TestDataFactory, it creates a session, which is passed to each generator. By configuing the generator with a sessionKey, so that it knows where to look, you can configure it the fly. The array generator uses this mechanism to let you control the size of the array it should create.
```js
// some.test.js
const testDataFactory = new TestDataFactory().addMethod(mixed, 'example');
testDataFactory.session.setProperty('users.length', 4);

// schemas.js
const users = array.of(user).meta({ sessionKey: 'users' }).example();
```
You can reset the session at any point by calling `testDataFactory.reset()`

## Custom Generators
It will not be possible to reliably generate test data purely from base types like `array`, `object`, `string`, `number` and `date`, however by writing a custom generator, selected either explicitly, by passing an `id` parameter to the `example()` function or through schema metadata, you can fine tune the results. e.g.

```js
// Updated user schema in schemas.js
const user = object().shape({
  title: string().meta({ type: 'title' }).example(),
  name: string().meta({ name: 'name' }).example(),
  niNumber: string().matches(/^[A-Z]{2}\d{6}[A-Z]$/).required().example('ni-number'),
}).example();
```

Custom generators are classes that should extend the BaseGenerator, and expose a `generate` function.
```js
// NiNumberGenerator.js
const { BaseGenerator } = require('yup-by-example');

class NiNumberGenerator extends BaseGenerator {

  generate({ id, params, schema, value, originalValue }) {
    const start = this.chance.string({ length: 2 });
    const middle = this.chance.integer({ min: 100000, max 999999 });
    const end = this.chance.string({ length: 1 });
    return `${start}${middle}${end}`.toUpperCase();
  }
}
```

You can add, remove and overwrite generators through the TestDataFactory instance
```js
// Updated code in api.test.js
before() {
  factory = new TestDataFactory()
    .addMethod('mixed', 'example')
    .removeGenerator('name'),
    .addGenerator('ni-number', NiNumberGenerator);
  schemas = initSchemas();
}
```
All generators are passed an instance of [Chance](https://chancejs.com/basics/integer.html) to assist with random data generation. You can also initialise the TestDataFactory with a seed, e.g. `new TestDataFactory({ seed: 100 })` to consistently generate the same random data.

## Function Generators
yup-by-example supports a special function generator which you can use inline rather than having to define and add a class.
```js
// Updated user schema in schemas.js
const user = object().shape({
  name: string().example('fn', chance => chance.name()),
}).example();
```

## Chance Generators
yup-by-example also provides a chance generator, which can be used to invoke any [Chance](https://chancejs.com/person/birthday.html) method.
```js
// Updated user schema in schemas.js
const user = object().shape({
  name: string().example('chance', {
    method: 'name',
    params: {
      middle_initial: true
    },
  }),
}).example();
```

## Relative Date Generator
Sometimes you don't need a random date, just one a few days into the future or in the past. This is where the relative date generator comes in handy.
```js
// Updated user schema in schemas.js
const user = object().shape({
  tomorrow: date().example('rel-date', { days: 1 }),
  yesterday: date().example('rel-date', { days: -1 }),
}).example();
```
By default the dates will be reletive to when you instanciated the test data factory. You can override this as follows:
```js
const { TestDataFactory } = require('yup-by-example');
const testDataFactory = new TestDataFactory({ now: new Date('2000-01-01T00:00:00.000') });
```
rel-date uses [date-fns add](https://date-fns.org/v2.13.0/docs/add) behind the scenes, and can be used to adjust the years, months, weeks, days, hours, minutes and seconds.

## Supported types and validations
### array
* min
* max
* oneOf

### boolean
* oneOf

### date
* min
* max
* oneOf

### object
* oneOf

### number
* min
* max
* lessThan
* moreThan
* positive
* negative
* integer
* oneOf

### string
* length
* min
* max
* email
* url
* oneOf

## Caveats
Not all Yup validations can be reliably generated. For example there is nothing in the described schema that can be used to determine if `lowercase` or `uppercase` is required. With `strict` validation, this could cause problems. It's likely there there may also be issues with references and conditional validation. You may be able to work around many of these problems with [Custom generators](#custom-generators), [Function generators](#function-generators) or [Chance generators](#chance-generators).

