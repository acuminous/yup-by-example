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
});
