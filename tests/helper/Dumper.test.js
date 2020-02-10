const mocha = require('mocha');
const chai = require('chai');
const sinon = require('sinon');

const {assert} = chai;


const Dumper = require('../../src/helper/Dumper');
const Output = require('../../src/output/Output');
const forEach = require('mocha-each');
xdescribe('#Dumper', () =>
{
  /**
   * @dataProvider provideVariables
   */
  forEach(provideVariables()).
  it('testInvoke %s', (variable) =>
  {
    let output = sinon.createStubInstance(Output);
    output.isDecorated.returns(true);

    let dumper = new Dumper(output);

    assertDumpMatchesFormat(dumper(variable), variable);
  });


  function setUpBeforeClass()
  {
    putenv('DUMP_LIGHT_ARRAY=1');
    putenv('DUMP_COMMA_SEPARATOR=1');
  }

  function tearDownAfterClass()
  {
    putenv('DUMP_LIGHT_ARRAY');
    putenv('DUMP_COMMA_SEPARATOR');
  }

  function provideVariables()
  {
    return [
      [null],
      [true],
      [false],
      [1],
      [-1 + 5],
      ['string'],
      [[1, '2']],
      [{}],
    ];
  }


  function setUpVarDumper()
  {
    this.varDumperConfig['casters'] = casters;
    this.varDumperConfig['flags'] = flags;
  }

  function tearDownVarDumper()
  {
    this.varDumperConfig['casters'] = [];
    this.varDumperConfig['flags'] = null;
  }

  function assertDumpEquals()
  {
    assert.deepEqual(prepareExpectation(expected, filter), getDump(data, null, filter), message);
  }

  function assertDumpMatchesFormat()
  {
    assert.isStringMatchesFormat(prepareExpectation(expected, filter), getDump(data, null, filter), message);
  }

  function getDump()
  {
    let flags = this.varDumperConfig['flags'];
    if (null === flags)
    {
      flags = getenv('DUMP_LIGHT_ARRAY') ? CliDumper.DUMP_LIGHT_ARRAY : 0;
      flags |= getenv('DUMP_STRING_LENGTH') ? CliDumper.DUMP_STRING_LENGTH : 0;
      flags |= getenv('DUMP_COMMA_SEPARATOR') ? CliDumper.DUMP_COMMA_SEPARATOR : 0;
    }

    let cloner = new VarCloner();
    cloner.addCasters(this.varDumperConfig['casters']);
    cloner.setMaxItems(-1);
    let dumper = new CliDumper(null, null, flags);
    dumper.setColors(false);
    let data = cloner.cloneVar(data, filter).withRefHandles(false);
    data = data.seek(key);
    if (null !== key && null === data)
    {
      return null;
    }

    return rtrim(dumper.dump(data, true));
  }

  function prepareExpectation()
  {
    if (!is_string(expected))
    {
      let expected = getDump(expected, null, filter);
    }

    return rtrim(expected);
  }

});
