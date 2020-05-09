import ArrayGenerator from './ArrayGenerator';
import BooleanGenerator from './BooleanGenerator';
import ChanceGenerator from './ChanceGenerator';
import DateGenerator from './DateGenerator';
import FunctionGenerator from './FunctionGenerator';
import ObjectGenerator from './ObjectGenerator';
import RelativeDateGenerator from './RelativeDateGenerator';
import StringGenerator from './StringGenerator';
import NumberGenerator from './NumberGenerator';

export default {
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
