import { sample }from './helpers';
import { Stats } from 'fast-stats';
import { mixed, string, number, object } from 'yup';
import TestDataFactory from '../src/TestDataFactory';

describe('object generator', () => {

  const testDataFactory = new TestDataFactory().addMethod(mixed, 'example');

  it('should generate random objects', function() {
    const schema = object().shape({
      name: string().example(),
      age: number().positive().integer().max(100).example(),
    }).example();

    for (let i = 0; i < 1000; i++) {
      const value = testDataFactory.generate(schema);
      expect(value).to.have.keys('name', 'age');
      expect(value.name).to.be.a('string');
      expect(value.age).to.be.a('number');
      expect(value.age).to.be.above(0);
      expect(value.age).to.be.below(101);
    }
  })

  it('should obey specified one of values', function() {
    const schema = object().oneOf([{ x: 1 }, { x: 2 }, { x: 3 }]).example();
    const { counts, values } = sample(999, () => testDataFactory.generate(schema), v => v.x);

    const stats = new Stats().push(counts);
    const [lower, upper] = stats.range();

    expect(lower).to.be.below(333);
    expect(upper).to.be.above(333);
    values.forEach(value => {
      expect(Number(value)).to.be.oneOf([1, 2, 3]);
    });
  })
});
