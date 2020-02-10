Node Symfony Console
====================
This is a straight port of Symfony's [Console Component](https://symfony.com/doc/master/components/console.html) v5.1.
Augmented with the spinner functionality largely inspired by [alecrabbit/php-console-spinner](https://github.com/alecrabbit/php-console-spinner)   

**Although fully functional, this is very much WIP.**

Usage
---------
Eventually we will write ported documentation. For now follow 
[Console Component](https://symfony.com/doc/master/components/console.html) v5.1 documentation and translate
the examples to JS.

```javascript
 // Most used classes are accessible as direct imports
const {
 Terminal,
 Application,
 SingleCommandApplication,
 Command,
 Question,
 ConfirmationQuestion,
 ChoiceQuestion,
 ProgressBar,
 ProgressIndicator,
 Table,
 TableStyle,
 Output,
 Input,
 InputArgument,
 InputOption,
 Spinner,
 SpinnerFrames} = require('node-symfony-console');
```

```javascript
// All of the underlying classes can be accessed throught the console export. Follow the
// original PhP namespace class paths.

const { console }    = require('node-symfony-console');

// PHP Class \Symfony\Component\Console\Helper\HelperSet
const HelperSet      = console.helper.HelperSet;     

// PHP Class \Symfony\Component\Console\Tester\CommandTester
const CommmandTester = console.tester.CommandTester; 
```

Hello World Example
------------
Create a command
```javascript
const { Command, InputArgument, ConfirmationQuestion } = require('node-symfony-console');

class GreetCommand extends Command {
  static get defaultName() {
    return 'foo:helloworld';
  }

  configure() {
    this
      // the short description shown while running "node bin/console list"
      .setDescription(`Print hello world`)
      // the full command description shown when running the command with
      // the "--help" option
      .setHelp('Print hello world, pass argument')
      .addArgument('name', InputArgument.REQUIRED, 'Who do you want to greet?')
      .addArgument('last_name', InputArgument.OPTIONAL, 'Your last name?');
  }

  async execute(input, output) {
  
      // Do something asynchronous like an API call or 
      // asking a question
      const q = new ConfirmationQuestion('<info>Are you leaving</info> (y/n): ');
      const leaving = await this.getHelper('question').ask( input, output, q);
      
      let greet = `${leaving?'Good Bye':'Hi'} ${input.getArgument('name')}`;
      const lastName = input.getArgument('last_name');
      
      if (lastName) {
        greet = `${greet} ${lastName}`;
      }
  
      output.writeln(`${greet}!`);
      return 1;
    }
}

module.exports = GreetCommand;
```

Create a application and include the command. This can be any file IE: `bin/console.js`
```javascript
const {Application} = require('node-symfony-console');
const GreetCommand = require('./GreetCommand');

const application = new Application();
application.add(new GreetCommand());
application.run();
```

Run the command:
```shell script
$ node bin/console.js
Console Tool

Usage:
  command [options] [arguments]

Options:
  -h, --help            Display this help message
  -q, --quiet           Do not output any message
  -V, --version         Display this application version
      --ansi            Force ANSI output
      --no-ansi         Disable ANSI output
  -n, --no-interaction  Do not ask any interactive question
  -v|vv|vvv, --verbose  Increase the verbosity of messages: 1 for normal output, 2 for more verbose output and 3 for debug

Available commands:
  help            Displays help for a command
  list            Lists commands
 foo
  foo:helloworld  Print hello world

$ node bin/console.js foo:helloworld Jeroen
Are you leaving (y/n): n
Hi jeroen!

$ node bin/console.js foo:helloworld Jeroen "de Lau"
Are you leaving (y/n): y
Good Bye Jeroen de Lau!
```
 
Known omissions and limitations
---------------------------------
Porting changes:
- _Interfaces_ have been removed
- _Abstract_ classes have been converted to regular classes
- PhP associative arrays do not always translate well to JS {} or []
- Itterable support is spotty, WIP 
- Node requires not separate multibyte support for most situations, in general these functions
were stripped
- Terminal Capability detection was quite specific to PhP, tested on Mac, on other terminals millage
may vary
- Exception classes have been renamed to Error 
- Not all Exceptions types have been ported, instead using generic throw Error
- Verbosity constants can be found in Output `const {Output} = require('node-symfony-console')`

Omissions:
Following have not (yet) been ported
- [Events](https://symfony.com/doc/master/components/console/events.html)
- [Logger](https://symfony.com/doc/master/components/console/logger.html)
- [Lazy Loading](https://symfony.com/doc/master/console/lazy_commands.html)
- [List command does not support format](https://symfony.com/doc/master/console/lazy_commands.html)
 
Contributing
---------
Contributions are welcome! Most of the tests have been written in JS.


Resources
---------

  * [Original Documentation (php)](https://symfony.com/doc/current/components/console.html)


Credits
-------
This library is converted from Symfony's Console Component:
Find sources and license at https://github.com/symfony/component

This library uses code from the spinner library
Find sources and license at https://github.com/alecrabbit/php-console-spinner