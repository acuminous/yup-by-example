# yup-by-example
[![NPM version](https://img.shields.io/npm/v/yup-by-example.svg?style=flat-square)](https://www.npmjs.com/package/yup-by-example)
[![NPM downloads](https://img.shields.io/npm/dm/yup-by-example.svg?style=flat-square)](https://www.npmjs.com/package/yup-by-example)
[![Build Status](https://img.shields.io/travis/cressie176/yup-by-example/master.svg)](https://travis-ci.org/cressie176/yup-by-example)
[![Maintainability](https://api.codeclimate.com/v1/badges/c6189e47b3fb4e251882/maintainability)](https://codeclimate.com/github/cressie176/yup-by-example/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/c6189e47b3fb4e251882/test_coverage)](https://codeclimate.com/github/cressie176/yup-by-example/test_coverage)
[![Dependency Status](https://david-dm.org/cressie176/yup-by-example.svg)](https://david-dm.org/cressie176/yup-by-example)
[![devDependencies Status](https://david-dm.org/cressie176/yup-by-example/dev-status.svg)](https://david-dm.org/cressie176/yup-by-example?type=dev)
<br/>
yup-by-example is a random data generator driven from [Yup](https://github.com/jquense/yup) schemas. Yup is a JavaScript schema builder for value parsing and validation, heavily inspired by [Joi](https://github.com/hapijs/joi), but with far less baggage, making it suitable for both server and client side validation.

For those practicing TDD, a rich and potentially shared schema increases the burden of managing test data. One  solution is to create a common, hard coded set of test data, but this is almost certainly a bad idea. Not only does it lead to brittle tests, but also means that the tests come to depend on something that's often hidden away, instead of the salient values being front and centre. Instead, by generating random sets of test data, and explicitly overwriting just the key values, the tests will be more robust and communicate far more clearly. However, maintaining random test data generators is complex and onerous. If only it could be automatically generated from the same schema used for validation. This is where yup-by-example comes in!

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of Contents

- [TL;DR](#tldr)
  - [1. Define the schema, specifying examples](#1-define-the-schema-specifying-examples)
  - [2. Write the tests](#2-write-the-tests)
  - [3. Profit!](#3-profit)
- [The TestDataFactory Class](#the-testdatafactory-class)
  - [Generating test data](#generating-test-data)
  - [Adding the example method to yup](#adding-the-example-method-to-yup)
  - [Add Custom Generators](#add-custom-generators)
  - [Intercept generated values](#intercept-generated-values)
  - [Control the random seed used for test data generation](#control-the-random-seed-used-for-test-data-generation)
  - [Control the value of 'now'](#control-the-value-of-now)
  - [Configure generators on a test-by-test basis](#configure-generators-on-a-test-by-test-basis)
- [Custom Generators](#custom-generators)
- [Function Generators](#function-generators)
- [Chance Generators](#chance-generators)
- [Relative Date Generator](#relative-date-generator)
- [Literal Generators](#literal-generators)
- [Supported types and validations](#supported-types-and-validations)
- [Caveats](#caveats)
- [Troubleshooting](#troubleshooting)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## TL;DR

### 1. Define the schema, specifying examples
```js
// schemas.js
const yupByExample = require('yup-by-example');
const { mixed, array, object, string, number, ...yup } = require('yup');

// This must be done before you build any schema that uses yup-by-example
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

// Adding `example()` works for objects too
const user = object().shape({
  name: name.required(),
  age: age.required(),
  email: email.required(),
  username: username.required(),
  password: password.required(),
  niNumber: niNumber.required(),
}).example();

module.exports = {
  user,
}
```

### 2. Write the tests
```js
// api.test.js
const { TestDataFactory } = require('yup-by-example');
const schemas = require('../src/schemas');

describe('API', () => {

  beforeEach() {
    TestDataFactory.init();
  }

  it('should create user', async () => {
    const user = await TestDataFactory.generateValid(schemas.user);
    const res = await request.post('/api-under-test/users', users);
    expect(res.status).to.equal(200);
  })
})
```

### 3. Profit!
The following data was generated by the code in the example folder, based on the above configuration.
```json
{
  "niNumber": "KH428917X",
  "password": "iIwRaSGjgMjrMi",
  "username": "network_specialist_45",
  "email": "nazfodo@pag.vu",
  "age": 33,
  "name": "Darrell N. Austin"
}
```
You can easily create arrays of users too. See the [example](https://github.com/cressie176/yup-by-example/tree/master/example) for more details.

## The TestDataFactory Class
One of yup-by-examples key classes is the TestDataFactory. You use it to:
* generate test data
* add the example method to yup
* add custom generators
* intercept generated values
* control the random seed used for test data generation
* control the value of 'now'
* configure generators on a test-by-test basis

### Generating test data
To generate test data simply add the `example` method and call `generateValid` or `generate`, passing it a schema.
```js
// schemas.js
const { mixed, object, string, ...yup } = require('yup');
const yupByExample = require('yup-by-example');

yup.addMethod(mixed, 'example', yupByExample);

const user = object()
  .shape({
    name: string().required().example(),
  })
  .example();

module.exports = {
  user,
}
```
```js
// api.test.js
const { TestDataFactory } = require('yup-by-example');
const schemas = require('../src/schemas');

describe('API', () => {

  beforeEach() {
    TestDataFactory.init();
  }

  it('should create user', async () => {
    const user = await TestDataFactory.generateValid(schemas.user);
    const res = await request.post('/api-under-test/users', users);
    expect(res.status).to.equal(200);
  })
})
```
As the method name implies, generateValid, will validate the generated test data against the schema and throw an error if it is invalid. If you need to generate a partial or invalid document, then fix it after the fact, use `generate` instead. You can optionally pass [yup validation options](https://github.com/jquense/yup#mixedvalidatevalue-any-options-object-promiseany-validationerror) as the second parameter, e.g. ```TestDataFactory.generateValid(schema, { context: { a : 1 } });```

### Configuring examples
yup-by-example works by adding a new `example` transformer method to yup. The example transformer inspects the schema and selects the most appropriate generator with the following precidence

1. The generator parameter passed to the `.example({ generator: 'foo' })` function in your schema
1. The metadata `type` property `.meta({ type: 'foo' })`
1. The schema type (e.g. array, boolean, date, object, number or string)

```js
// schemas.js
const { mixed, object, string, date, ...yup } = require('yup');
const yupByExample = require('yup-by-example');

yup.addMethod(mixed, 'example', yupByExample); // Register the 'example' transformer with yup

const user = object()
  .shape({
    name: string().example(), // Use the string transformer
    username: string().meta({ type: 'username' }).example() // Use the username transformer
    dob: date().example({ generator: 'rel-date' }) // Use the relative date transformer
    profile: string().url() // No examples will be generated
  })
  .example(); // <-- Use the example transformer to generate users

module.exports = {
  user,
}
```
When you call `TestDataFactory.generateValid` or `TestDataFactory.generate`, these functions will statically enable the example transformer while test data is being generated, then disable it again afterwards. This means you can still use the schemas in your application code, but that you cannot run tests concurrently.

Finally, if you don't like the term `example()` you can you can change to whatever you like by supplying a methodName when adding the method, but remember to update your schema accordingly.
```js
// schemas.js
const { mixed, object, string, ...yup } = require('yup');
const yupByExample = require('yup-by-example');

yup.addMethod(mixed, 'fake', yupByExample);

const user = object()
  .shape({
    name: string().fake(),
  })
  .fake();

module.exports = {
  user,
}
```

### Add Custom Generators
See the section on [custom generators](#custom-generators)

### Intercept generated values
Whenever a generate returns a value, before yielding it, the TestDataFactory will emit the event from the current session, allowing you to read and even modify the value. The event name will be one of:

* the example id
* the generator name
* the metadata type
* the schema type

This can be especially useful when adjusting values inside array
```js
// schemas.js
const { mixed, object, array, ...yup } = require('yup');
const yupByExample = require('yup-by-example');

yup.addMethod(mixed, 'example', yupByExample);

const user = object()
  .shape({
    dob: date().example({ id: 'dob' generator: 'rel-date' }),
  })
  .meta({ type: 'user' }),
  .example();

const users = array().of(user).example();

module.exports = {
  user,
  users,
}
```

```js
// api.test.js
const { TestDataFactory } = require('yup-by-example');
const schemas = require('../src/schemas');

describe('API', () => {

  beforeEach() {
    TestDataFactory.init();
  }

  it('should create users', async () => {
    let userIndex = 0;

    session.on('user', event => {
      // Increment the user index for each user
      userIndex++;
    })

    session.on('dob', event => {
      // Adjusts the generated dob based on the user index
      event.value = dateFns.add(event.value, {
        days: userIndex,
      })
    })

    const users = await TestDataFactory.generateValid(schemas.users);
    const res = await request.post('/api-under-test/users', users);
    expect(res.status).to.equal(200);
  })
})
```

### Control the random seed used for test data generation
When you create random test data, it can be useful to repeatedly get the same "random" values for debugging purposes. When you instanciate the TestDataFactory you can pass the desired seed into the constructor.
```js
TestDataFactory.init({ seed: 42 })
```
Now repeated runs should generate exactly the same data sets.

### Control the value of 'now'
You can also control the value of `now` used to generate relative dates.
```js
TestDataFactory.init({ now: new Date('2020-01-01T00:00:00.000Z' })
```

### Configure generators on a test-by-test basis
When generating test data, you often don't want it to be completely random. You're likely to overwrite part of the the generated data with values important to your test, and it can be especially if the document has too many or too few array elements. yup-by-example enables you to do this through session properties. When you instantiate the TestDataFactory, it creates a session, which is passed to each generator. By configuing the generator with an id, you can configure from properties stored in the session. The array generator uses this mechanism to let you control the size of the array it should create.
```js
// schemas.js
const { mixed, object, array, ...yup } = require('yup');
const yupByExample = require('yup-by-example');

yup.addMethod(mixed, 'example', yupByExample);

const user = object()
  .shape({
    name: string().example(),
  })
  .example();

const users = array.of(user).example({ id: 'users' });
```
```js
// api.test.js
const { TestDataFactory } = require('yup-by-example');
const schemas = require('../src/schemas');

describe('API', () => {

  beforeEach() {
    TestDataFactory.init();
  }

  it('should create users', async () => {
    TestDataFactory.session.setProperty('users.length', 4);

    // Because the array generator checks for `${id}.length` there will be exactly 4 users
    const users = await TestDataFactory.generateValid(schemas.users);
    const res = await request.post('/api-under-test/users', users);
    expect(res.status).to.equal(200);
  })
})
```
You can reset the session at any point by calling `TestDataFactory.init()`

## Custom Generators
It will not be possible to reliably generate test data purely from base types like `array`, `object`, `string`, `number` and `date`, however by writing a custom generator, selected either explicitly, by passing a `generator` parameter to the `example()` function or through schema metadata, you can fine tune the results. Custom generators must expose a generate function, which the test data factory will pass the following:
```js
{
  id, // the generator id
  params, // the generator parameters
  chance: // an instance of Chance
  now, // The date the factory was initialised
  session, // The session
  schema, // The schema (supplied by yup),
  value, // The value (supplied by yup)
  originalValue, // The original value (supplied by yup
}
```
For example:
```js
// NiNumberGenerator.js
module.exports = {
  generate: ({ chance }) => {
    const start = chance.string({ length: 2 });
    const middle = chance.integer({ min: 100000, max 999999 });
    const end = chance.string({ length: 1 });
    return `${start}${middle}${end}`.toUpperCase();
  }
}
```
```js
// LookupGenerator.js
const refdata = require('./refdata');

module.exports = {
  generate: ({ params, chance }) => {
    const dataset = refdata.get(params.key);
    return chance.pickone(dataset);
  }
}
```
```js
// schemas.js
const { mixed, object, array, ...yup } = require('yup');
const yupByExample = require('yup-by-example');

yup.addMethod(mixed, 'example', yupByExample);

const user = object()
  .shape({
    niNumber: string()
      .matches(/^[A-Z]{2}\d{6}[A-Z]$/)
      .required()
      .example({ generator: 'ni-number' }),
    role: string()
      .required()
      .example({ generator: 'lookup' }, { key: 'roles' }),
  })
  .example();

module.exports = {
  user,
}
```
```js
// api.test.js
const { TestDataFactory } = require('yup-by-example');
const schemas = require('../src/schemas');
const NiNumberGenerator = require('./NiNumberGenerator');
const LookupGenerator = require('./LookupGenerator');

describe('API', () => {

  beforeEach() {
    TestDataFactory
      .init()
      .addGenerator('ni-number', NiNumberGenerator)
      .addGenerator('lookup', LookupGenerator)
  }

  it('should create users', async () => {
    const user = await TestDataFactory.generateValid(schemas.user);
    const res = await request.post('/api-under-test/users', user);
    expect(res.status).to.equal(200);
  })
})
```

You can add generators individually in bulk via the TestDataFactory. You can only remove generators individually.
```js
// api.test.js
before() {
  TestDataFactory.init({
    generators: {
      'ni-number': NiNumberGenerator,
      'lookup': LookupGenerator,
    }
  });

  // or...
  TestDataFatory.addGenerators({
    'ni-number': NiNumberGenerator,
    'lookup': LookupGenerator,
  });

  // or...
  TestDataFactory.addGenerator('ni-number', NiNumberGenerator);
  TestDataFactory.addGenerator('lookup', LookupGenerator);

  // Removal
  TestDataFactory.removeGenerator('unwanted');
}
```
All generators are passed an instance of [Chance](https://chancejs.com/basics/integer.html) to assist with random data generation.

## Function Generators
yup-by-example supports a special function generator which you can use inline rather than having to define and add a class.
```js
const user = object().shape({
  name: string().example({ generator: 'fn' }, ({ id, session, chance }) => chance.name()),
}).example();
```

## Chance Generators
yup-by-example also provides a chance generator, which can be used to invoke any [Chance](https://chancejs.com/person/birthday.html) method.
```js
const user = object()
  .shape({
    name: string().example({ generator: 'chance' }, {
      method: 'name',
      params: {
        middle_initial: true
      },
    }),
  })
  .example();
```

## Relative Date Generator
Sometimes you don't need a random date, just one a few days into the future or in the past. This is where the relative date generator comes in handy.
```js
const user = object().shape({
  today: date().example({ generator: 'rel-date' }),
  tomorrow: date().example({ generator: 'rel-date' }, { days: 1 }),
  yesterday: date().example({ generator: 'rel-date' }, { days: -1 }),
}).example();
```
By default the dates will be reletive to when you initialised the TestDataFactory. You can override this as follows:
```js
const { TestDataFactory } = require('yup-by-example');
TestDataFactory.init({ now: new Date('2000-01-01T00:00:00.000Z') });
```
rel-date uses [date-fns add](https://date-fns.org/v2.13.0/docs/add) behind the scenes, and can be used to adjust the years, months, weeks, days, hours, minutes and seconds.

## Literal Generators
Literal generates allow you to specify literal examples, that will be fixed across test runs.
```js
const user = object().shape({
  name: string().example({ generator: 'literal' }, 'Frank')
}).example();
```

## Supported types and validations
| type    | validations     |
|---------|-----------------|
| array   | min, max, oneOf |
| boolean | oneOf           |
| date    | min, max, oneOf |
| object  | oneOf           |
| number  | min, max, lessThan, moreThan, positive, negative, integer, oneOf |
| string  | length, min, max, email, url, oneOf |

## Caveats
Not all Yup validations can be reliably generated. For example there is nothing in the described schema that can be used to determine if `lowercase` or `uppercase` is required. With `strict` validation, this could cause problems. It's likely there there may also be issues with references and conditional validation. You may be able to work around many of these problems with [custom](#custom-generators), [function](#function-generators), [chance](#chance-generators), [session](#intercept-generated-values) properties and [events](#intercept-generated-values).

## Troubleshooting
```
TypeError: The value of field could not be cast to a value that satisfies the schema type: "object".
```
If you see this error you have probably neglected to add all the necessary `.example()` calls to your schema. Another possibilitiy is that some of your schemas were built using either stub example implementation, or a test data factory instantiated in a previous test.

For other problems try enabling debug
```
DEBUG yup-by-example:* npm t
```
