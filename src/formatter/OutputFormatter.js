const {escapeshellarg, rtrim, ltrim, PREG_OFFSET_CAPTURE, PREG_SET_ORDER, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, preg_match_all, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const OutputFormatterStyle = require('./OutputFormatterStyle');
const OutputFormatterStyleStack = require('./OutputFormatterStyleStack');

class OutputFormatter
{
  static escape(text)
  {
    text = text.replace(/([^\\\\]?)</g, '$1\\<');

    return OutputFormatter.escapeTrailingBackslash(text);
  }

  /**
   * Escapes trailing "\" in given text.
   *
   * @internal
   */
  static escapeTrailingBackslash(text)
  {
    if ('\\' === substr(text, -1))
    {
      let len = strlen(text);
      text = rtrim(text, '\\\\');
      text = text.replace("\0", '');
      text += "\0".repeat(len - strlen(text));
    }

    return text;
  }

  constructor(decorated = false, styles = [])
  {
    this.decorated;
    this.styleStack;

    this.decorated = decorated;
    this.styles = {};

    this.setStyle('error', new OutputFormatterStyle('white', 'red'));
    this.setStyle('info', new OutputFormatterStyle('green'));
    this.setStyle('comment', new OutputFormatterStyle('yellow'));
    this.setStyle('question', new OutputFormatterStyle('black', 'cyan'));

    forEach(styles, function (style, name)
    {
      this.setStyle(name, style);
    });

    this.styleStack = new OutputFormatterStyleStack();
  }


  setDecorated(decorated)
  {
    this.decorated = decorated;
  }

  isDecorated()
  {
    return this.decorated;
  }

  setStyle(name, style)
  {
    this.styles[name.toLowerCase()] = style;
  }

  hasStyle(name)
  {
    return isset(this.styles[name.toLowerCase()]);
  }

  getStyle(name)
  {
    if (!this.hasStyle(name))
    {
      throw new Error(sprintf('Undefined style: %s', name));
    }

    return this.styles[name.toLowerCase()];
  }

  format(message)
  {
    message = String(message);
    return this.formatAndWrap(message, 0);
  }

  formatAndWrap(message, width)
  {
    let offset = 0;
    let output = '';
    let tagRegex = '[a-z][^<>]*+';
    let currentLineLength = {l: 0};
    let matches = [];
    preg_match_all(/<(\/?([a-z]*[^<>]*))>/i, message, matches, PREG_OFFSET_CAPTURE);
    forEach(matches[0], (match, i) =>
    {
      let pos = match[1];
      let text = match[0];

      if (0 != pos && '\\' == message[pos - 1])
      {
        return;
      }

      // add the text up to the next tag
      output += this.applyCurrentStyle(substr(message, offset, pos - offset), output, width, currentLineLength);
      offset = pos + strlen(text);

      // opening tag?
      let tag = false;
      let open = '/' != text[1];
      if (open)
      {
        tag = matches[1][i][0];
      } else
      {
        tag = isset(matches[2][i][0]) ? matches[2][i][0] : '';
      }

      const style = this.createStyleFromString(tag);

      if (!open && !tag)
      {
        // </>
        this.styleStack.pop();
      } else if (null === style)
      {
        output += this.applyCurrentStyle(text, output, width, currentLineLength);
      } else if (open)
      {
        this.styleStack.push(style);
      } else
      {
        this.styleStack.pop(style);
      }
    });

    output += this.applyCurrentStyle(substr(message, offset), output, width, currentLineLength);

    if (false !== strpos(output, "\0"))
    {
      output = output.replace(/\\</g, "\<");
      output = output.replace(/\0/g, "\\");
      return output;
      //return str_replace( ["\0", '\\<'],[ '\\', '\<'], output);
      //return str_replace(output, {"\0": '\\', '\\<': '<'});
    }

    return output.replace(/\\</g, '<');
  }

  getStyleStack()
  {
    return this.styleStack;
  }

  createStyleFromString(string)
  {
    if (isset(this.styles[string]))
    {
      return this.styles[string];
    }

    let matches = [];
    if (!preg_match_all(/([^=]+)=([^;]+)(;|)/, string, matches, PREG_SET_ORDER))
    {
      return null;
    }

    let style = new OutputFormatterStyle();
    forEach(matches, function (match)
    {
      match.shift();
      match[0] = (match[0].toLowerCase());

      if ('fg' == match[0])
      {
        style.setForeground(match[1].toLowerCase());
      } else if ('bg' == match[0])
      {
        style.setBackground(match[1].toLowerCase());
      } else if ('href' === match[0])
      {
        style.setHref(match[1]);
      } else if ('options' === match[0])
      {
        let options = [];
        preg_match_all(/[^,;]+/, match[1].toLowerCase(), options);
        options = array_shift(options);
        forEach(options,  (option) =>
        {
          style.setOption(option);
        });
      } else
      {
        style = null;
        return false;
      }
    });

    return style;
  }

  applyCurrentStyle(text, current, width, currentLineLength)
  {
    let prefix = '';

    if ('' === text)
    {
      return '';
    }

    if (!width)
    {
      return this.isDecorated() ? this.styleStack.getCurrent().apply(text) : text;
    }

    if (!currentLineLength.l && '' !== current)
    {
      text = ltrim(text);
    }

    if (currentLineLength.l)
    {
      const i = width - currentLineLength.l;
      prefix = substr(text, 0, i) + "\n";
      text = substr(text, i);
    } else
    {
      prefix = '';
    }

    let matches = [];
    preg_match(/(\\n)$/, text, matches);
    let reg = new RegExp('([^\\n]{' + width + '})\\ *', "g");
    text = prefix + text.replace(reg, "$1\n");
    text = rtrim(text, "\n") + (matches[1] || '');

    if (!currentLineLength.l && '' !== current && "\n" !== substr(current, -1))
    {
      text = "\n" + text;
    }

    let lines = text.split("\n");

    forEach(lines,  (line) =>
    {
      currentLineLength.l += strlen(line);
      if (width <= currentLineLength.l)
      {
          currentLineLength.l = 0;
      }
    });

    if (this.isDecorated())
    {
      forEach(lines, (line, i) =>
      {
        lines[i] = this.styleStack.getCurrent().apply(line);
      });
    }

    return implode("\n", lines);
  }

}

module.exports = OutputFormatter;
