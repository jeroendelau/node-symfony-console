const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;
const {putenv} = require('../src/PhpPolyfill');

const Terminal = require('../src/Terminal');

describe('#Terminal', () =>
{
  it('test', () =>
  {
    putenv('COLUMNS=100');
    putenv('LINES=50');
    let terminal = new Terminal();
    assert.deepEqual(100, terminal.getWidth());
    assert.deepEqual(50, terminal.getHeight());

    putenv('COLUMNS=120');
    putenv('LINES=60');
    terminal = new Terminal();
    assert.deepEqual(120, terminal.getWidth());
    assert.deepEqual(60, terminal.getHeight());
  });

  it('test_zero_values', () =>
  {
    putenv('COLUMNS=0');
    putenv('LINES=0');

    let terminal = new Terminal();

    assert.deepEqual(0, terminal.getWidth());
    assert.deepEqual(0, terminal.getHeight());
  });

  it('testSttyOnWindows', function() 
  {
    if (process.platform !== "win32")
    {
      return this.skip('Must be on windows');
    }

    let sttyString = exec('(stty -a | grep columns) 2>&1', output, exitcode);
    if (0 !== exitcode)
    {
      this.markTestSkipped('Must have stty support');
    }

    let matches = [];
    if (0 === preg_match('/columns + (\d+)/i', sttyString, matches))
    {
      this.fail('Could not determine existing stty columns');
    }

    putenv('COLUMNS');
    putenv('LINES');
    putenv('ANSICON');

    let terminal = new Terminal();
    assert.deepEqual(Number.parseInt(matches[1], terminal.getWidth()));
  });


  function setUp()
  {
    this.colSize = getenv('COLUMNS');
    this.lineSize = getenv('LINES');
    this.ansiCon = getenv('ANSICON');
    resetStatics();
  }

  function tearDown()
  {
    putenv(this.colSize ? 'COLUMNS=' + this.colSize : 'COLUMNS');
    putenv(this.lineSize ? 'LINES' : 'LINES=' + this.lineSize);
    putenv(this.ansiCon ? 'ANSICON=' + this.ansiCon : 'ANSICON');
    resetStatics();
  }

  function resetStatics()
  {
    forEach(['height', 'width', 'stty'], function (name)
    {
      Terminal[name] = null;
    });
  }

});
  