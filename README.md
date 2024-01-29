# Yup By Example
[![NPM version](https://img.shields.io/npm/v/yup-by-example.svg?style=flat-square)](https://www.npmjs.com/package/yup-by-example)
[![NPM downloads](https://img.shields.io/npm/dm/yup-by-example.svg?style=flat-square)](https://www.npmjs.com/package/yup-by-example)
[![Node.js CI](https://github.com/acuminous/yup-by-example/workflows/Node.js%20CI/badge.svg)](https://github.com/acuminous/yup-by-example/actions?query=workflow%3A%22Node.js+CI%22)
[![Maintainability](https://api.codeclimate.com/v1/badges/53908de7a9ffa97443e3/maintainability)](https://codeclimate.com/github/acuminous/yup-by-example/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/53908de7a9ffa97443e3/test_coverage)](https://codeclimate.com/github/acuminous/yup-by-example/test_coverage)

Yup By Example is a random data generator driven from [Yup](https://github.com/jquense/yup) schemas. For those practicing TDD, a rich and potentially shared schema increases the burden of managing test data. One  solution is to create a common, hard coded set of test data, but this is almost certainly a bad idea. Not only does it lead to brittle tests, but also means that the tests come to depend on something that's often hidden away, instead of the salient values being front and centre.

Instead, by generating random sets of test data, and explicitly overwriting just the key values, the tests will be more robust and communicate far more clearly. However, maintaining random test data generators is complex and onerous. If only it could be automatically generated from the same schema used for validation. This is where Yup By Example comes in.

## Table Of Contents
- [TL;DR](#tldr)
- [Breaking Changes](#breaking-changes)
- [Installation](#installation)
- [Generators](#generators)
  - [Default Generator](#default-generator)
  - [Function Generator (fn)](#function-generator-fn)
  - [Chance Generator (chance)](#chance-generator-chance)
  - [Relative Date Generator (rel-date)](#relative-date-generator-rel-date)
  - [Literal Generator (literal)](#literal-generator-literal)
  - [Custom Generator](#custom-generator)
- [Generating Test Data](#generating-test-data)
- [Advanced Usage](#advanced-usage)
  - [Test Sessions](#test-sessions)
  - [Intercepting Generated Values](#intercepting-generated-values)
  - [Random Seed Value](#random-seed-value)
- [Caveats](#caveats)
- [Troubleshooting](#troubleshooting)


## TL;DR

### 1. Define the schema
```js
const yupByExample = require('yup-by-example');
const { Schema, object, string, number, date, ...yup } = require('yup');

// This must be done before you build any schema that uses yup-by-example
yup.addMethod(Schema, 'example', yupByExample);

// Add .example() everywhere you want an example
const userSchema = object({
  name: string().required().example(),
  age: number().positive().integer().max(120)required().example(),
  email: string().email()required().example(),
  website: string().url().nullable().example(),
  createdOn: date().default(() => new Date()).example(),
}).example();

module.exports = { userSchema }
```

### 2. Generate test data
```js
const { TestDataFactory } = require('yup-by-example');
const schema = require('../src/userSchema');

describe('User', () => {

  beforeEach() {
    TestDataFactory.init();
  }

  it('should create a valid user', async () => {
    const user = await TestDataFactory.generateValid(schema);
    console.log(user);
    //...
  })
})
```

### 3. Profit!
```json
{
  "name": "GpxiKtlnEDBXpSX",
  "age": 75,
  "email": "vor@bigedac.cl",
  "website": "http://uloero.lr/et",
  "createdOn": "2848-04-15T06:10:26.256Z"
}
```

You can use the included and custom test data generators for even more realitic test data. You can even create arrays of test data too.

See the [example](https://github.com/acuminous/yup-by-example/tree/master/example) for more details.

## Breaking changes

### v4.0.0
As of yup v1.0.0 adding yupByExample to `yup.mixed` no longer works. Instead use
```js
yup.addMethod(Schema, 'example', yupByExample);
```

## Installation
```bash
npm i yup-by-example --save-dev
```

## Generators

### Default Generator
By default, Yup By Example will use the [metadata](https://github.com/jquense/yup?tab=readme-ov-file#schemametametadata-schemametadata-schema) `type` property or schema type to automatically generate valid test data for the following rules

| type    | rules                                                            |
| ------- | ---------------------------------------------------------------- |
| string  | length, min, max, email, url, oneOf                              |
| number  | min, max, lessThan, morethan, positive, negative, integer, oneOf |
| boolean | oneOf                                                            |
| date    | min, max, oneOf                                                  |
| array   | of, length, min, max, oneOf                                      |
| object  | shape, oneOf                                                     |

However for more nuanced validation and to make your data more realistic you can use one of Yup By Example's in built generators or even write your own cusotm generator (see below).

### Function Generator (fn)

A generator which uses an inline function to return test data. The function must be supplied as the second argument, e.g.

```js
string().example({ generator: 'fn' }, () => {
  const randomOctet = () => Math.floor(Math.random() * 256);
  const ipAddress = Array.from({ length: 4 }, randomOctet).join('.');
  return ipAddress;
})
```

The inline function will passed an object with the following parameters

| name    | notes                                         |
| ------- | --------------------------------------------- |
| id      | Used to namespace session properties          |
| session | The test data [session](#sesson)              |
| chance  | An instance of [Chance](https://chancejs.com) |


### Chance Generator (chance)

A generator which delegates to the [Chance](https://chancejs.com) library. e.g.

```js
string().example({ generator: 'chance' }, {
  method: 'name',
  params: {
    middle_initial: true
  },
});
```

### Relative Date Generator (rel-date)

Sometimes you don't need a random date, but an offset one.

```js
date().example({ generator: 'rel-date' }, { days: 1 }),
```

By default, the generated dates will be reletive to when you initialised the TestDataFactory. You can override this as follows...

```js
const { TestDataFactory } = require('yup-by-example');
TestDataFactory.init({ now: new Date('2000-01-01T00:00:00.000Z') });
```

rel-date uses [date-fns add](https://date-fns.org/v2.13.0/docs/add) behind the scenes, and can be used to adjust the years, months, weeks, days, hours, minutes and seconds.


### Literal Generator (literal)
The Literal generator lets you specify literal examples.

```js
string().example({ generator: 'literal' }, 'Frank');
```

## Custom Generator
For even greater flexibility, you can write a custom generator. This is a object exposing a `generate` function, which will be passed an object with the following parameters

| name          | notes                                                   |
| ------------- | ------------------------------------------------------- |
| id            | the generator id (used to namespace session properties) |
| params        | the generator parameters                                |
| session       | The test data [session](#sesson)                        |
| chance        | An instance of [Chance](https://chancejs.com)           |
| now           | The timestamp when the TestDataFactory was initialised  |
| schema        | The schema as supplied by yup                           |
| value         | The value as supplied by yup                            |
| originalValue | The originalValue as supplied by yup                    |

The generator must also be registered with the `TestDataFactory`. e.g.

```js
const NiNumberGenerator = {
  generate: ({ chance }) => {
    const start = chance.string({ length: 2 });
    const middle = chance.integer({ min: 100000, max 999999 });
    const end = chance.string({ length: 1 });
    return `${start}${middle}${end}`.toUpperCase();
  }
}
```

```js
TestDataFactory.init().addGenerator('ni-number', NiNumberGenerator);
```

```js
string().example({ generator: 'ni-number' });
```

## Generating Test Data

After defining the schema, there are two ways of generating test data.

1. TestDataFactory.generateValid(schema: Schema, options?: Options): Promise<any>
2. TestDataFactory.generate(schema: Schema, options?: Options): Promise<any>

Use the former when you want to generate valid test data and the latter when you need to generate a partial or invalid document.

You can optionally pass [yup validation options](https://github.com/jquense/yup?tab=readme-ov-file#schemavalidatevalue-any-options-object-promiseinfertypeschema-validationerror) as the second parameter.

## Advanced Usage

### Test Sessions
When generating test data, you often don't want it to be completely random, instead it is often dependent on data previously generated in your test. You can communicate this information across examples by storing state in the session passed to the generator. The session exposes the following methods

- hasProperty(path: string): boolean
- getProperty(path: string, defaultValue?: any): any
- setProperty(path: string, value: any): any
- incrementProperty(path: string): number
- consumeProperty(path: string, defaultValue?: any): any
- removeProperty(path)
- close()

You also can pre-initialise the session with values that your test generators will refer to, e.g.

```js
const user = object().shape({
  name: string().example(),
}).example();

// Here we have given the generator an id of 'users'
const users = array.of(user).example({ id: 'users' });
```

```js
const { TestDataFactory } = require('yup-by-example');
const userSchema = require('../src/userSchema');

describe('User', () => {

  beforeEach() {
    TestDataFactory.init();
  }

  it('should create users', async () => {
    // Here we stash a property in the session
    TestDataFactory.session.setProperty('users.length', 4);

    // Because the array generator checks for `${id}.length` it will generate exactly 4 users
    const users = await TestDataFactory.generateValid(schemas.users);

    // ...
  })
})
```
You can reset the session at any point by calling `TestDataFactory.init()`, however the session is shared, and so may prevent concurrent tests.

### Intercepting Generated Values
Whenever a generate returns a value, before yielding it, the TestDataFactory will emit the event from the current session, allowing you to read and even modify the value. The event name will be one of:

- the example id
- the generator name
- the metadata type
- the schema type

This can be especially useful when adjusting values inside arrays
```js
const { Schema, object, array, ...yup } = require('yup');
const yupByExample = require('yup-by-example');

yup.addMethod(Schema, 'example', yupByExample);

const user = object().meta({ type: 'user' }).shape({
  dob: date().example({ id: 'dob' generator: 'rel-date' }),
}).example();

const users = array().of(user).example();
```

```js
const { TestDataFactory } = require('yup-by-example');
const schemas = require('../src/schemas');

describe('User', () => {

  beforeEach() {
    TestDataFactory.init();
  }

  it('should create users', async () => {
    let userIndex = 0;

    TestDataFactory.session.on('user', event => {
      userIndex++;
    })

    // Adjusts the generated dob based on the user index
    TestDataFactory.session.on('dob', event => {
      event.value = dateFns.add(event.value, { days: userIndex })
    })

    const users = await TestDataFactory.generateValid(schemas.users);
    // ...
  })
})
```

### Random Seed Value
When you create random test data, it can be useful to repeatedly get the same "random" values for debugging purposes. When you instanciate the TestDataFactory you can pass the desired seed into the constructor.

```js
TestDataFactory.init({ seed: 42 })
```

Now repeated runs should generate exactly the same data sets.

## Caveats
- Not all Yup validations can be reliably generated. For example there is nothing in the described schema that can be used to determine if `lowercase` or `uppercase` is required. With `strict` validation, this could cause problems. It's likely there there may also be issues with references and conditional validation.

- Lazy schemas are not supported

## Troubleshooting
```
TypeError: The value of field could not be cast to a value that satisfies the schema type: "object".
```
If you see this error you have probably neglected to add all the necessary `.example()` calls to your schema. Another possibilitiy is that some of your schemas were built using either stub example implementation, or a test data factory instantiated in a previous test.

```
TypeError: string(...).example is not a function
TypeError: number(...).example is not a function
TypeError: object(...).example is not a function
etc...
```
You forgot to call `yup.addMethod(Schema, 'example', yupByExample)`

For other problems try enabling debug
```
DEBUG yup-by-example:* npm t
```
