const {escapeshellarg, trim, sprintf, ord, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const streamutil = require('../streamutil');
const forEach = require('lodash/forEach');
const {execSync} = require('child_process');
const readline = require('readline');

const OutputFormatter = require('../formatter/OutputFormatter');
const OutputFormatterStyle = require('../formatter/OutputFormatterStyle');
const ConsoleSectionOutput = require('../output/ConsoleSectionOutput');
const ChoiceQuestion = require('../question/ChoiceQuestion');
const ConsoleOutput = require('../output/ConsoleOutput');

const Terminal = require('../Terminal');

const Helper = require('./Helper');
const Input = require('../input/Input');

var stty = false;

class QuestionHelper extends Helper {
  constructor() {
    super();
    this.inputStream = null;
    this.outputStream = null;
    this.shell = null;
  }

  async ask(input, output, question) {
    if (output instanceof ConsoleOutput) {
      output = output.getErrorOutput();
    }

    if (!input.isInteractive()) {
      let fallback = question.getFallback();

      if (null === fallback) {
        return fallback;
      }

      let validator = question.getValidator();
      if (validator) {
        return question.getValidator()(fallback);
      } else if (question instanceof ChoiceQuestion) {
        let choices = question.getChoices();

        if (!question.isMultiselect()) {
          return isset(choices[fallback]) ? choices[fallback] : fallback;
        }

        fallback = fallback.split(',');
        forEach(fallback, function (v, k) {
          v = question.isTrimmable() ? trim(v) : v;
          fallback[k] = isset(choices[v]) ? choices[v] : v;
        });
      }

      return fallback;
    }

    let stream = input.getStream();

    if (input instanceof Input && stream) {
      this.inputStream = stream;
    }

    //In case it's a OutputStyle
    let strm = output.output || output;
    if (strm.getStream && strm.getStream()) {
      this.outputStream = strm.getStream();
    }
    
    if (!question.getValidator()) {
      return this.doAsk(output, question);
    }

    let interviewer = () => {
      return this.doAsk(output, question);
    };

    return this.validateAttempts(interviewer, output, question);
  }

  getName() {
    return 'question';
  }

  static disableStty() {
    stty = false;
  }

  async doAsk(output, question) {
    
    let inputStream = this.inputStream || process.stdin;
    let autocomplete = question.getAutocompleterCallback();

    var ret = false;
    if (null === autocomplete || !Terminal.hasSttyAvailable()) {
      if (question.isHidden()) {
        try {
          let hiddenResponse = this.getHiddenResponse(output, inputStream, question.isTrimmable());
          ret = question.isTrimmable() ? trim(hiddenResponse) : hiddenResponse;
        } catch (e) {
          if (!question.isHiddenFallback()) {
            throw e;
          }
        }
      }

      if (false === ret) {
        ret = await new Promise((resolve, reject) => {
          const rl = readline.createInterface({
            input: inputStream,
            output: this.outputStream,
            prompt: ''
          });
          
          const prompt = this.createPrompt(output, question);
          rl.question(prompt, (answer) => {
            resolve(answer);
            rl.close();
          });
        });
          
        ret = question.isTrimmable() ? trim(ret) : ret;

        if (false === ret) {
          throw new Error('Aborted.');
        }
      }
    } else {
      this.writePrompt(output, question);
      autocomplete = await this.autocomplete(output, question, inputStream, autocomplete);
      ret = question.isTrimmable() ? trim(autocomplete) : autocomplete;
    }

    if (output instanceof ConsoleSectionOutput) {
      output.addContent(ret);
    }

    ret = strlen(ret) > 0 ? ret : question.getFallback();

    let normalizer = question.getNormalizer();
    if (normalizer) {
      return normalizer(ret);
    }

    return ret;
  }

  createPrompt(output, question){

    let message = question.getQuestion();

    if (question instanceof ChoiceQuestion) {
      const rows = [
        question.getQuestion(),
        ...this.formatChoiceQuestionChoices(question, 'info')];
      message = output
        .format(rows)
        .join("\n") + "\n";

      message += question.getPrompt();
    }else{
      message = output.format(message).join("\n");
    }

    return message;
  }
  
  writePrompt(output, question) {
    output.write(this.createPrompt(output, question));
  }

  formatChoiceQuestionChoices(question, tag) {
    let messages = [];
    let choices = question.getChoices();
    let maxWidth = Math.max(...Object.keys(choices).map(c => c.length));

    forEach(choices, function (value, key) {
      let padding = " ".repeat(maxWidth - key.length);

      messages.push(sprintf(`  [<${tag}>%s</${tag}>] %s`, key + padding, value));
    });

    return messages;
  }

  writeError(output, error) {
    let message = "";
    if (null !== this.getHelperSet() && this.getHelperSet().has('formatter')) {
      message = this.getHelperSet().get('formatter').formatBlock(error.message, 'error');
    } else {
      message = '<error>' + error.getMessage() + '</error>';
    }

    output.writeln(message);
  }

  autocomplete(output, question, inputStream, autocomplete) {
    let fullChoice = '';
    let ret = '';

    let i = 0;
    let ofs = -1;
    let matches = [...autocomplete(ret)];
    let numMatches = count(matches);
    let escaped = null;

    // Add highlighted text style
    output.getFormatter().setStyle('hl', new OutputFormatterStyle('black', 'white'));
    inputStream.setRawMode(true);
    inputStream.resume();
    inputStream.setEncoding('utf8');

    return new Promise((resolve, reject) => {
      var listener = null;
      inputStream.on('data', listener = (c) => {

        // Unit test fix
        if (escaped !== null) {
          escaped += c;
          if (escaped.length === 3) {
            c = escaped;
            escaped = null;
          } else {
            return;
          }
        }

        if (c === '\u0003' || false === c || ('' === ret && '' === c && null === question.getFallback())) {
          throw new Error('Aborted.');
        } else if ("\x7F" === c) { // Backspace Character
          if (0 === numMatches && 0 !== i) {
            --i;
            fullChoice = fullChoice.substr(0, i);
            // Move _cursor backwards
            output.write("\x1B[1D");
          }

          if (0 === i) {
            ofs = -1;
            matches = [...autocomplete(ret)];
            numMatches = count(matches);
          } else {
            numMatches = 0;
          }

          // Pop the last character off the end of our string
          ret = substr(ret, 0, i);
        } else if ("\x1B" === c) {
          // Did we read an escape sequence?
          //c += fread(inputStream, 2);
          // spoof for testing, when typing the whole sequence comes
          // true, but while testing it comes byte by byte.
          escaped = c;
          return;
        } else if ("\u001b[A" === c || "\u001b[B" === c) {
          // let A = Up Arrow +  B = Down Arrow
          const up = "\u001b[A" === c;
          if (up && -1 === ofs) {
            ofs = 0;
          }

          if (0 === numMatches) {
            return;
          }

          ofs += up ? -1 : 1;
          ofs = (numMatches + ofs) % numMatches;
        } else if (ord(c) < 32) {
          if ("\t" === c || "\n" === c || "\r" === c) {
            if (numMatches > 0 && -1 !== ofs) {
              ret = matches[ofs].toString();
              // Echo out remaining chars for current match
              let remainingCharacters = substr(ret, strlen(trim(this.mostRecentlyEnteredValue(fullChoice))));
              output.write(remainingCharacters);
              fullChoice += remainingCharacters;
              i = strlen(fullChoice);


              matches = [...autocomplete(ret)].filter((match) => {
                return '' === ret || 0 === strpos(match, ret);
              });
              numMatches = count(matches);
              ofs = -1;
            }

            numMatches = 0;
          }

          if ("\n" === c || "\r" === c) {
            output.write("\n");
          }

          if ("\n" === c || "\r" === c || "\x04" === c) {
            inputStream.off("data", listener);
            resolve(fullChoice);
            inputStream.pause();
          }

          return;
        } else {
          if ("\x80" <= c) {
            //c += fread(inputStream, {"\xC0": 1, "\xD0": 1, "\xE0": 2, "\xF0": 3}[c & "\xF0"]);
          }

          output.write(c);
          ret += c;
          fullChoice += c;
          ++i;

          let tempRet = ret;

          if (question instanceof ChoiceQuestion && question.isMultiselect()) {
            tempRet = this.mostRecentlyEnteredValue(fullChoice);
          }

          numMatches = 0;
          ofs = 0;

          let suggestions = [...autocomplete(ret)];
          forEach(suggestions, (value) => {
            // If typed characters match the beginning chunk of value (e + g +  [AcmeDe]moBundle)
            if (0 === strpos(value, tempRet)) {
              matches[numMatches++] = value;
            }
          });
        }

        // Erase characters from _cursor to end of line
        output.write("\x1B[K");

        if (numMatches > 0 && -1 !== ofs) {
          // Save _cursor position
          output.write("\x1B7");
          // Write highlighted text, complete the partially entered response
          let charactersEntered = strlen(trim(this.mostRecentlyEnteredValue(fullChoice)));
          output.write('<hl>' + OutputFormatter.escapeTrailingBackslash(substr(matches[ofs], charactersEntered)) + '</hl>');
          // Restore _cursor position
          output.write("\x1B8");
        }
      });
    });

  }

  mostRecentlyEnteredValue(entered) {
    // Determine the most recent value that the user entered
    if (false === strpos(entered, ',')) {
      return entered;
    }

    let choices = entered.split(',');
    let lastChoice = trim(choices[count(choices) - 1])
    if (strlen(lastChoice) > 0) {
      return lastChoice;
    }

    return entered;
  }

  getHiddenResponse(output, inputStream, trimmable = true) {
    if ('\\' === DIRECTORY_SEPARATOR) {
      let exe = __DIR__ + '/ +  + /Resources/bin/hiddeninput.exe';
      let tmpExe;

      // handle code running from a phar
      if ('phar:' === substr(__FILE__, 0, 5)) {
        tmpExe = sys_get_temp_dir() + '/hiddeninput.exe';
        copy(exe, tmpExe);
        let exe = tmpExe;
      }

      let sExec = execSync(exe);
      value = trimmable ? rtrim(sExec) : sExec;
      output.writeln('');

      if (isset(tmpExe)) {
        unlink(tmpExe);
      }

      return value;
    }

    if (Terminal.hasSttyAvailable()) {
      let sttyMode = execSync('stty -g');

      execSync('stty -echo');
      let value = fgets(inputStream, 4096);
      execSync(sprintf('stty %s', sttyMode));

      if (false === value) {
        throw new Error('Aborted.');
      }
      if (trimmable) {
        value = trim(value);
      }
      output.writeln('');

      return value;
    }

    let shell = this.getShell()
    if (false !== shell) {
      let readCmd = 'csh' === shell ? 'set mypassword = <' : 'read -r mypassword';
      let command = sprintf("/usr/bin/env %s -c 'stty -echo; %s; stty echo; echo \mypassword'", shell, readCmd);
      let sCommand = execSync(command);
      value = trimmable ? rtrim(sCommand) : sCommand;
      output.writeln('');

      return value;
    }

    throw new Error('Unable to hide the response + ');
  }

  async validateAttempts(interviewer, output, question) {
    let error = null;
    let attempts = question.getMaxAttempts();
    while (null === attempts || attempts--) {
      if (null !== error) {
        this.writeError(output, error);
      }

      try {
        let res = await interviewer();
        return question.getValidator()(res);
      } catch (e) {
        error = e;
        //throw e;
      }
    }

    throw error;
  }

  getShell() {
    if (null !== this.shell) {
      return this.shell;
    }

    this.shell = false;

    if (file_exists('/usr/bin/env')) {
      // handle other OSs with bash/zsh/ksh/csh if available to hide the answer
      let test = "/usr/bin/env %s -c 'echo OK' 2> /dev/null";
      forEach(['bash', 'zsh', 'ksh', 'csh'], (sh) => {
        if ('OK' === rtrim(execSync(sprintf(test, sh)))) {
          this.shell = sh;
          return;
        }
      });
    }

    return this.shell;
  }

}

module.exports = QuestionHelper;
