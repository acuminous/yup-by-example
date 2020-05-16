const TestDataFactory = require('./TestDataFactory');
const BaseGenerator = require('./generators/BaseGenerator');
const yupByExample = require('./yup-by-example');

yupByExample.TestDataFactory = TestDataFactory;
yupByExample.BaseGenerator = BaseGenerator;

module.exports = yupByExample;
