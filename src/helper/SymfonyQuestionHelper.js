const {escapeshellarg, trim, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const OutputFormatter = require('../formatter/OutputFormatter');
const ChoiceQuestion = require('../question/ChoiceQuestion');
const ConfirmationQuestion = require('../question/ConfirmationQuestion');
const Question = require('../question/Question');

const QuestionHelper = require('./QuestionHelper');

class SymfonyQuestionHelper extends QuestionHelper
{
  createPrompt(output, question) {
    let text = OutputFormatter.escapeTrailingBackslash(question.getQuestion());
    let fallback = question.getFallback();
    let choices;

    switch (true)
    {
      case null === fallback:
        text = sprintf(' <info>%s</info>:', text);

        break;

      case question instanceof ConfirmationQuestion:
        text = sprintf(' <info>%s (yes/no)</info> [<comment>%s</comment>]:', text, fallback ? 'yes' : 'no');

        break;

      case question instanceof ChoiceQuestion && question.isMultiselect():
        choices = question.getChoices();
        fallback = fallback.split(',');

        forEach(fallback, function (value, key)
        {
          fallback[key] = choices[trim(value)];
        });

        text = sprintf(' <info>%s</info> [<comment>%s</comment>]:', text, OutputFormatter.escape(implode(', ', fallback)));

        break;

      case question instanceof ChoiceQuestion:
        choices = question.getChoices();
        text = sprintf(' <info>%s</info> [<comment>%s</comment>]:', text, OutputFormatter.escape(isset(choices[fallback]) ? choices[fallback] : fallback));

        break;

      default:
        text = sprintf(' <info>%s</info> [<comment>%s</comment>]:', text, OutputFormatter.escape(fallback));
    }

    text = output.format(text).join("\n") + "\n";

    let prompt = ' > ';

    if (question instanceof ChoiceQuestion)
    {
      text += output.format(this.formatChoiceQuestionChoices(question, 'comment')).join("\n") + "\n";

      prompt = question.getPrompt();
    }

    return text + prompt;
  }
  
  writePrompt(output, question)
  {
    //output.write(prompt);
    output.write(this.createPrompt(output, question));
  }

  writeError(output, error)
  {
    //Moved down to prevent circular loading
    const SymfonyStyle = require('../style/SymfonyStyle');

    if (output instanceof SymfonyStyle)
    {
      output.newLine();
      output.error(error.getMessage());

      return;
    }

    super.writeError(output, error);
  }

}

module.exports = SymfonyQuestionHelper;
