const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;


const DebugFormatterHelper = require('../../src/helper/DebugFormatterHelper');
const HelperSet = require('../../src/helper/HelperSet');
const ProcessHelper = require('../../src/helper/ProcessHelper');
const StreamOutput = require('../../src/output/StreamOutput');

const {is_string, getenv, putenv} = require('../../src/PhpPolyfill');

xdescribe('#ProcessHelper', () =>
{
  it('testVariousProcessRuns', () =>
  {
    if (is_string(cmd))
    {
      let cmd = method_exists(Process.class, 'fromShellCommandline') ? Process.fromShellCommandline(cmd) : new Process(cmd);
    }

    let helper = new ProcessHelper();
    helper.setHelperSet(new HelperSet([new DebugFormatterHelper()]));
    let output = getOutputStream(verbosity);
    helper.run(output, cmd, error);
    assert.deepEqual(expected, getOutput(output));
  });

  it('testPassedCallbackIsExecuted', () =>
  {
    let helper = new ProcessHelper();
    helper.setHelperSet(new HelperSet([new DebugFormatterHelper()]));
    let output = getOutputStream(StreamOutput.VERBOSITY_NORMAL);

    let executed = false;
    let callback = () =>
    {
      executed = true;
    };

    helper.run(output, ['php', '-r', 'echo 42;'], null, callback);
    assert.isTrue(executed);
  });


  function provideCommandsAndOutput()
  {
    let successOutputVerbose = `
  RUN  php -r "echo 42;"
  RES  Command ran successfully

`;
    let successOutputDebug = `
  RUN  php -r "echo 42;"
  OUT  42
  RES  Command ran successfully

`;

    let successOutputDebugWithTags = `
  RUN  php -r "echo '<info>42</info>';"
  OUT  <info>42</info>
  RES  Command ran successfully

`;
    let successOutputProcessDebug = `
  RUN  'php' '-r' 'echo 42;'
  OUT  42
  RES  Command ran successfully

`;
    let syntaxErrorOutputVerbose = `
  RUN  php -r "fwrite(STDERR, 'error message');usleep(50000);fwrite(STDOUT, 'out message');exit(252);"
  RES  252 Command did not run successfully

`;

    let syntaxErrorOutputDebug = `
  RUN  php -r "fwrite(STDERR, 'error message');usleep(500000);fwrite(STDOUT, 'out message');exit(252);"
  ERR  error message
  OUT  out message
  RES  252 Command did not run successfully

`;


    let PHP = '\\' === DIRECTORY_SEPARATOR ? '"!PHP!"' : '"$PHP"';
    successOutputPhp = `
  RUN  php -r $PHP
  OUT  42
  RES  Command ran successfully

`;

    let errorMessage = 'An error occurred';
    args = new Process(['php', '-r', 'echo 42;']);
    let args = args.getCommandLine();
    successOutputProcessDebug = str_replace("'php' '-r' 'echo 42;'", args, successOutputProcessDebug);
    fromShellCommandline = method_exists(Process.class, 'fromShellCommandline') ? [Process.class, 'fromShellCommandline'] : function (cmd)
    {
      return new Process(cmd);
    };

    return [
      ['', 'php -r "echo 42;"', StreamOutput.VERBOSITY_VERBOSE, null],
      [successOutputVerbose, 'php -r "echo 42;"', StreamOutput.VERBOSITY_VERY_VERBOSE, null],
      [successOutputDebug, 'php -r "echo 42;"', StreamOutput.VERBOSITY_DEBUG, null],
      [successOutputDebugWithTags, 'php -r "echo \'<info>42</info>\';"', StreamOutput.VERBOSITY_DEBUG, null],
      ['', 'php -r "syntax error"', StreamOutput.VERBOSITY_VERBOSE, null],
      [syntaxErrorOutputVerbose, 'php -r "fwrite(STDERR, \'error message\');usleep(50000);fwrite(STDOUT, \'out message\');exit(252);"', StreamOutput.VERBOSITY_VERY_VERBOSE, null],
      [syntaxErrorOutputDebug, 'php -r "fwrite(STDERR, \'error message\');usleep(500000);fwrite(STDOUT, \'out message\');exit(252);"', StreamOutput.VERBOSITY_DEBUG, null],
      [errorMessage + PHP_EOL, 'php -r "fwrite(STDERR, \'error message\');usleep(50000);fwrite(STDOUT, \'out message\');exit(252);"', StreamOutput.VERBOSITY_VERBOSE, errorMessage],
      [syntaxErrorOutputVerbose + errorMessage + PHP_EOL, 'php -r "fwrite(STDERR, \'error message\');usleep(50000);fwrite(STDOUT, \'out message\');exit(252);"', StreamOutput.VERBOSITY_VERY_VERBOSE, errorMessage],
      [syntaxErrorOutputDebug + errorMessage + PHP_EOL, 'php -r "fwrite(STDERR, \'error message\');usleep(500000);fwrite(STDOUT, \'out message\');exit(252);"', StreamOutput.VERBOSITY_DEBUG, errorMessage],
      [successOutputProcessDebug, ['php', '-r', 'echo 42;'], StreamOutput.VERBOSITY_DEBUG, null],
      [successOutputDebug, fromShellCommandline('php -r "echo 42;"'), StreamOutput.VERBOSITY_DEBUG, null],
      [successOutputProcessDebug, [new Process(['php', '-r', 'echo 42;'])], StreamOutput.VERBOSITY_DEBUG, null],
      //[successOutputPhp, {fromShellCommandline('php -r ' + PHP), 'PHP' : 'echo 42;'}, StreamOutput.VERBOSITY_DEBUG, null],
    ];
  }

  function getOutputStream()
  {
    return new StreamOutput(fopen('php://memory', 'r+', false), verbosity, false);
  }

  function getOutput()
  {
    rewind(output.getStream());

    return stream_get_contents(output.getStream());
  }

});
