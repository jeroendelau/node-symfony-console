const Application = require('../../src/Application');

const DescriptorCommand1 = require('./DescriptorCommand1');
const DescriptorCommand2 = require('./DescriptorCommand2');
const DescriptorCommand3 = require('./DescriptorCommand3');
const DescriptorCommand4 = require('./DescriptorCommand4');

class DescriptorApplication2 extends Application
{
  constructor()
  {
    super('My Symfony application', 'v1.0');
    this.add(new DescriptorCommand1());
    this.add(new DescriptorCommand2());
    this.add(new DescriptorCommand3());
    this.add(new DescriptorCommand4());
  }
}

module.exports = DescriptorApplication2;
