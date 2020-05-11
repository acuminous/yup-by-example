const { sample, expectAllIntegers, expectAllStrings } = require('./helpers');
const { mixed, number, string } = require('yup');
const TestDataFactory = require('../src/TestDataFactory');

describe('chance generator', () => {

  let testDataFactory;

  beforeEach(() => {
    testDataFactory = TestDataFactory.init();
  });

  it('should generate values using chance with params', async () => {
    const schema = number().example({ generator: 'chance' }, {
      method: 'integer',
      params: { min: 1, max: 10 }
    })
    const { counts, values } = await sample(1000, () => testDataFactory.generateValid(schema));

    expect(counts.length).to.be.equal(10);
    expectAllIntegers(values);
  })

  it('should generate values using chance without params', async () => {
    const schema = string().example({ generator: 'chance' }, { method: 'name', });
    const { counts, values } = await sample(1000, () => testDataFactory.generateValid(schema));

    expect(counts.length).to.be.above(900);
    expectAllStrings(values);
  })

  it('should report missing chance generators', async () => {
    const schema = string().example({ generator: 'chance' }, { method: 'missing', });
    await expect(testDataFactory.generateValid(schema))
      .to.be.rejectedWith('The installed version of Chance does not have the \'missing\' generator');
  })
});
