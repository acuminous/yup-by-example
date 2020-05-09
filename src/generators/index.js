const ArrayGenerator = require('./ArrayGenerator');
const BooleanGenerator = require('./BooleanGenerator');
const ChanceGenerator = require('./ChanceGenerator');
const DateGenerator = require('./DateGenerator');
const FunctionGenerator = require('./FunctionGenerator');
const ObjectGenerator = require('./ObjectGenerator');
const RelativeDateGenerator = require('./RelativeDateGenerator');
const StringGenerator = require('./StringGenerator');
const NumberGenerator = require('./NumberGenerator');

module.exports = {
  array: ArrayGenerator,
  boolean: BooleanGenerator,
  chance: ChanceGenerator,
  date: DateGenerator,
  fn: FunctionGenerator,
  function: FunctionGenerator,
  object: ObjectGenerator,
  number: NumberGenerator,
  'rel-date': RelativeDateGenerator,
  string: StringGenerator,
}
