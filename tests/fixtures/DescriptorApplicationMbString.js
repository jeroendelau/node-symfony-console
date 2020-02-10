const Application = require('../../src/Application');

class DescriptorApplicationMbString extends Application
{
  constructor()
  {
    super('MbString åpplicätion');
    this.add(new DescriptorCommandMbString());
  }
}

module.exports = DescriptorApplicationMbString;
