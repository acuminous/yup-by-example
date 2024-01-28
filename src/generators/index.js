const ArrayGenerator = require('./ArrayGenerator');
const BooleanGenerator = require('./BooleanGenerator');
const ChanceGenerator = require('./ChanceGenerator');
const DateGenerator = require('./DateGenerator');
const FunctionGenerator = require('./FunctionGenerator');
const LiteralGenerator = require('./LiteralGenerator');
const ObjectGenerator = require('./ObjectGenerator');
const RelativeDateGenerator = require('./RelativeDateGenerator');
const StringGenerator = require('./StringGenerator');
const NumberGenerator = require('./NumberGenerator');

module.exports = {
  array: new ArrayGenerator(),
  boolean: new BooleanGenerator(),
  chance: new ChanceGenerator(),
  date: new DateGenerator(),
  fn: new FunctionGenerator(),
  function: new FunctionGenerator(),
  literal: new LiteralGenerator(),
  object: new ObjectGenerator(),
  number: new NumberGenerator(),
  'rel-date': new RelativeDateGenerator(),
  string: new StringGenerator(),
};
