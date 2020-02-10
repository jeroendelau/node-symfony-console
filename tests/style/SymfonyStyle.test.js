const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;
const sinon = require('sinon');
const forEach = require('mocha-each');
const {fixtureContent} = require('../UtilTool');
const path = require('path');
const glob = require("glob");
const fs = require('fs');

var thiscommand;
var thistester;
var thiscolSize;

const Command = require('../../src/command/Command');
const OutputFormatter = require('../../src/formatter/OutputFormatter');
const ConsoleOutput = require('../../src/output/ConsoleOutput');
const Output = require('../../src/output/Output');
const Input = require('../../src/input/Input');
const SymfonyStyle = require('../../src/style/SymfonyStyle');
const CommandTester = require('../../src/tester/CommandTester');

const {putenv, getenv} = require('../../src/PhpPolyfill');

describe('#SymfonyStyle', () =>
{
  forEach(inputCommandToOutputFilesProvider()).
  it('testOutputs %s', async (inputCommandFilepath, outputFilepath) =>
  {
    let code = require(inputCommandFilepath);
    let expected = String(fs.readFileSync(outputFilepath));
    
    thiscommand.setCode(code);
    await thistester.execute([], {'interactive': false, 'decorated': false});
    assert.deepEqual(thistester.getDisplay(true), expected);
    //assert.include(expected, thistester.getDisplay(true));
  });

  forEach(inputInteractiveCommandToOutputFilesProvider()).
  it('testInteractiveOutputs %s', async (inputCommandFilepath, outputFilepath) =>
  {
    let code = require(inputCommandFilepath);
    let expected = String(fs.readFileSync(outputFilepath));
    
    thiscommand.setCode(code);
    await thistester.execute([], {'interactive': true, 'decorated': false});
    assert.deepEqual(thistester.getDisplay(true), expected);
    //assert.isStringEqualsFile(outputFilepath, thistester.getDisplay(true));
  });

  it('testGetErrorStyle', () =>
  {
    let input = new Input();

    let errorOutput = new Output();
    sinon.stub(errorOutput, 'getFormatter').returns(new OutputFormatter());
    sinon.mock(errorOutput) .expects('write').once();
    
    let output = new ConsoleOutput();
    sinon.stub(output, 'getFormatter').returns(new OutputFormatter());
    sinon.stub(output, 'getErrorOutput').returns(errorOutput);
    
    let io = new SymfonyStyle(input, output);
    io.getErrorStyle().write('');
  });

  it('testGetErrorStyleUsesTheCurrentOutputIfNoErrorOutputIsAvailable', () =>
  {
    let output = new ConsoleOutput();
    sinon.stub(output, 'getFormatter').returns(new OutputFormatter());

    let style = new SymfonyStyle(new Input(), output);

    assert.instanceOf( style.getErrorStyle(), SymfonyStyle);
  });


  before(() =>
  {
    thiscolSize = getenv('COLUMNS');
    putenv('COLUMNS=121');
    thiscommand = new Command('sfstyle');
    thistester = new CommandTester(thiscommand);
  });

  after(() =>
  {
    putenv(thiscolSize ? 'COLUMNS=' + thiscolSize : 'COLUMNS');
    thiscommand = null;
    thistester = null;
  });

  function inputInteractiveCommandToOutputFilesProvider()
  {
    let baseDir = path.resolve(__dirname+'/../Fixtures/Style/SymfonyStyle');
    let res = glob.sync(baseDir + '/output/interactive_output_*.txt');
    let set = glob.sync(baseDir + '/command/interactive_command_*.js\'').map((a, i) => {return [a,res[i]]});

    return set;
  }

  function inputCommandToOutputFilesProvider()
  {
    let baseDir = path.resolve(__dirname+'/../Fixtures/Style/SymfonyStyle');
    let res = glob.sync(baseDir + '/output/output_*.txt');
    let set = glob.sync(baseDir + '/command/command_*.js').map((a, i) => {return [a,res[i]]});
    
    return set;
  }

});
  