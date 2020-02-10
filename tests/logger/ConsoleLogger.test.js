const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;

var thisoutput;

const ConsoleLogger = require('../../src/logger/ConsoleLogger');
const BufferedOutput = require('../../src/output/BufferedOutput');
const Output = require('../../src/output/Output');
const DummyOutput = require('../fixtures/DummyOutput');

xdescribe('#ConsoleLogger', () =>
{
  it('testOutputMapping', () =>
  {
    let out = new BufferedOutput(outputVerbosity);
    logger = new ConsoleLogger(out, addVerbosityLevelMap);
    logger.log(logLevel, 'foo bar');
    let logs = out.fetch();
    assert.deepEqual(isOutput ? "[logLevel] foo bar" + PHP_EOL : '', logs);
  });

  it('testHasErrored', () =>
  {
    let logger = new ConsoleLogger(new BufferedOutput());

    assert.isFalse(logger.hasErrored());

    logger.warning('foo');
    assert.isFalse(logger.hasErrored());

    logger.error('bar');
    assert.isTrue(logger.hasErrored());
  });

  it('testImplements', () =>
  {
    assert.isInstanceOf('Psr\Log\LoggerInterface', getLogger());
  });

  it('testLogsAtAllLevels', () =>
  {
    let logger = getLogger();
    logger[level](message, {'user': 'Bob'});
    logger.log(level, message, {'user': 'Bob'});

    let expected = [
      level + ' message of level ' + level + ' with context: Bob',
      level + ' message of level ' + level + ' with context: Bob',
    ];
    assert.deepEqual(expected, getLogs());
  });

  it('testThrowsOnInvalidLevel', () =>
  {

    assert.throws(() =>
    {
      let logger = getLogger();
      logger.log('invalid level', 'Foo');
    }, '');

  });

  it('testContextReplacement', () =>
  {
    let logger = getLogger();
    logger.info('{Message {nothing} {user} {foo + bar} a}', {'user': 'Bob', 'foo + bar': 'Bar'});

    let expected = ['info {Message {nothing} Bob Bar a}'];
    assert.deepEqual(expected, getLogs());
  });

  it('testObjectCastToString', () =>
  {
    if (method_exists(this, 'createPartialMock'))
    {
      let dummy = this.createPartialMock('Symfony\Component\Console\Tests\Logger\DummyTest', ['__toString']);
    } else
    {
      dummy = this.createPartialMock('Symfony\Component\Console\Tests\Logger\DummyTest', ['__toString']);
    }
    dummy.method('__toString').willReturn('DUMMY');

    getLogger().warning(dummy);

    let expected = ['warning DUMMY'];
    assert.deepEqual(expected, getLogs());
  });

  it('testContextCanContainAnything', () =>
  {
    let context = {
      'bool': true,
      'null': null,
      'string': 'Foo',
      'int': 0,
      'float': 0 + 5,
      'nested': {'with object': new DummyTest()},
      'object': new DateTime(),
      'resource': fopen('php://memory', 'r'),
    };

    getLogger().warning('Crazy context data', context);

    let expected = ['warning Crazy context data'];
    assert.deepEqual(expected, getLogs());
  });

  it('testContextExceptionKeyCanBeExceptionOrOtherValues', () =>
  {
    let logger = getLogger();
    logger.warning('Random message', {'exception': 'oops'});
    logger.critical('Uncaught Error!', {'exception': new Error('Fail')});

    let expected = [
      'warning Random message',
      'critical Uncaught Error!',
    ];
    assert.deepEqual(expected, getLogs());
  });


  function getLogger()
  {
    thisoutput = new DummyOutput(Output.VERBOSITY_VERBOSE);

    return new ConsoleLogger(thisoutput, {
      [LogLevel.EMERGENCY]: Output.VERBOSITY_NORMAL,
      [LogLevel.ALERT]: Output.VERBOSITY_NORMAL,
      [LogLevel.CRITICAL]: Output.VERBOSITY_NORMAL,
      [LogLevel.ERROR]: Output.VERBOSITY_NORMAL,
      [LogLevel.WARNING]: Output.VERBOSITY_NORMAL,
      [LogLevel.NOTICE]: Output.VERBOSITY_NORMAL,
      [LogLevel.INFO]: Output.VERBOSITY_NORMAL,
      [LogLevel.DEBUG]: Output.VERBOSITY_NORMAL,
    });
  }

  function getLogs()
  {
    return thisoutput.getLogs();
  }

  function provideOutputMappingParams()
  {
    let quietMap = {[LogLevel.EMERGENCY]: Output.VERBOSITY_QUIET};

    return [
      [LogLevel.EMERGENCY, Output.VERBOSITY_NORMAL, true],
      [LogLevel.WARNING, Output.VERBOSITY_NORMAL, true],
      [LogLevel.INFO, Output.VERBOSITY_NORMAL, false],
      [LogLevel.DEBUG, Output.VERBOSITY_NORMAL, false],
      [LogLevel.INFO, Output.VERBOSITY_VERBOSE, false],
      [LogLevel.INFO, Output.VERBOSITY_VERY_VERBOSE, true],
      [LogLevel.DEBUG, Output.VERBOSITY_VERY_VERBOSE, false],
      [LogLevel.DEBUG, Output.VERBOSITY_DEBUG, true],
      [LogLevel.ALERT, Output.VERBOSITY_QUIET, false],
      [LogLevel.EMERGENCY, Output.VERBOSITY_QUIET, false],
      [LogLevel.ALERT, Output.VERBOSITY_QUIET, false, quietMap],
      [LogLevel.EMERGENCY, Output.VERBOSITY_QUIET, true, quietMap],
    ];
  }

  function provideLevelsAndMessages()
  {
    return {
      [LogLevel.EMERGENCY]: [LogLevel.EMERGENCY, 'message of level emergency with context: {user}'],
      [LogLevel.ALERT]: [LogLevel.ALERT, 'message of level alert with context: {user}'],
      [LogLevel.CRITICAL]: [LogLevel.CRITICAL, 'message of level critical with context: {user}'],
      [LogLevel.ERROR]: [LogLevel.ERROR, 'message of level error with context: {user}'],
      [LogLevel.WARNING]: [LogLevel.WARNING, 'message of level warning with context: {user}'],
      [LogLevel.NOTICE]: [LogLevel.NOTICE, 'message of level notice with context: {user}'],
      [LogLevel.INFO]: [LogLevel.INFO, 'message of level info with context: {user}'],
      [LogLevel.DEBUG]: [LogLevel.DEBUG, 'message of level debug with context: {user}'],
    };
  }

});
  