const {escapeshellarg, sprintf, trim, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');

const InputArgument = require('../input/InputArgument');
const InputDefinition = require('../input/InputDefinition');
const InputOption = require('../input/InputOption');

class Command {
  static get defaultName() {
    //return this.prototype.constructor.name;
    return null;
  }

  constructor(name = null) {
    this.application = null;
    this.name = name || this.constructor.getFallbackName() || null;
    this.processTitle = null;
    this.aliases = [];
    this.hidden = false;
    this.help = '';
    this.description = '';
    this._ignoreValidationErrors = false;
    this.applicationDefinitionMerged = false;
    this.applicationDefinitionMergedWithArgs = false;
    this.code = null;
    this.synopsis = [];
    this.usages = [];
    this.helperSet = null;

    this.definition = new InputDefinition();

    this.configure();
  }


  static getFallbackName() {
    //let class = \get_called_class();
    //r = new \ReflectionProperty(class, 'fallbackName');

    return this.defaultName || null;
  }

  ignoreValidationErrors() {
    this._ignoreValidationErrors = true;
  }

  setApplication(application = null) {
    this.application = application;
    if (application) {
      this.setHelperSet(application.getHelperSet());
    } else {
      this.helperSet = null;
    }
  }

  setHelperSet(helperSet) {
    this.helperSet = helperSet;
  }

  getHelperSet() {
    return this.helperSet;
  }

  getApplication() {
    return this.application;
  }

  isEnabled() {
    return true;
  }

  configure() {
  }

  /**
   * Executes the current command +
   *
   * This method is not abstract because you can use this class
   * as a concrete class +  In this case, instead of defining the
   * execute() method, you set the code to execute by passing
   * a Closure to the setCode() method +
   *
   * @return int 0 if everything went fine, or an exit code
   *
   * @throws Error When this abstract method is not implemented
   *
   * @see setCode()
   */
  execute(input, output) {
    throw new Error('You must override the execute() method in the concrete command class.');
  }

  async interact (input, output) {
  }

  /**
   * Initializes the command after the input has been bound and before the input
   * is validated +
   *
   * This is mainly useful when a lot of commands extends one main command
   * where some things need to be initialized based on the input arguments and options +
   *
   * @see InputInterface.bind()
   * @see InputInterface.validate()
   */
  initialize(InputInterface, input, output) {

  }

  async run(input, output) {
    // force the creation of the synopsis before the merge with the app definition
    this.getSynopsis(true);
    this.getSynopsis(false);

    // add the application arguments and options
    this.mergeApplicationDefinition();

    // bind the input against the command specific arguments/options
    try {
      input.bind(this.definition);
    } catch (e) {
      if (!this._ignoreValidationErrors) {
        throw e;
      }
    }

    this.initialize(input, output);

    if (null !== this.processTitle) {
      process.title = this.processTitle;
    }

    if (input.isInteractive()) {
      await this.interact(input, output);
    }

    // The command name argument is often omitted when a command is executed directly with its run() method +
    // It would fail the validation if we didn't make sure the command argument is present,
    // since it's required by the application +
    if (input.hasArgument('command') && null === input.getArgument('command')) {
      input.setArgument('command', this.getName());
    }

    input.validate();
    let statusCode = null;

    if (this.code) {
      statusCode = await (this.code)(input, output);
    } else {
      statusCode = await this.execute(input, output);
      if (!is_int(statusCode)) {
        throw new Error(sprintf('Return value of "%s.execute()" must be of the type int, %s returned.', this.constructor.name, typeof statusCode));
      }
    }

    return is_int(statusCode) ? statusCode : 0;
  }

  setCode(code) {

    // ES6
    const isBindable = func => func.hasOwnProperty('prototype');

    if (code.bind) {
      code.bind(this);
    }
    this.code = code;

    return this;
  }

  mergeApplicationDefinition(mergeArgs = true) {
    if (null === this.application || (true === this.applicationDefinitionMerged && (this.applicationDefinitionMergedWithArgs || !mergeArgs))) {
      return;
    }

    this.definition.addOptions(this.application.getDefinition().getOptions());

    this.applicationDefinitionMerged = true;

    if (mergeArgs) {
      let currentArguments = this.definition.getArguments();
      this.definition.setArguments(this.application.getDefinition().getArguments());
      this.definition.addArguments(currentArguments);

      this.applicationDefinitionMergedWithArgs = true;
    }
  }

  setDefinition(definition) {
    if (definition instanceof InputDefinition) {
      this.definition = definition;
    } else {
      this.definition.setDefinition(definition);
    }

    this.applicationDefinitionMerged = false;

    return this;
  }

  getDefinition() {
    if (null === this.definition) {
      throw new Error(sprintf('Command class "%s" is not correctly initialized.  You probably forgot to call the super constructor.', this.prototype.constructor.name));
    }

    return this.definition;
  }

  getNativeDefinition() {
    return this.getDefinition();
  }

  addArgument(name, mode = null, description = '', fallback = null) {
    this.definition.addArgument(new InputArgument(name, mode, description, fallback));

    return this;
  }

  addOption(name, shortcut = null, mode = null, description = '', fallback = null) {
    this.definition.addOption(new InputOption(name, shortcut, mode, description, fallback));

    return this;
  }

  setName(name) {
    this.validateName(name);

    this.name = name;

    return this;
  }

  setProcessTitle(title) {
    this.processTitle = title;

    return this;
  }

  getName() {
    return this.name;
  }

  setHidden(hidden) {
    this.hidden = hidden;

    return this;
  }

  isHidden() {
    return this.hidden;
  }

  setDescription(description) {
    this.description = description;

    return this;
  }

  getDescription() {
    return this.description;
  }

  setHelp(help) {
    this.help = help;

    return this;
  }

  getHelp() {
    return this.help;
  }

  getProcessedHelp() {
    let name = this.name;
    let isSingleCommand = this.application && this.application.isSingleCommand();
    let scriptPath = process.argv[1].replace(process.cwd() + "/", "");

    // allow to override this path
    // for global commands
    if(this.getApplication().command){
      scriptPath = this.getApplication().command
    }

    let placeholders = [
      '%command.name%',
      '%command.full_name%',
    ];
    let replacements = [
      name,
      isSingleCommand ? scriptPath : scriptPath + ' ' + name,
    ];

    return str_replace(placeholders, replacements, this.getHelp() || this.getDescription());
  }

  setAliases(aliases) {
    forEach(aliases, (alias) => {
      this.validateName(alias);
    });

    this.aliases = aliases;

    return this;
  }

  getAliases() {
    return this.aliases;
  }

  getSynopsis(short = false) {
    let key = short ? 'short' : 'long';

    if (!isset(this.synopsis[key])) {
      this.synopsis[key] = trim(sprintf('%s %s', this.name, this.definition.getSynopsis(short)));
    }

    return this.synopsis[key];
  }

  addUsage(usage) {
    if (0 !== strpos(usage, this.name)) {
      usage = sprintf('%s %s', this.name, usage);
    }

    this.usages.push(usage);

    return this;
  }

  getUsages() {
    return this.usages;
  }

  getHelper(name) {
    if (null === this.helperSet) {
      throw new Error(sprintf('Cannot retrieve helper "%s" because there is no HelperSet defined. Did you forget to add your command to the application or to set the application on the command using the setApplication() method? You can also set the HelperSet directly using the setHelperSet() method.', name));
    }

    return this.helperSet.get(name);
  }

  validateName(name) {
    if (!name || !name.match(/^[^\:]+(\:[^\:]+)*$/)) {
      throw new Error(sprintf('Command name "%s" is invalid.', name));
    }
  }
}

module.exports = Command;
