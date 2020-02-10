const ansiRegexSource = require('ansi-regex');
const ansiRegex = new RegExp('^(' + ansiRegexSource().source + ")([\\w\\W]*)");

function twoDArr(x, y) {
  var arr = new Array(x);

  for (var i = 0; i < y; i++) {
    arr[i] = new Array(x);

    for (var j = 0; j < x; j++) {
      arr[i][j] = '';
    }
  }

  return arr;
}

module.exports = class stdoutMock {

  constructor(opts = {}) {
    this._cursor;
    this._consoleOutput;
    this._rawInput;

    this._isTTY = opts.isTTY || process.stdout.isTTY;
    this._rows = opts.rows || 200;
    this._columns = opts.columns || 200
    this._colorDepth = opts.colorDepth || null;

    this.reset();
  }

  get columns() {
    this.windowSize.width;
  }

  get rows() {
    this.windowSize.height;
  }

  get isTTY() {
    return this._isTTY;
  }

  getWindowSize() {
    return [this._columns][this._rows];
  }

  getColorDepth(env) {
    return this._colorDepth || process.stdout.getColorDepth(env);
  }

  hasColors(count, env) {
    return this.getColorDepth(env) >= count;

  }

  write(str) {
    // console.log(ansiRegex());
    //console.log(str.match(ansiRegex));
    this._rawInput += str;
    
    while (str.length > 0) {
      const match = str.match(ansiRegex);
      if (match) {
        const char = str.substring(0, 1);
        const txt = match[1];
        this._handleCodes(txt);
        str = match[2];
      } else {
        const char = str.substring(0, 1);
        str = str.substring(1);
        if (char === '\n') {
          this._cursor.y++;
          this._cursor.x = 0;
        } else {
          this._consoleOutput.setChar(char);
          this._cursor.x++;
        }
      }
    }
  }

  _handleCodes(code) {
    const match = code.match(/\[([0-9]*)(;([0-9]*))?([A-Z])/);
    // console.log(match);
    if (match) {
      const n = match[1];
      const m = match[4];
      const action = match[4];

      switch (action) {
        case "A": // Up
          this.moveCursor(0, 0 - n);
          break;
        case "B": // Down
          this.moveCursor(0, n);
          break;
        case "C": // Right
          this.moveCursor(n, 0);
          break;
        case "D": // Left
          this.moveCursor(0 - n, 0);
          break;
        case "E": // Next Line
          this.moveCursor(0, n);
          this.cursorTo(0);
          break;
        case "F": // Prev Line
          this.moveCursor(0, 0 - n);
          this.cursorTo(0);
          break;
        case "G": // Set Column
          this.cursorTo(n);
          break;
        case "H": // Set position Line
          this.cursorTo(m, n);
          break;
        case "J":
          this._clearScreen(n);
          break;
        case "K":
          this.clearLine(n - 1);
          break;
      }
    }


    return code;
  }

  /**
   * writeStream._cursorTo() moves this WriteStream's _cursor to the specified position.
   *
   * @param x
   * @param y
   * @param callback Invoked once the operation completes.
   * @returns {boolean}
   */
  cursorTo(x, y, callback) {
    this._cursor.x = x;
    this._cursor.y = y;

    if (callback) {
      setTimeout(() => callback(), 1);
    }
    return true;
  }

  /**
   * writeStream.moveCursor() moves this WriteStream's _cursor relative to its current position.
   *
   * @param dx
   * @param dy
   * @param callback Invoked once the operation completes.
   * @returns {boolean}
   */
  moveCursor(dx, dy, callback) {
    var targetX = this._cursor.x + dx,
      targetY = this._cursor.y + dy;

    if (targetY < 0) {
      this._cursor.y = 0;
    } else if (targetY > this._rows - 1) {
      this._cursor.y = this._rows - 1;
    } else {
      this._cursor.y = targetY;
    }

    if (targetX < 0) {
      this._cursor.x = 0;
    } else if (targetX > this._columns) {
      this._cursor.x = this._columns.x - 1;
    } else {
      this._cursor.x = targetX;
    }

    if (callback) {
      setTimeout(() => callback(), 1);
    }
    return true;
  }

  clearLine(dir, callback) {
    // console.log(dir);
    switch (String(dir)) {
      case "-1":
        for (let i = this._cursor.x; i < this._columns; i++) {
          this._consoleOutput.setChar('', i, this._cursor.y);
        }
        break;
      case  "0":
        for (let i = this._cursor.x; i >= 0; i--) {
          this._consoleOutput.setChar(' ', i, this._cursor.y);
        }
        break;
      case  "1":
        for (let i = 0; i < this._cursor.x; i++) {
          this._consoleOutput.setChar('', i, this._cursor.y);
        }
        for (let i = this._cursor.x; i >= 0; i--) {
          this._consoleOutput.setChar(' ', i, this._cursor.y);
        }
        break;
    }

    if (callback) {
      setTimeout(() => callback(), 1);
    }
    return true;
  }

  _clearScreen(dir) {
    switch (String(dir)) {
      case "0":
        this.clearScreenDown();
        break;
      case  "1":
        process.stdout.write("\[m1J (clearScreenUp) not supported");
        break;
      case  "2":
        process.stdout.write("\[m1J (clearScreen) not supported");
        break;
    }
  }

  clearScreenDown(callback) {
    for (let i = this._cursor.x; i < this._columns; i++) {
      this._consoleOutput.setChar('', i, this._cursor.y);
    }

    for (let i = this._cursor.y + 1; i < this._rows; i++) {
      this._consoleOutput[i] = new Array(this._columns);

      for (let j = 0; j < this._columns; j++) {
        this._consoleOutput.setChar('', j, i);
      }
    }

    if (callback) {
      setTimeout(() => callback(), 1);
    }
    return true;
  }

  reset() {
    this._cursor = {x: 0, y: 0};
    this._consoleOutput = twoDArr(this._columns, this._rows);
    this._consoleOutput.setChar = (ch, x, y) => {
      x = x === undefined || x === null ? this._cursor.x : x;
      y = y === undefined || y === null ? this._cursor.y : y;
      // console.log(x,y, ch);
      this._consoleOutput[y][x] = ch;
    };
    this._consoleOutput.getChar = (x, y) => {
      return this._consoleOutput[x || this._cursor.y][y || this._cursor.x];
    };
    
    this._rawInput = '';
  }

  get rawInput(){
    return this._rawInput;
  }
  
  toString() {
    var str = '',
      line;

    for (var i = 0; i < this._consoleOutput.length; i++) {
      line = this._consoleOutput[i].join('');
      if (line !== '') {
        str += this._consoleOutput[i].join('');
        str += "\n";
      }
    }

    return str;
  }
}
