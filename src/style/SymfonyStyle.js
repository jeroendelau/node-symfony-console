const {wordwrap, escapeshellarg,substr_count, DIRECTORY_SEPARATOR, PHP_EOL, is_iterable, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');
const wrap = require('word-wrap');

const Output = require('../output/Output');
const OutputFormatter = require('../formatter/OutputFormatter');
const Helper = require('../helper/Helper');
//const ProgressBar = require('../helper/ProgressBar');
const SymfonyQuestionHelper = require('../helper/SymfonyQuestionHelper');
const Table = require('../helper/Table');
const TableCell = require('../helper/TableCell');
const TableSeparator = require('../helper/TableSeparator');
const BufferedOutput = require('../output/BufferedOutput');
const ChoiceQuestion = require('../question/ChoiceQuestion');
const ConfirmationQuestion = require('../question/ConfirmationQuestion');
const Question = require('../question/Question');
const Terminal = require('../Terminal');

const MAX_LINE_LENGTH = 120;

const OutputStyle = require('./OutputStyle');

class SymfonyStyle extends OutputStyle
{
  constructor(input, output)
  {
    super(output);

    this.questionHelper;
    this.progressBar;

    this.input = input;
    this.bufferedOutput = new BufferedOutput(output.getVerbosity(), false,  Object.assign( Object.create( Object.getPrototypeOf(output.getFormatter())), output.getFormatter()));
    // Windows cmd wraps lines as soon as the terminal width is reached, whether there are following chars or not +
    let width = (new Terminal()).getWidth() || SymfonyStyle.MAX_LINE_LENGTH;
    this.lineLength = Math.min(width - (DIRECTORY_SEPARATOR === '\\' ? 1 : 0 ), SymfonyStyle.MAX_LINE_LENGTH);
  }

  static get MAX_LINE_LENGTH()
  {
    return MAX_LINE_LENGTH;
  }

  block(messages, type = null, style = null, prefix = ' ', padding = false, escape = true)
  {
    messages = is_array(messages) ? Object.values(messages) : [messages];

    this.autoPrependBlock();
    this.writeln(this.createBlock(messages, type, style, prefix, padding, escape));
    this.newLine();
  }

  title(message)
  {
    this.autoPrependBlock();
    this.writeln([
      sprintf('<comment>%s</>', OutputFormatter.escapeTrailingBackslash(message)),
      sprintf('<comment>%s</>', '='.repeat(Helper.strlenWithoutDecoration(this.getFormatter(), message))),
    ]);
    this.newLine();
  }

  section(message)
  {
    this.autoPrependBlock();
    this.writeln([
      sprintf('<comment>%s</>', OutputFormatter.escapeTrailingBackslash(message)),
      sprintf('<comment>%s</>', '-'.repeat(Helper.strlenWithoutDecoration(this.getFormatter(), message))),
    ]);
    this.newLine();
  }

  listing(elements)
  {
    this.autoPrependText();
    elements = elements.map((element) =>
    {
      return sprintf(' * %s', element);
    });

    this.writeln(elements);
    this.newLine();
  }

  text(message)
  {
    this.autoPrependText();

    let messages = is_array(message) ? Object.values(message) : [message];
    forEach(messages, (message) =>
    {
      this.writeln(sprintf(' %s', message));
    });
  }

  comment(message)
  {
    this.block(message, null, null, '<fg=fallback;bg=fallback> // </>', false, false);
  }

  success(message)
  {
    this.block(message, 'OK', 'fg=black;bg=green', ' ', true);
  }

  error(message)
  {
    this.block(message, 'ERROR', 'fg=white;bg=red', ' ', true);
  }

  warning(message)
  {
    this.block(message, 'WARNING', 'fg=black;bg=yellow', ' ', true);
  }

  note(message)
  {
    this.block(message, 'NOTE', 'fg=yellow', ' ! ');
  }

  caution(message)
  {
    this.block(message, 'CAUTION', 'fg=white;bg=red', ' ! ', true);
  }

  table(headers, rows)
  {
    let style = Table.getStyleDefinition('symfony-style-guide').clone();
    style.setCellHeaderFormat('<info>%s</info>');

    let table = new Table(this);
    table.setHeaders(headers);
    table.setRows(rows);
    table.setStyle(style);

    table.render();
    this.newLine();
  }

  horizontalTable(headers, rows)
  {
    let style = Table.getStyleDefinition('symfony-style-guide').clone();
    style.setCellHeaderFormat('<info>%s</info>');

    let table = new Table(this);
    table.setHeaders(headers);
    table.setRows(rows);
    table.setStyle(style);
    table.setHorizontal(true);

    table.render();
    this.newLine();
  }

  definitionList(...list)
  {
    let style = Table.getStyleDefinition('symfony-style-guide').clone();
    style.setCellHeaderFormat('<info>%s</info>');

    let table = new Table(this);
    let headers = [];
    let row = [];
    forEach(list,  (value) =>
    {
      if (value instanceof TableSeparator)
      {
        headers.push(value);
        row.push(value);
        return;
      }
      if (is_string(value))
      {
        headers.push(new TableCell(value, {'colspan': 2}));
        row.push(null);
        return;
      }
      
      let keys = Object.keys(value);
      let values = Object.values(value);
      
      if (keys.length != 1)
      {
        throw new Error('Value should be an {key: value}, string, or an instance of TableSeparator.');
      }
      headers.push(keys[0]);
      row.push(values[0]);
    });

    table.setHeaders(headers);
    table.setRows([row]);
    table.setHorizontal();
    table.setStyle(style);

    table.render();
    this.newLine();
  }

  ask(question, fallback = null, validator = null)
  {
    question = new Question(question, fallback);
    question.setValidator(validator);

    return this.askQuestion(question);
  }

  askHidden(question, validator = null)
  {
    question = new Question(question);

    question.setHidden(true);
    question.setValidator(validator);

    return this.askQuestion(question);
  }

  confirm(question, fallback = true)
  {
    return this.askQuestion(new ConfirmationQuestion(question, fallback));
  }

  choice(question, choices, fallback = null)
  {
    if (null !== fallback)
    {
      //this seems stupid, must be for working with assoc,
      //so will need to test.
      fallback = choices.indexOf(fallback);
    }

    return this.askQuestion(new ChoiceQuestion(question, choices, fallback));
  }

  progressStart(max = 0)
  {
    this.progressBar = this.createProgressBar(max);
    this.progressBar.start();
  }

  progressAdvance(step = 1)
  {
    this.getProgressBar().advance(step);
  }

  progressFinish()
  {
    this.getProgressBar().finish();
    this.newLine(2);
    this.progressBar = null;
  }

  createProgressBar(max = 0)
  {
    let progressBar = super.createProgressBar(max);

    if ('\\' !== DIRECTORY_SEPARATOR || 'Hyper' === getenv('TERM_PROGRAM')
  )
    {
      progressBar.setEmptyBarCharacter('░'); // light shade character \u2591
      progressBar.setProgressCharacter('');
      progressBar.setBarCharacter('▓'); // dark shade character \u2593
    }

    return progressBar;
  }

  async askQuestion(question)
  {
    if (this.input.isInteractive())
    {
      this.autoPrependBlock();
    }

    if (!this.questionHelper)
    {
      this.questionHelper = new SymfonyQuestionHelper();
    }

    let answer = await this.questionHelper.ask(this.input, this, question);

    if (this.input.isInteractive())
    {
      this.newLine();
      this.bufferedOutput.write("\n");
    }

    return answer;
  }

  writeln(messages, type = Output.OUTPUT_NORMAL)
  {
    if (!is_iterable(messages))
    {
      messages = [messages];
    }

    forEach(messages,  (message) =>
    {
      super.writeln(message, type);
      this.writeBuffer(message, true, type);
    });
  }

  write(messages, newline = false, type = Output.OUTPUT_NORMAL)
  {
    if (!is_iterable(messages))
    {
       messages = [messages];
    }

    forEach(messages,  (message) =>
    {
      super.write(message, newline, type);
      this.writeBuffer(message, newline, type);
    });
  }

  newLine(count = 1)
  {
    super.newLine(count);
    this.bufferedOutput.write("\n".repeat(count));
  }

  getErrorStyle()
  {
    return new this.constructor(this.input, this.getErrorOutput());
  }

  getProgressBar()
  {
    if (!this.progressBar)
    {
      throw new Error('The ProgressBar is not started.');
    }

    return this.progressBar;
  }

  autoPrependBlock()
  {
    let chars = substr(str_replace(PHP_EOL, "\n", this.bufferedOutput.fetch()), -2);

    if (!isset(chars[0]))
    {
      this.newLine(); //empty history, so we should start with a new line +
      return;
    }
    //Prepend new line for each non LF chars (This means no blank line was output before)
    this.newLine(2 - substr_count(chars, /\n/));
  }

  autoPrependText()
  {
    let fetched = this.bufferedOutput.fetch();
    //Prepend new line if last char isn't EOL:
    if ("\n" !== substr(fetched, -1))
    {
      this.newLine();
    }
  }

  writeBuffer(message, newLine, type)
  {
    // We need to know if the two last chars are PHP_EOL
    // Preserve the last 4 chars inserted (PHP_EOL on windows is two chars) in the history buffer
    this.bufferedOutput.write(substr(message, -4), newLine, type);
  }

  createBlock(messages, type = null, style = null, prefix = '', padding = false, escape = false)
  {
    let indentLength = 0;
    let prefixLength = Helper.strlenWithoutDecoration(this.getFormatter(), prefix);
    let lines = [];
    let lineIndentation;

    if (null !== type)
    {
      type = sprintf('[%s] ', type);
      indentLength = strlen(type);
      lineIndentation = ' '.repeat(indentLength);
    }

    // wrap and add newlines for each element
    forEach(messages,  (message, key) =>
    {
      if (escape)
      {
        message = OutputFormatter.escape(message);
      }
      
      lines = [...lines, ...wordwrap(message,this.lineLength - prefixLength - indentLength, PHP_EOL, true).split(PHP_EOL)];

      if (count(messages) > 1 && key < count(messages) - 1)
      {
        lines.push('');
      }
    });

    let firstLineIndex = 0;
    if (padding && this.isDecorated())
    {
      firstLineIndex = 1;
      array_unshift(lines, '');
      lines.push('');
    }

    forEach(lines, ( line, i) =>
    {

      if (null !== type)
      {
        lines[i] = firstLineIndex === i ? type + lines[i] : lineIndentation + lines[i];
      }

      lines[i] = prefix + lines[i];
      let count = this.lineLength - Helper.strlenWithoutDecoration(this.getFormatter(), lines[i]);
      if(count >= 0){
        lines[i] += ' '.repeat(count);
      }else{
        console.log('Limit Exceeded:');
        console.log(`  Decorated: "${lines[i]}"`);
        console.log(`Undecorated: "${Helper.removeDecoration(this.getFormatter(), lines[i])}"`);
        console.log(`LineLength: ${this.lineLength}`);
        console.log(`TextLength: ${Helper.strlenWithoutDecoration(this.getFormatter(), lines[i])}`);
      }

      if (style)
      {
        lines[i] = sprintf('<%s>%s</>', style, lines[i]);
      }
    }
  )
    ;

    return lines;
  }

}

module.exports = SymfonyStyle;
