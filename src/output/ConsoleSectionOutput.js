const {escapeshellarg, PHP_EOL, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const Helper = require('../helper/Helper');
const Terminal = require('..//Terminal');

const StreamOutput = require('./StreamOutput');

class ConsoleSectionOutput extends StreamOutput
{
  constructor(stream, sections, verbosity, decorated, formatter)
  {
    super(stream, verbosity, decorated, formatter);

    sections.unshift(this);
    this.sections = sections;
    this.terminal = new Terminal();
    this.content = [];
    this.lines = 0;
  }

  clear(lines = null)
  {
    if (this.content.length === 0 || !this.isDecorated())
    {
      return;
    }

    if (lines)
    {
      this.content.splice( -(lines * 2)); // Multiply lines by 2 to cater for each new line added between content
    } else
    {
      lines = this.lines;
      this.content = [];
    }

    this.lines -= lines;

    super.doWrite(this.popStreamContentUntilCurrentSection(lines), false);
  }

  overwrite(message)
  {
    this.clear();
    this.writeln(message);
  }

  getContent()
  {
    return implode('', this.content);
  }

  addContent(input)
  {
    forEach(input.split(PHP_EOL), (lineContent) =>
    {
      this.lines += Math.ceil(this.getDisplayLength(lineContent) / this.terminal.getWidth()) || 1;
      this.content.push(lineContent);
      this.content.push(PHP_EOL);
    });
  }

  doWrite(message, newline)
  {
    if (!this.isDecorated())
    {
      super.doWrite(message, newline);

      return;
    }

    let erasedContent = this.popStreamContentUntilCurrentSection();

    this.addContent(message);

    super.doWrite(message, true);
    super.doWrite(erasedContent, false);
  }

  popStreamContentUntilCurrentSection(numberOfLinesToClearFromCurrentSection = 0)
  {
    let numberOfLinesToClear = numberOfLinesToClearFromCurrentSection;
    let erasedContent = [];

    forEach(this.sections,  (section) =>
    {
      if (section === this)
      {
        return false;
      }

      numberOfLinesToClear += section.lines;
      erasedContent.push(section.getContent());
    });

    if (numberOfLinesToClear > 0)
    {
      // move _cursor up n lines
      super.doWrite(sprintf("\x1b[%dA", numberOfLinesToClear), false);
      // erase to end of screen
      super.doWrite("\x1b[0J", false);
    }

    return implode('', erasedContent.reverse());
  }

  getDisplayLength(text)
  {
    return Helper.strlenWithoutDecoration(this.getFormatter(), str_replace("\t", '        ', text));
  }

}

module.exports = ConsoleSectionOutput;
