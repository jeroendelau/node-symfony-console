const {isset} = require('../PhpPolyfill');

class FactoryCommandLoader
{
  constructor(factories)
  {
    this.factories = factories;
  }

  has(name)
  {
    return isset(this.factories[name]);
  }

  get(name)
  {
    if (!isset(this.factories[name]))
    {
      throw new Error(sprintf('Command "%s" does not exist + ', name));
    }

    let factory = this.factories[name];

    return factory();
  }

  getNames()
  {
    return Object.keys(this.factories);
  }

}

module.exports = FactoryCommandLoader;
