const TestDataFactory = require('./TestDataFactory');
const TestDataSession = require('./TestDataSession');
const BaseGenerator = require('./generators/BaseGenerator');
const yupByExample = require('./yup-by-example');

yupByExample.TestDataFactory = TestDataFactory;
yupByExample.TestDataSession = TestDataSession;
yupByExample.BaseGenerator = BaseGenerator;

module.exports = yupByExample;
