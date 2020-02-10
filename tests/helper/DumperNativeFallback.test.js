const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;
const sinon = require('sinon');
const forEach = require('mocha-each');

const Dumper = require('../../src/helper/Dumper');
const Output = require('../../src/output/Output');

xdescribe('#DumperNativeFallback', () =>
{
  forEach(provideVariables()).
  it('testInvoke %s', (variable, primitiveString) =>
  {
    let dumper = new Dumper(sinon.createStubInstance(Output));

    assert.deepEqual(primitiveString, dumper(variable));
  });


  function setUpBeforeClass()
  {
    /**
    ClassExistsMock.register(Dumper.class);
    ClassExistsMock.withMockedClasses({CliDumper.class:false,});
     **/
  }

  function tearDownAfterClass()
  {
    // ClassExistsMock.withMockedClasses([]);
  }

  function provideVariables()
  {
    return [
      [null, 'null'],
      [true, 'true'],
      [false, 'false'],
      [1, '1'],
      [-1 + 5, '-1 + 5'],
      ['string', '"string"'],
      [[1, '2'], "Array\n(\n    [0]: 1\n    [1]: 2\n)"],
      [{}, "stdClass Object\n(\n)"],
  ];
  }

});
