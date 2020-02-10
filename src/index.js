module.exports.Terminal = require('./Terminal');
module.exports.Application = require('./Application');
module.exports.SingleCommandApplication = require('./SingleCommandApplication');
module.exports.Command = require('./command/Command');
module.exports.Question = require('./question/Question');
module.exports.ConfirmationQuestion = require('./question/ConfirmationQuestion');
module.exports.ChoiceQuestion = require('./question/ChoiceQuestion');
module.exports.ProgressBar = require('./helper/ProgressBar');
module.exports.ProgressIndicator = require('./helper/ProgressIndicator');
module.exports.Table = require('./helper/Table');
module.exports.TableStyle = require('./helper/TableStyle');
module.exports.Output = require('./output/Output');
module.exports.Input = require('./input/Input');
module.exports.InputArgument = require('./input/InputArgument');
module.exports.InputOption = require('./input/InputOption');
module.exports.Spinner = require('./helper/Spinner');
module.exports.SpinnerFrames = require('./helper/SpinnerFrames');

module.exports.console = {
  Terminal: require('./Terminal'),
  Application: require('./Application'),
  SingleCommandApplication: require('./SingleCommandApplication'),
  command: require('./command'),
  commandloader: require('./commandloader'),
  descriptor: require('./descriptor'),
  error: require('./error'),
  // event: require('./event'),
  formatter: require('./formatter'),
  helper: require("./helper"),
  input: require('./input'),
  // logger: require("./logger"),
  output: require('./output'),
  question: require('./question'),
  style: require('./style'),
  tester: require('./tester')
}
