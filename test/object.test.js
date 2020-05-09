const { sample } = require('./helpers');
const { Stats } = require('fast-stats');
const { mixed, string, number, object } = require('yup');
const TestDataFactory = require('../src/TestDataFactory');

describe('object generator', () => {

  let testDataFactory;

  beforeEach(() => {
    testDataFactory = new TestDataFactory().addMethod(mixed, 'example');
  });

  it('should generate random objects', async () => {
    const schema = object().shape({
      name: string().example(),
      age: number().positive().integer().max(100).example(),
    }).example();

    for (let i = 0; i < 1000; i++) {
      const value = await testDataFactory.generateValid(schema);
      expect(value).to.have.keys('name', 'age');
      expect(value.name).to.be.a('string');
      expect(value.age).to.be.a('number');
      expect(value.age).to.be.above(0);
      expect(value.age).to.be.below(101);
    }
  })

  it('should skip fields with no example', async () => {
    const schema = object().shape({
      name: string().strip(),
      age: number().example(),
    }).example();

    const value = await testDataFactory.generateValid(schema);
    expect(value).to.not.have.keys('name');
    expect(value).to.have.keys('age');
  })

  it('should obey specified one of values', async () => {
    const schema = object().oneOf([{ x: 1 }, { x: 2 }, { x: 3 }]).example();
    const { counts, values } = await sample(999, () => testDataFactory.generateValid(schema), v => v.x);

    const stats = new Stats().push(counts);
    const [lower, upper] = stats.range();

    expect(lower).to.be.below(333);
    expect(upper).to.be.above(333);
    values.forEach(value => {
      expect(Number(value)).to.be.oneOf([1, 2, 3]);
    });
  })
});
