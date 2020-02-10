const mocha = require('mocha');
const chai = require('chai');
const {assert} = chai;
const forEach = require('mocha-each');
const ldForEach = require('lodash/forEach');
const stdoutMock = require('../stdOutMock');

const {PHP_EOL, STR_PAD_BOTH, STR_PAD_RIGHT, STR_PAD_LEFT} = require('../../src/PhpPolyfill');

var thisstream;

const OutputFormatter = require('../../src/formatter/OutputFormatter');
const Table = require('../../src/helper/Table');
const TableCell = require('../../src/helper/TableCell');
const TableSeparator = require('../../src/helper/TableSeparator');
const TableStyle = require('../../src/helper/TableStyle');
const ConsoleSectionOutput = require('../../src/output/ConsoleSectionOutput');
const StreamOutput = require('../../src/output/StreamOutput');

describe('#Table', () => {

  forEach(renderProvider()).
  it('testRender %s', (msg, headers = [], rows = [], style = 'fallback', expected = '', decorated = false) => {
    const output = getOutputStream(decorated);
    let table = new Table(output);

    table
      .setHeaders(headers)
      .setRows(rows)
      .setStyle(style)
    ;
    table.render();

    assert.deepEqual(getOutputContent(output), expected);
  });

  forEach(renderProvider()).
  it('testRenderAddRowsOneByOne %s', (msg, headers = [], rows = [], style = 'fallback', expected = '', decorated = false) => 
  {
    let table = new Table(output = getOutputStream(decorated));
    table
      .setHeaders(headers)
      .setStyle(style)
    ;
    ldForEach(rows,  (row) => {
      table.addRow(row);
    });
    table.render();

    assert.deepEqual(getOutputContent(output), expected);
  });

  it('testRenderMultiByte', () => {
    let table = new Table(output = getOutputStream(false));
    table
      .setHeaders(['■■'])
      .setRows([[1234]])
      .setStyle('fallback')
    ;
    table.render();

    const expected =
      `+------+
| ■■   |
+------+
| 1234 |
+------+
`;

    assert.deepEqual(expected, getOutputContent(output));
  });

  it('testTableCellWithNumericIntValue', () => {
    let table = new Table(output = getOutputStream(false));

    table.setRows([[new TableCell(12345)]]);
    table.render();

    const expected =
      `+-------+
| 12345 |
+-------+
`;

    assert.deepEqual(expected, getOutputContent(output));
  });

  it('testTableCellWithNumericFloatValue', () => {
    let table = new Table(output = getOutputStream());

    table.setRows([[new TableCell(12345.01)]]);
    table.render();

    const expected =
      `+----------+
| 12345.01 |
+----------+
`;

    assert.deepEqual(expected, getOutputContent(output));
  });

  it('testStyle', () => {
    let style = new TableStyle();
    style
      .setHorizontalBorderChars('.')
      .setVerticalBorderChars('.')
      .setFallbackCrossingChar('.')
    ;

    Table.setStyleDefinition('dotfull', style);
    let table = new Table(output = getOutputStream(false));
    table
      .setHeaders(['Foo'])
      .setRows([['Bar']])
      .setStyle('dotfull');
    table.render();

    const expected =
      `.......
. Foo .
.......
. Bar .
.......
`;

    assert.deepEqual(expected, getOutputContent(output));
  });

  it('testRowSeparator', () => {
    let table = new Table(output = getOutputStream(false));
    table
      .setHeaders(['Foo'])
      .setRows([
        ['Bar1'],
        new TableSeparator(),
        ['Bar2'],
        new TableSeparator(),
        ['Bar3'],
      ]);
    table.render();

    const expected =
      `+------+
| Foo  |
+------+
| Bar1 |
+------+
| Bar2 |
+------+
| Bar3 |
+------+
`;

    assert.deepEqual(expected, getOutputContent(output));

    assert.deepEqual(table, table.addRow(new TableSeparator()), 'fluent interface on addRow() with a single TableSeparator() works');
  });

  it('testRenderMultiCalls', () => {
    let table = new Table(output = getOutputStream());
    table.setRows([
      [new TableCell('foo', {'colspan': 2})],
    ]);
    table.render();
    table.render();
    table.render();

    const expected =
      `+----+---+
| foo    |
+----+---+
+----+---+
| foo    |
+----+---+
+----+---+
| foo    |
+----+---+
`;

    assert.deepEqual(expected, getOutputContent(output));
  });

  it('testColumnStyle', () => {
    let table = new Table(output = getOutputStream());
    table
      .setHeaders(['ISBN', 'Title', 'Author', 'Price'])
      .setRows([
        ['99921-58-10-7', 'Divine Comedy', 'Dante Alighieri', '9.95'],
        ['9971-5-0210-0', 'A Tale of Two Cities', 'Charles Dickens', '139.25'],
      ]);

    let style = new TableStyle();
    style.setPadType(STR_PAD_LEFT);
    table.setColumnStyle(3, style);

    table.render();

    const expected =
      `+---------------+----------------------+-----------------+--------+
| ISBN          | Title                | Author          |  Price |
+---------------+----------------------+-----------------+--------+
| 99921-58-10-7 | Divine Comedy        | Dante Alighieri |   9.95 |
| 9971-5-0210-0 | A Tale of Two Cities | Charles Dickens | 139.25 |
+---------------+----------------------+-----------------+--------+
`;

    assert.deepEqual(expected, getOutputContent(output));
  });

  /**
   // Node will parse many more object to string
   
  it('testThrowsWhenTheCellInAnArray', () => {

    assert.throws(() => {
      let output = getOutputStream();
      let table = new Table(output);
      table
        .setHeaders(['ISBN', 'Title', 'Author', 'Price'])
        .setRows([
          ['99921-58-10-7', [], 'Dante Alighieri', '9.95'],
        ]);
      table.render();
    }, 'A cell must be a TableCell, a scalar or an object implementing __toString, array given.');

  });
   */

  it('testColumnWidth', () => {
    let table = new Table(output = getOutputStream());
    table
      .setHeaders(['ISBN', 'Title', 'Author', 'Price'])
      .setRows([
        ['99921-58-10-7', 'Divine Comedy', 'Dante Alighieri', '9.95'],
        ['9971-5-0210-0', 'A Tale of Two Cities', 'Charles Dickens', '139.25'],
      ])
      .setColumnWidth(0, 15)
      .setColumnWidth(3, 10);

    let style = new TableStyle();
    style.setPadType(STR_PAD_LEFT);
    table.setColumnStyle(3, style);

    table.render();

    const expected =
      `+-----------------+----------------------+-----------------+------------+
| ISBN            | Title                | Author          |      Price |
+-----------------+----------------------+-----------------+------------+
| 99921-58-10-7   | Divine Comedy        | Dante Alighieri |       9.95 |
| 9971-5-0210-0   | A Tale of Two Cities | Charles Dickens |     139.25 |
+-----------------+----------------------+-----------------+------------+
`;

    assert.deepEqual(expected, getOutputContent(output));
  });

  it('testColumnWidths', () => {
    let table = new Table(output = getOutputStream());
    table
      .setHeaders(['ISBN', 'Title', 'Author', 'Price'])
      .setRows([
        ['99921-58-10-7', 'Divine Comedy', 'Dante Alighieri', '9.95'],
        ['9971-5-0210-0', 'A Tale of Two Cities', 'Charles Dickens', '139.25'],
      ])
      .setColumnWidths([15, 0, -1, 10]);

    let style = new TableStyle();
    style.setPadType(STR_PAD_LEFT);
    table.setColumnStyle(3, style);

    table.render();

    const expected =
      `+-----------------+----------------------+-----------------+------------+
| ISBN            | Title                | Author          |      Price |
+-----------------+----------------------+-----------------+------------+
| 99921-58-10-7   | Divine Comedy        | Dante Alighieri |       9.95 |
| 9971-5-0210-0   | A Tale of Two Cities | Charles Dickens |     139.25 |
+-----------------+----------------------+-----------------+------------+
`;

    assert.deepEqual(expected, getOutputContent(output));
  });

  it('testSectionOutput', () => {
    let sections = [];
    stream = getOutputStream(true);
    let output = new ConsoleSectionOutput(stream.getStream(), sections, stream.getVerbosity(), stream.isDecorated(), new OutputFormatter());
    table = new Table(output);
    table
      .setHeaders(['ISBN', 'Title', 'Author', 'Price'])
      .setRows([
        ['99921-58-10-7', 'Divine Comedy', 'Dante Alighieri', '9.95'],
      ]);

    table.render();

    table.appendRow(['9971-5-0210-0', 'A Tale of Two Cities', 'Charles Dickens', '139.25']);

    const expected =
      `+---------------+---------------+-----------------+-------+
|\x1B[32m ISBN          \x1B[39m|\x1B[32m Title         \x1B[39m|\x1B[32m Author          \x1B[39m|\x1B[32m Price \x1B[39m|
+---------------+---------------+-----------------+-------+
| 99921-58-10-7 | Divine Comedy | Dante Alighieri | 9.95  |
+---------------+---------------+-----------------+-------+
\x1b[5A\x1b[0J+---------------+----------------------+-----------------+--------+
|\x1B[32m ISBN          \x1B[39m|\x1B[32m Title                \x1B[39m|\x1B[32m Author          \x1B[39m|\x1B[32m Price  \x1B[39m|
+---------------+----------------------+-----------------+--------+
| 99921-58-10-7 | Divine Comedy        | Dante Alighieri | 9.95   |
| 9971-5-0210-0 | A Tale of Two Cities | Charles Dickens | 139.25 |
+---------------+----------------------+-----------------+--------+
`;

    assert.deepEqual(expected, getOutputContent(output));
  });

  it('testSectionOutputDoesntClearIfTableIsntRendered', () => {
    let sections = [];
    stream = getOutputStream(true);
    let output = new ConsoleSectionOutput(stream.getStream(), sections, stream.getVerbosity(), stream.isDecorated(), new OutputFormatter());
    table = new Table(output);
    table
      .setHeaders(['ISBN', 'Title', 'Author', 'Price'])
      .setRows([
        ['99921-58-10-7', 'Divine Comedy', 'Dante Alighieri', '9.95'],
      ]);

    table.appendRow(['9971-5-0210-0', 'A Tale of Two Cities', 'Charles Dickens', '139.25']);

    const expected =
      `+---------------+----------------------+-----------------+--------+
|\x1B[32m ISBN          \x1B[39m|\x1B[32m Title                \x1B[39m|\x1B[32m Author          \x1B[39m|\x1B[32m Price  \x1B[39m|
+---------------+----------------------+-----------------+--------+
| 99921-58-10-7 | Divine Comedy        | Dante Alighieri | 9.95   |
| 9971-5-0210-0 | A Tale of Two Cities | Charles Dickens | 139.25 |
+---------------+----------------------+-----------------+--------+
`;

    assert.deepEqual(expected, getOutputContent(output));
  });

  it('testSectionOutputWithoutDecoration', () => {
    let sections = [];
    stream = getOutputStream();
    let output = new ConsoleSectionOutput(stream.getStream(), sections, stream.getVerbosity(), stream.isDecorated(), new OutputFormatter());
    table = new Table(output);
    table
      .setHeaders(['ISBN', 'Title', 'Author', 'Price'])
      .setRows([
        ['99921-58-10-7', 'Divine Comedy', 'Dante Alighieri', '9.95'],
      ]);

    table.render();

    table.appendRow(['9971-5-0210-0', 'A Tale of Two Cities', 'Charles Dickens', '139.25']);

    const expected =
      `+---------------+---------------+-----------------+-------+
| ISBN          | Title         | Author          | Price |
+---------------+---------------+-----------------+-------+
| 99921-58-10-7 | Divine Comedy | Dante Alighieri | 9.95  |
+---------------+---------------+-----------------+-------+
+---------------+----------------------+-----------------+--------+
| ISBN          | Title                | Author          | Price  |
+---------------+----------------------+-----------------+--------+
| 99921-58-10-7 | Divine Comedy        | Dante Alighieri | 9.95   |
| 9971-5-0210-0 | A Tale of Two Cities | Charles Dickens | 139.25 |
+---------------+----------------------+-----------------+--------+
`;

    assert.deepEqual(expected, getOutputContent(output));
  });

  it('testAppendRowWithoutSectionOutput', () => {

    assert.throws(() => {
      let table = new Table(getOutputStream());
      table.appendRow(['9971-5-0210-0', 'A Tale of Two Cities', 'Charles Dickens', '139.25']);
    }, 'Output should be an instance of "ConsoleSectionOutput" when calling "appendRow".');

  });

  it('testIsNotDefinedStyleException', () => {

    assert.throws(() => {
      let table = new Table(getOutputStream());
      table.setStyle('absent');
    }, 'Style "absent" is not defined.');

  });

  it('testGetStyleDefinition', () => {

    assert.throws(() => {
      Table.getStyleDefinition('absent');
    }, 'Style "absent" is not defined.');

  });

  forEach(renderSetTitle()).
  it('testSetTitle %s %s', (headerTitle, footerTitle, style, expected) => {
    (new Table(output = getOutputStream()))
      .setHeaderTitle(headerTitle)
      .setFooterTitle(footerTitle)
      .setHeaders(['ISBN', 'Title', 'Author'])
      .setRows([
        ['99921-58-10-7', 'Divine Comedy', 'Dante Alighieri'],
        ['9971-5-0210-0', 'A Tale of Two Cities', 'Charles Dickens'],
        ['960-425-059-0', 'The Lord of the Rings', 'J. R. R. Tolkien'],
        ['80-902734-1-6', 'And Then There Were None', 'Agatha Christie'],
      ])
      .setStyle(style)
      .render()
    ;

    assert.deepEqual(expected, getOutputContent(output));
  });

  it('testColumnMaxWidths', () => {
    let table = new Table(output = getOutputStream());
    table
      .setRows([
        ['Divine Comedy', 'A Tale of Two Cities', 'The Lord of the Rings', 'And Then There Were None'],
      ])
      .setColumnMaxWidth(1, 5)
      .setColumnMaxWidth(2, 10)
      .setColumnMaxWidth(3, 15);

    table.render();

    const expected =
      `+---------------+-------+------------+-----------------+
| Divine Comedy | A Tal | The Lord o | And Then There  |
|               | e of  | f the Ring | Were None       |
|               | Two C | s          |                 |
|               | ities |            |                 |
+---------------+-------+------------+-----------------+
`;

    assert.deepEqual(getOutputContent(output), expected);
  });

  it('testColumnMaxWidthsWithTrailingBackslash', () => {
    let output = getOutputStream(false);
    (new Table(output))
      .setColumnMaxWidth(0, 5)
      .setRows([['1234\\6']])
      .render()
    ;

    const expected =
      `+-------+
| 1234\\ |
| 6     |
+-------+
`;

    assert.deepEqual(getOutputContent(output), expected);
  });

  it('testBoxedStyleWithColspan', () => {
    let boxed = new TableStyle();
    boxed
      .setHorizontalBorderChars('─')
      .setVerticalBorderChars('│')
      .setCrossingChars('┼', '┌', '┬', '┐', '┤', '┘', '┴', '└', '├')
    ;

    let table = new Table(output = getOutputStream());
    table.setStyle(boxed);
    table
      .setHeaders(['ISBN', 'Title', 'Author'])
      .setRows([
        ['99921-58-10-7', 'Divine Comedy', 'Dante Alighieri'],
        new TableSeparator(),
        [new TableCell('This value spans 3 columns.', {'colspan': 3})],
      ])
    ;
    table.render();

    const expected =
      `┌───────────────┬───────────────┬─────────────────┐
│ ISBN          │ Title         │ Author          │
├───────────────┼───────────────┼─────────────────┤
│ 99921-58-10-7 │ Divine Comedy │ Dante Alighieri │
├───────────────┼───────────────┼─────────────────┤
│ This value spans 3 columns.                     │
└───────────────┴───────────────┴─────────────────┘
`;

    assert.deepEqual(expected, getOutputContent(output));
  });

  forEach(provideRenderHorizontalTests()).
  it('testRenderHorizontal %s', (msg, headers = [], rows = [], expected = '') => {
    const output =  getOutputStream();
    let table = new Table(output);
    table
      .setHeaders(headers)
      .setRows(rows)
      .setHorizontal()
    ;
    table.render();

    assert.deepEqual(getOutputContent(output), expected);
  });

  it('testWithColspanAndMaxWith', () => {
    let table = new Table(output = getOutputStream());

    table.setColumnMaxWidth(0, 15);
    table.setColumnMaxWidth(1, 15);
    table.setColumnMaxWidth(2, 15);
    table.setRows([
      [new TableCell('Lorem ipsum dolor sit amet, <fg=white;bg=green>consectetur</> adipiscing elit, <fg=white;bg=red>sed</> do <fg=white;bg=red>eiusmod</> tempor', {'colspan': 3})],
      new TableSeparator(),
      [new TableCell('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', {'colspan': 3})],
      new TableSeparator(),
      [new TableCell('Lorem ipsum <fg=white;bg=red>dolor</> sit amet, consectetur ', {'colspan': 2}), 'hello world'],
      new TableSeparator(),
      ['hello <fg=white;bg=green>world</>', new TableCell('Lorem ipsum dolor sit amet, <fg=white;bg=green>consectetur</> adipiscing elit', {'colspan': 2})],
      new TableSeparator(),
      ['hello ', new TableCell('world', {'colspan': 1}), 'Lorem ipsum dolor sit amet, consectetur'],
      new TableSeparator(),
      ['Symfony ', new TableCell('Test', {'colspan': 1}), 'Lorem <fg=white;bg=green>ipsum</> dolor sit amet, consectetur'],
    ])
    ;
    table.render();

    const expected =
      `+-----------------+-----------------+-----------------+
| Lorem ipsum dolor sit amet, consectetur adipi       |
| scing elit, sed do eiusmod tempor                   |
+-----------------+-----------------+-----------------+
| Lorem ipsum dolor sit amet, consectetur adipi       |
| scing elit, sed do eiusmod tempor                   |
+-----------------+-----------------+-----------------+
| Lorem ipsum dolor sit amet, co    | hello world     |
| nsectetur                         |                 |
+-----------------+-----------------+-----------------+
| hello world     | Lorem ipsum dolor sit amet, co    |
|                 | nsectetur adipiscing elit         |
+-----------------+-----------------+-----------------+
| hello           | world           | Lorem ipsum dol |
|                 |                 | or sit amet, co |
|                 |                 | nsectetur       |
+-----------------+-----------------+-----------------+
| Symfony         | Test            | Lorem ipsum dol |
|                 |                 | or sit amet, co |
|                 |                 | nsectetur       |
+-----------------+-----------------+-----------------+
`;

    assert.deepEqual(expected, getOutputContent(output));
  });


  function setUp() {
    thisstream = fopen('php://memory', 'r+');
  }

  function tearDown() {
    fclose(thisstream);
    thisstream = null;
  }

  function renderProvider() {
    let books = [
      ['99921-58-10-7', 'Divine Comedy', 'Dante Alighieri'],
      ['9971-5-0210-0', 'A Tale of Two Cities', 'Charles Dickens'],
      ['960-425-059-0', 'The Lord of the Rings', 'J. R. R. Tolkien'],
      ['80-902734-1-6', 'And Then There Were None', 'Agatha Christie'],
    ];

    return [
      [
        'default',
        ['ISBN', 'Title', 'Author'],
        books,
        'fallback',
        `+---------------+--------------------------+------------------+
| ISBN          | Title                    | Author           |
+---------------+--------------------------+------------------+
| 99921-58-10-7 | Divine Comedy            | Dante Alighieri  |
| 9971-5-0210-0 | A Tale of Two Cities     | Charles Dickens  |
| 960-425-059-0 | The Lord of the Rings    | J. R. R. Tolkien |
| 80-902734-1-6 | And Then There Were None | Agatha Christie  |
+---------------+--------------------------+------------------+
`
      ],
      [
        'compact',
        ['ISBN', 'Title', 'Author'],
        books,
        'compact',
        ` ISBN          Title                    Author           
 99921-58-10-7 Divine Comedy            Dante Alighieri  
 9971-5-0210-0 A Tale of Two Cities     Charles Dickens  
 960-425-059-0 The Lord of the Rings    J. R. R. Tolkien 
 80-902734-1-6 And Then There Were None Agatha Christie  
`
      ],
      [
        'borderless',
        ['ISBN', 'Title', 'Author'],
        books,
        'borderless',
        ` =============== ========================== ================== 
  ISBN            Title                      Author            
 =============== ========================== ================== 
  99921-58-10-7   Divine Comedy              Dante Alighieri   
  9971-5-0210-0   A Tale of Two Cities       Charles Dickens   
  960-425-059-0   The Lord of the Rings      J. R. R. Tolkien  
  80-902734-1-6   And Then There Were None   Agatha Christie   
 =============== ========================== ================== 
`
      ],
      [
        'box',
        ['ISBN', 'Title', 'Author'],
        books,
        'box',
        `┌───────────────┬──────────────────────────┬──────────────────┐
│ ISBN          │ Title                    │ Author           │
├───────────────┼──────────────────────────┼──────────────────┤
│ 99921-58-10-7 │ Divine Comedy            │ Dante Alighieri  │
│ 9971-5-0210-0 │ A Tale of Two Cities     │ Charles Dickens  │
│ 960-425-059-0 │ The Lord of the Rings    │ J. R. R. Tolkien │
│ 80-902734-1-6 │ And Then There Were None │ Agatha Christie  │
└───────────────┴──────────────────────────┴──────────────────┘
`
      ],
      [
        'box-double',
        ['ISBN', 'Title', 'Author'],
        [
          ['99921-58-10-7', 'Divine Comedy', 'Dante Alighieri'],
          ['9971-5-0210-0', 'A Tale of Two Cities', 'Charles Dickens'],
          new TableSeparator(),
          ['960-425-059-0', 'The Lord of the Rings', 'J. R. R. Tolkien'],
          ['80-902734-1-6', 'And Then There Were None', 'Agatha Christie'],
        ],
        'box-double',
        `╔═══════════════╤══════════════════════════╤══════════════════╗
║ ISBN          │ Title                    │ Author           ║
╠═══════════════╪══════════════════════════╪══════════════════╣
║ 99921-58-10-7 │ Divine Comedy            │ Dante Alighieri  ║
║ 9971-5-0210-0 │ A Tale of Two Cities     │ Charles Dickens  ║
╟───────────────┼──────────────────────────┼──────────────────╢
║ 960-425-059-0 │ The Lord of the Rings    │ J. R. R. Tolkien ║
║ 80-902734-1-6 │ And Then There Were None │ Agatha Christie  ║
╚═══════════════╧══════════════════════════╧══════════════════╝
`
      ],
      [
        'data gaps',
        ['ISBN', 'Title'],
        [
          ['99921-58-10-7', 'Divine Comedy', 'Dante Alighieri'],
          ['9971-5-0210-0'],
          ['960-425-059-0', 'The Lord of the Rings', 'J. R. R. Tolkien'],
          ['80-902734-1-6', 'And Then There Were None', 'Agatha Christie'],
        ],
        'fallback',
        `+---------------+--------------------------+------------------+
| ISBN          | Title                    |                  |
+---------------+--------------------------+------------------+
| 99921-58-10-7 | Divine Comedy            | Dante Alighieri  |
| 9971-5-0210-0 |                          |                  |
| 960-425-059-0 | The Lord of the Rings    | J. R. R. Tolkien |
| 80-902734-1-6 | And Then There Were None | Agatha Christie  |
+---------------+--------------------------+------------------+
`
      ],
      [
        'no headers',
        [],
        [
          ['99921-58-10-7', 'Divine Comedy', 'Dante Alighieri'],
          ['9971-5-0210-0'],
          ['960-425-059-0', 'The Lord of the Rings', 'J. R. R. Tolkien'],
          ['80-902734-1-6', 'And Then There Were None', 'Agatha Christie'],
        ],
        'fallback',
        `+---------------+--------------------------+------------------+
| 99921-58-10-7 | Divine Comedy            | Dante Alighieri  |
| 9971-5-0210-0 |                          |                  |
| 960-425-059-0 | The Lord of the Rings    | J. R. R. Tolkien |
| 80-902734-1-6 | And Then There Were None | Agatha Christie  |
+---------------+--------------------------+------------------+
`
      ],
      [
        'content breaks',
        ['ISBN', 'Title', 'Author'],
        [
          ['99921-58-10-7', "Divine\nComedy", 'Dante Alighieri'],
          ['9971-5-0210-2', "Harry Potter\nand the Chamber of Secrets", "Rowling\nJoanne K."],
          ['9971-5-0210-2', "Harry Potter\nand the Chamber of Secrets", "Rowling\nJoanne K."],
          ['960-425-059-0', 'The Lord of the Rings', "J. R. R.\nTolkien"],
        ],
        'fallback',
        `+---------------+----------------------------+-----------------+
| ISBN          | Title                      | Author          |
+---------------+----------------------------+-----------------+
| 99921-58-10-7 | Divine                     | Dante Alighieri |
|               | Comedy                     |                 |
| 9971-5-0210-2 | Harry Potter               | Rowling         |
|               | and the Chamber of Secrets | Joanne K.       |
| 9971-5-0210-2 | Harry Potter               | Rowling         |
|               | and the Chamber of Secrets | Joanne K.       |
| 960-425-059-0 | The Lord of the Rings      | J. R. R.        |
|               |                            | Tolkien         |
+---------------+----------------------------+-----------------+
`
      ],
      [
        'headers no content',
        ['ISBN', 'Title'],
        [],
        'fallback',
        `+------+-------+
| ISBN | Title |
+------+-------+
`
      ],
      [
        'all empty',
        [],
        [],
        'fallback',
        '',
      ],
      ['Cell text with tags used for Output styling',

        ['ISBN', 'Title', 'Author'],
        [
          ['<info>99921-58-10-7</info>', '<error>Divine Comedy</error>', '<fg=blue;bg=white>Dante Alighieri</fg=blue;bg=white>'],
          ['9971-5-0210-0', 'A Tale of Two Cities', '<info>Charles Dickens</>'],
        ],
        'fallback',
        `+---------------+----------------------+-----------------+
| ISBN          | Title                | Author          |
+---------------+----------------------+-----------------+
| 99921-58-10-7 | Divine Comedy        | Dante Alighieri |
| 9971-5-0210-0 | A Tale of Two Cities | Charles Dickens |
+---------------+----------------------+-----------------+
`
      ],
      ['Cell text with tags not used for Output styling',
        ['ISBN', 'Title', 'Author'],
        [
          ['<strong>99921-58-10-700</strong>', '<f>Divine Com</f>', 'Dante Alighieri'],
          ['9971-5-0210-0', 'A Tale of Two Cities', 'Charles Dickens'],
        ],
        'fallback',
        `+----------------------------------+----------------------+-----------------+
| ISBN                             | Title                | Author          |
+----------------------------------+----------------------+-----------------+
| <strong>99921-58-10-700</strong> | <f>Divine Com</f>    | Dante Alighieri |
| 9971-5-0210-0                    | A Tale of Two Cities | Charles Dickens |
+----------------------------------+----------------------+-----------------+
`
      ],
      ['Cell with colspan',
        ['ISBN', 'Title', 'Author'],
        [
          ['99921-58-10-7', 'Divine Comedy', 'Dante Alighieri'],
          new TableSeparator(),
          [new TableCell('Divine Comedy(Dante Alighieri)', {'colspan': 3})],
          new TableSeparator(),
          [
            new TableCell('Arduino: A Quick-Start Guide', {'colspan': 2}),
            'Mark Schmidt',
          ],
          new TableSeparator(),
          [
            '9971-5-0210-0',
            new TableCell("A Tale of \nTwo Cities", {'colspan': 2}),
          ],
          new TableSeparator(),
          [
            new TableCell('Cupiditate dicta atque porro, tempora exercitationem modi animi nulla nemo vel nihil!', {'colspan': 3}),
          ],
        ],
        'fallback',
        `+-------------------------------+-------------------------------+-----------------------------+
| ISBN                          | Title                         | Author                      |
+-------------------------------+-------------------------------+-----------------------------+
| 99921-58-10-7                 | Divine Comedy                 | Dante Alighieri             |
+-------------------------------+-------------------------------+-----------------------------+
| Divine Comedy(Dante Alighieri)                                                              |
+-------------------------------+-------------------------------+-----------------------------+
| Arduino: A Quick-Start Guide                                  | Mark Schmidt                |
+-------------------------------+-------------------------------+-----------------------------+
| 9971-5-0210-0                 | A Tale of                                                   |
|                               | Two Cities                                                  |
+-------------------------------+-------------------------------+-----------------------------+
| Cupiditate dicta atque porro, tempora exercitationem modi animi nulla nemo vel nihil!       |
+-------------------------------+-------------------------------+-----------------------------+
`
      ],
      [
        'Cell with rowspan',
        ['ISBN', 'Title', 'Author'],
        [
          [
            new TableCell('9971-5-0210-0', {'rowspan': 3}),
            new TableCell('Divine Comedy', {'rowspan': 2}),
            'Dante Alighieri',
          ],
          [],
          ["The Lord of \nthe Rings", "J. R. \nR. Tolkien"],
          new TableSeparator(),
          ['80-902734-1-6', new TableCell("And Then \nThere \nWere None", {'rowspan': 3}), 'Agatha Christie'],
          ['80-902734-1-7', 'Test'],
        ],
        'fallback',
        `+---------------+---------------+-----------------+
| ISBN          | Title         | Author          |
+---------------+---------------+-----------------+
| 9971-5-0210-0 | Divine Comedy | Dante Alighieri |
|               |               |                 |
|               | The Lord of   | J. R.           |
|               | the Rings     | R. Tolkien      |
+---------------+---------------+-----------------+
| 80-902734-1-6 | And Then      | Agatha Christie |
| 80-902734-1-7 | There         | Test            |
|               | Were None     |                 |
+---------------+---------------+-----------------+
`
      ],
      ['Cell with rowspan and colspan',
        ['ISBN', 'Title', 'Author'],
        [
          [
            new TableCell('9971-5-0210-0', {'rowspan': 2, 'colspan': 2}),
            'Dante Alighieri',
          ],
          ['Charles Dickens'],
          new TableSeparator(),
          [
            'Dante Alighieri',
            new TableCell('9971-5-0210-0', {'rowspan': 3, 'colspan': 2}),
          ],
          ['J. R. R. Tolkien'],
          ['J. R. R'],
        ],
        'fallback',
        `+------------------+---------+-----------------+
| ISBN             | Title   | Author          |
+------------------+---------+-----------------+
| 9971-5-0210-0              | Dante Alighieri |
|                            | Charles Dickens |
+------------------+---------+-----------------+
| Dante Alighieri  | 9971-5-0210-0             |
| J. R. R. Tolkien |                           |
| J. R. R          |                           |
+------------------+---------+-----------------+
`
      ],
      ['Cell with rowspan and colspan contains new line break',
        ['ISBN', 'Title', 'Author'],
        [
          [
            new TableCell("9971\n-5-\n021\n0-0", {'rowspan': 2, 'colspan': 2}),
            'Dante Alighieri',
          ],
          ['Charles Dickens'],
          new TableSeparator(),
          [
            'Dante Alighieri',
            new TableCell("9971\n-5-\n021\n0-0", {'rowspan': 2, 'colspan': 2}),
          ],
          ['Charles Dickens'],
          new TableSeparator(),
          [
            new TableCell("9971\n-5-\n021\n0-0", {'rowspan': 2, 'colspan': 2}),
            new TableCell("Dante \nAlighieri", {'rowspan': 2, 'colspan': 1}),
          ],
        ],
        'fallback',
        `+-----------------+-------+-----------------+
| ISBN            | Title | Author          |
+-----------------+-------+-----------------+
| 9971                    | Dante Alighieri |
| -5-                     | Charles Dickens |
| 021                     |                 |
| 0-0                     |                 |
+-----------------+-------+-----------------+
| Dante Alighieri | 9971                    |
| Charles Dickens | -5-                     |
|                 | 021                     |
|                 | 0-0                     |
+-----------------+-------+-----------------+
| 9971                    | Dante           |
| -5-                     | Alighieri       |
| 021                     |                 |
| 0-0                     |                 |
+-----------------+-------+-----------------+
`
      ],
      ['Cell with rowspan and colspan without using TableSeparator',
        ['ISBN', 'Title', 'Author'],
        [
          [
            new TableCell("9971\n-5-\n021\n0-0", {'rowspan': 2, 'colspan': 2}),
            'Dante Alighieri',
          ],
          ['Charles Dickens'],
          [
            'Dante Alighieri',
            new TableCell("9971\n-5-\n021\n0-0", {'rowspan': 2, 'colspan': 2}),
          ],
          ['Charles Dickens'],
        ],
        'fallback',
        `+-----------------+-------+-----------------+
| ISBN            | Title | Author          |
+-----------------+-------+-----------------+
| 9971                    | Dante Alighieri |
| -5-                     | Charles Dickens |
| 021                     |                 |
| 0-0                     |                 |
| Dante Alighieri | 9971                    |
| Charles Dickens | -5-                     |
|                 | 021                     |
|                 | 0-0                     |
+-----------------+-------+-----------------+
`
      ],
      ['Cell with rowspan and colspan with separator inside a rowspan',
        ['ISBN', 'Author'],
        [
          [
            new TableCell('9971-5-0210-0', {'rowspan': 3, 'colspan': 1}),
            'Dante Alighieri',
          ],
          [new TableSeparator()],
          ['Charles Dickens'],
        ],
        'fallback',
        `+---------------+-----------------+
| ISBN          | Author          |
+---------------+-----------------+
| 9971-5-0210-0 | Dante Alighieri |
|               |-----------------|
|               | Charles Dickens |
+---------------+-----------------+
`
      ],
      ['Multiple header lines',
        [
          [new TableCell('Main title', {'colspan': 3})],
          ['ISBN', 'Title', 'Author'],
        ],
        [],
        'fallback',
        `+------+-------+--------+
| Main title            |
+------+-------+--------+
| ISBN | Title | Author |
+------+-------+--------+
`
      ],
      ['Row with multiple cells',
        [],
        [
          [
            new TableCell('1', {'colspan': 3}),
            new TableCell('2', {'colspan': 2}),
            new TableCell('3', {'colspan': 2}),
            new TableCell('4', {'colspan': 2}),
          ],
        ],
        'fallback',
        `+---+--+--+---+--+---+--+---+--+
| 1       | 2    | 3    | 4    |
+---+--+--+---+--+---+--+---+--+
`
      ],
      ['Coslpan and table cells with comment style',
        [
          new TableCell('<comment>Long Title</comment>', {'colspan': 3}),
        ],
        [
          [
            new TableCell('9971-5-0210-0', {'colspan': 3}),
          ],
          new TableSeparator(),
          [
            'Dante Alighieri',
            'J. R. R. Tolkien',
            'J. R. R',
          ],
        ],
        'fallback',
        `+-----------------+------------------+---------+
|\x1B[32m \x1B[39m\x1B[33mLong Title\x1B[39m\x1B[32m                                   \x1B[39m|
+-----------------+------------------+---------+
| 9971-5-0210-0                                |
+-----------------+------------------+---------+
| Dante Alighieri | J. R. R. Tolkien | J. R. R |
+-----------------+------------------+---------+
`
        ,
        true,
      ],
      ['Row with formatted cells containing a newline',
        [],
        [
          [
            new TableCell('<error>Dont break' + "\n" + 'here</error>', {'colspan': 2}),
          ],
          new TableSeparator(),
          [
            'foo',
            new TableCell('<error>Dont break' + "\n" + 'here</error>', {'rowspan': 2}),
          ],
          [
            'bar',
          ],
        ],
        'fallback',
        `+-------+------------+
[39;49m| [39;49m[37;41mDont break[39;49m[39;49m         |[39;49m
[39;49m| [39;49m[37;41mhere[39;49m               |
+-------+------------+
[39;49m| foo   | [39;49m[37;41mDont break[39;49m[39;49m |[39;49m
[39;49m| bar   | [39;49m[37;41mhere[39;49m       |
+-------+------------+
`
        ,
        true,
      ]
    ];
  }

  function renderSetTitle() {
    return [
      [
        'Books',
        'Page 1/2',
        'fallback',
        `+---------------+----------- Books --------+------------------+
| ISBN          | Title                    | Author           |
+---------------+--------------------------+------------------+
| 99921-58-10-7 | Divine Comedy            | Dante Alighieri  |
| 9971-5-0210-0 | A Tale of Two Cities     | Charles Dickens  |
| 960-425-059-0 | The Lord of the Rings    | J. R. R. Tolkien |
| 80-902734-1-6 | And Then There Were None | Agatha Christie  |
+---------------+--------- Page 1/2 -------+------------------+
`
      ],
      [
        'Books',
        'Page 1/2',
        'box',
        `┌───────────────┬─────────── Books ────────┬──────────────────┐
│ ISBN          │ Title                    │ Author           │
├───────────────┼──────────────────────────┼──────────────────┤
│ 99921-58-10-7 │ Divine Comedy            │ Dante Alighieri  │
│ 9971-5-0210-0 │ A Tale of Two Cities     │ Charles Dickens  │
│ 960-425-059-0 │ The Lord of the Rings    │ J. R. R. Tolkien │
│ 80-902734-1-6 │ And Then There Were None │ Agatha Christie  │
└───────────────┴───────── Page 1/2 ───────┴──────────────────┘
`
      ],
      [
        'Boooooooooooooooooooooooooooooooooooooooooooooooooooooooks',
        'Page 1/999999999999999999999999999999999999999999999999999',
        'fallback',
        `+- Booooooooooooooooooooooooooooooooooooooooooooooooooooo... -+
| ISBN          | Title                    | Author           |
+---------------+--------------------------+------------------+
| 99921-58-10-7 | Divine Comedy            | Dante Alighieri  |
| 9971-5-0210-0 | A Tale of Two Cities     | Charles Dickens  |
| 960-425-059-0 | The Lord of the Rings    | J. R. R. Tolkien |
| 80-902734-1-6 | And Then There Were None | Agatha Christie  |
+- Page 1/99999999999999999999999999999999999999999999999... -+
`
      ],
    ];
  }

  function provideRenderHorizontalTests() {
    const tests = [];
    let headers = ['foo', 'bar', 'baz'];
    let rows = [['one', 'two', 'tree'], ['1', '2', '3']];
    let expected = `+-----+------+---+
| foo | one  | 1 |
| bar | two  | 2 |
| baz | tree | 3 |
+-----+------+---+
`;
    tests.push(['regular', headers, rows, expected]);

    headers = ['foo', 'bar', 'baz'];
    rows = [['one', 'two'], ['1']];
    expected = `+-----+-----+---+
| foo | one | 1 |
| bar | two |   |
| baz |     |   |
+-----+-----+---+
`;
    tests.push(['withGaps', headers, rows, expected]);

    headers = ['foo', 'bar', 'baz'];
    rows = [['one', 'two', 'tree'], new TableSeparator(), ['1', '2', '3']];
    expected = `+-----+------+---+
| foo | one  | 1 |
| bar | two  | 2 |
| baz | tree | 3 |
+-----+------+---+
`;
    tests.push(['with separator', headers, rows, expected]);
    return tests;
  }

  function getOutputStream(decorated = false) {
    return new StreamOutput(new stdoutMock(), StreamOutput.VERBOSITY_NORMAL, decorated);
  }

  function getOutputContent(output) {
    return output.getStream().rawInput.replace(PHP_EOL, "\n");
  }

})
;
