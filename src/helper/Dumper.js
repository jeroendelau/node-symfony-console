const {escapeshellarg, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

class Dumper
{
  constructor(output, dumper = null, cloner = null)
  {
    this.output;
    this.dumper;
    this.cloner;
    this.handler;

    this.output = output;
    this.dumper = dumper;
    this.cloner = cloner;

    /**if (class_exists(CliDumper.class))
    {
      this.handler = (varx) =>
      {
        dumper = this.dumper || new CliDumper(null, null, CliDumper.DUMP_LIGHT_ARRAY | CliDumper.DUMP_COMMA_SEPARATOR);
        dumper.setColors(this.output.isDecorated());

        return rtrim(dumper.dump((this.cloner || new VarCloner()).cloneVar(varx).withRefHandles(false), true));
      };
    } else
    {**/
      this.handler = function (varx)
      {
        switch (true)
        {
          case null === varx:
            return 'null';
          case true === varx:
            return 'true';
          case false === varx:
            return 'false';
          case is_string(varx):
            return '"' + varx + '"';
            fallback:
              return rtrim(print_r(varx, true));
        }
      };
    
    //}
  }

  __invoke(varx)
  {
    return (this.handler)(varx);
  }
}

module.exports = Dumper;
