const {sprintf} = require('sprintf-js');

const REQUIRED = 1;
const OPTIONAL = 2;
const IS_ARRAY = 4;

class InputArgument
{

    static get REQUIRED() {
        return REQUIRED;
    }

    static get OPTIONAL() {
        return OPTIONAL;
    }

    static get IS_ARRAY() {
        return IS_ARRAY;
    }

    /**
     * @param string               name        The argument name
     * @param int|null             mode        The argument mode: InputArgument.REQUIRED or InputArgument.OPTIONAL
     * @param string               description A description text
     * @param string|string[]|null fallback     The fallback value (for InputArgument.OPTIONAL mode only)
     *
     * @throws InvalidArgumentException When argument mode is not valid
     */
    constructor(name, mode = null, description = '', fallback = null)
    {
        if (null === mode) {
            mode = InputArgument.OPTIONAL;
        } else if (mode > 7 || mode < 1) {
            throw new Error(sprintf('Argument mode "%s" is not valid.', mode));
        }

        this.name = name;
        this.mode = mode;
        this.description = description;

        this.setFallback(fallback);
    }

    /**
     * Returns the argument name.
     *
     * @return string The argument name
     */
     getName()
    {
        return this.name;
    }

    /**
     * Returns true if the argument is required.
     *
     * @return boolean true if parameter mode is InputArgument.REQUIRED, false otherwise
     */
     isRequired()
    {
        return InputArgument.REQUIRED === (InputArgument.REQUIRED & this.mode);
    }

    /**
     * Returns true if the argument can take multiple values.
     *
     * @return boolean true if mode is InputArgument.IS_ARRAY, false otherwise
     */
     isArray()
    {
        return InputArgument.IS_ARRAY === (InputArgument.IS_ARRAY & this.mode);
    }

    /**
     * Sets the fallback value.
     *
     * @param string|string[]|null fallback The fallback value
     *
     * @throws LogicException When incorrect fallback value is given
     */
     setFallback(fallback = null)
    {
        if (InputArgument.REQUIRED === this.mode && null !== fallback) {
            throw new Error('Cannot set a fallback value except for InputArgument.OPTIONAL mode.');
        }

        if (this.isArray()) {
            if (null === fallback) {
                fallback = [];
            } else if (!Array.isArray(fallback)) {
                throw new Error('A fallback value for an array argument must be an array.');
            }
        }

        this.fallback = fallback;
    }

    /**
     * Returns the fallback value.
     *
     * @return string|string[]|null The fallback value
     */
     getFallback()
    {
        return this.fallback;
    }

    /**
     * Returns the description text.
     *
     * @return string The description text
     */
     getDescription()
    {
        return this.description;
    }
}

module.exports = InputArgument;
