const debug = require('debug')('yup-by-example:init');

const TestDataFactory = require('./TestDataFactory');

// eslint-disable-next-line default-param-last
function yupByExample({ id, generator: generatorName } = {}, params) {
  // eslint-disable-next-line no-shadow
  return this.transform(function yupByExample(suppliedValue, originalValue) {
    if (TestDataFactory.disabled) {
      debug('Bypassing yup-by-example');
      return suppliedValue;
    }
    const { type, meta = {} } = this.describe();
    const generator = generatorName
      ? TestDataFactory.getGenerator([generatorName])
      : TestDataFactory.getGenerator(compact([meta.type, type]));
    const generatedValue = generator.generate({
      id,
      params,
      chance: TestDataFactory.chance,
      now: TestDataFactory.now,
      session: TestDataFactory.session,
      schema: describe(this),
      value: suppliedValue,
      originalValue,
    });
    const data = { value: generatedValue };
    TestDataFactory.notify(compact([id, generatorName, meta.type, type]), data);
    return data.value;
  });
}

// See https://github.com/jquense/yup/issues/883
function describe(schema) {
  const description = schema.describe();
  description.whitelist = schema._whitelist ? Array.from(schema._whitelist.list) : [];
  description.blacklist = schema._blacklist ? Array.from(schema._blacklist.list) : [];
  Object.keys(schema.fields || []).forEach((fieldName) => {
    const transforms = schema.fields[fieldName].transforms
      .filter((t) => Boolean(t.name))
      .map((t) => ({ name: t.name }));
    description.fields[fieldName].transforms = transforms;
  });
  return description;
}

function compact(list) {
  return list.filter(Boolean);
}

module.exports = yupByExample;
