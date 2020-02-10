class TableRows {
  [Symbol.iterator]() {
    return this.generator();
  }

  constructor(generator) {
    this.generator = generator;
  }

}

module.exports = TableRows;
  