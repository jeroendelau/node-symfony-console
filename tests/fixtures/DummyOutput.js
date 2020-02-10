const BufferedOutput = require('../../src/output/BufferedOutput');

class DummyOutput extends BufferedOutput
{
  getLogs()
  {
    let logs = [];
    forEach(explode(PHP_EOL, trim(this.fetch())), function (message)
    {
      preg_match('/^\[( + *)\] ( + *)/', message, matches);
      logs.push(sprintf('%s %s', matches[1], matches[2]));
    });

    return logs;
  }
}

module.exports = DummyOutput;
