const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const Application = require('../Application');
const Command = require('../command/Command');
const InputArgument = require('../input/InputArgument');
const InputDefinition = require('../input/InputDefinition');
const InputOption = require('../input/InputOption');
const Output = require('../output/Output');

class Descriptor
{
  describe(output, object, options = [])
  {
    this.output = output;

    switch (true)
    {
      case object instanceof InputArgument:
        this.describeInputArgument(object, options);
        break;
      case object instanceof InputOption:
        this.describeInputOption(object, options);
        break;
      case object instanceof InputDefinition:
        this.describeInputDefinition(object, options);
        break;
      case object instanceof Command:
        this.describeCommand(object, options);
        break;
      case object instanceof Application:
        this.describeApplication(object, options);
        break;
        fallback:
          throw new Error(sprintf('Object of type "%s" is not describable + ', get_class(object)));
    }
  }

  write(content, decorated = false)
  {
    this.output.write(content, false, decorated ? Output.OUTPUT_NORMAL : Output.OUTPUT_RAW);
  }

}

module.exports = Descriptor;
