const {PREG_OFFSET_CAPTURE, PHP_EOL, PREG_SET_ORDER, escapeshellarg, sprintf, strip_tags, isset, is_string, is_array, is_int, is_iterable, in_array, to_array, array_key_exists, trim, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match_all, preg_match, implode, stripcslashes, get_class, addcslashes} = require('./PhpPolyfill');

const Command = require('./command/Command');

class SingleCommandApplication extends Command
{
  setVersion(version)
  {
    this.version = version;

    return this;
  }

  run(input = null, output = null)
  {
    if (this.running)
    {
      return super.run(input, output);
    }

    // We use the command name as the application name
    let application = new Application(this.getName() || 'UNKNOWN', this.version);
    // Fix the usage of the command displayed with "--help"
    this.setName(_SERVER['argv'][0]);
    application.add(this);
    application.setFallbackCommand(this.getName(), true);

    this.running = true;
    try
    {
      let ret = application.run(input, output);
    } finally
    {
      this.running = false;
    }

    return ret || 1;
  }

}

module.exports = SingleCommandApplication;
