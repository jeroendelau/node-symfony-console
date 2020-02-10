const {escapeshellarg, iterator_to_array, substr_count, array_replace_recursive, array_fill, str_split, str_pad, STR_PAD_BOTH, STR_PAD_RIGHT, STR_PAD_LEFT, sprintf, range, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');
const OutputFormatter = require('../formatter/OutputFormatter');
const ConsoleSectionOutput = require('../output/ConsoleSectionOutput');
const TableStyle = require('./TableStyle');
const TableRows = require('./TableRows');
const TableCell = require('./TableCell');
const TableSeparator = require('./TableSeparator');
const Helper = require('./Helper');
const difference = require('lodash/difference');

const SEPARATOR_TOP = 0;
const SEPARATOR_TOP_BOTTOM = 1;
const SEPARATOR_MID = 2;
const SEPARATOR_BOTTOM = 3;
const BORDER_OUTSIDE = 0;
const BORDER_INSIDE = 1;

var styles;

class Table {
  constructor(output) {
    /**
     * Table headers.
     */
    this.headers = [];

    /**
     * Table rows.
     */
    this.rows = [];
    this.horizontal = false;

    /**
     * Column widths cache.
     */
    this.effectiveColumnWidths = [];

    /**
     * Number of columns cache.
     *
     * @var int
     */
    this.numberOfColumns;

    /**
     * @var OutputInterface
     */
    this.output;

    /**
     * @var TableStyle
     */
    this.style;

    /**
     * @var array
     */
    this.columnStyles = [];

    /**
     * User set column widths.
     *
     * @var array
     */
    this.columnWidths = [];
    this.columnMaxWidths = [];

    this.rendered = false;

    this.output = output;

    if (!styles) {
      styles = this.constructor.initStyles();
    }

    this.setStyle('fallback');
  }

  static get styles() {
    return styles;
  }

  static set styles(styles) {
    styles = styles;
  }

  static get SEPARATOR_TOP() {
    return SEPARATOR_TOP;
  }

  static get SEPARATOR_TOP_BOTTOM() {
    return SEPARATOR_TOP_BOTTOM;
  }

  static get SEPARATOR_MID() {
    return SEPARATOR_MID;
  }

  static get SEPARATOR_BOTTOM() {
    return SEPARATOR_BOTTOM;
  }

  static get BORDER_OUTSIDE() {
    return BORDER_OUTSIDE;
  }

  static get BORDER_INSIDE() {
    return BORDER_INSIDE;
  }


  static setStyleDefinition(name, style) {
    if (!styles) {
      styles = this.initStyles();
    }

    styles[name] = style;
  }

  static getStyleDefinition(name) {
    if (!styles) {
      styles = this.initStyles();
    }

    if (isset(styles[name])) {
      return styles[name];
    }

    throw new Error(sprintf('Style "%s" is not defined.', name));
  }

  setStyle(name ) {
    this.style = this.resolveStyle(name);

    return this;
  }

  getStyle() {
    return this.style;
  }

  setColumnStyle(columnIndex, name) {
    this.columnStyles[columnIndex] = this.resolveStyle(name);

    return this;
  }

  getColumnStyle(columnIndex) {
    return this.columnStyles[columnIndex] || this.getStyle();
  }

  setColumnWidth(columnIndex, width) {
    this.columnWidths[columnIndex] = width;

    return this;
  }

  setColumnWidths(widths) {
    this.columnWidths = [];
    forEach(widths, (width, index) => {
      this.setColumnWidth(index, width);
    });

    return this;
  }

  setColumnMaxWidth(columnIndex, width) {
    // if (!this.output.getFormatter() instanceof WrappableOutputFormatterInterface) {
    if(!this.output.getFormatter().formatAndWrap){
      throw new Error(sprintf('Setting a maximum column width is only supported when using a formatter, that implements "formatAndWrap".'));
    }

    this.columnMaxWidths[columnIndex] = width;

    return this;
  }

  setHeaders(headers) {
    headers = Object.values(headers);
    if (headers.length !== 0 && !is_array(headers[0])) {
      headers = [headers];
    }

    this.headers = headers;

    return this;
  }

  setRows(rows) {
    this.rows = [];

    return this.addRows(rows);
  }

  addRows(rows) {
    forEach(rows, (row) => {
      this.addRow(row);
    });

    return this;
  }

  addRow(row) {
    if (row instanceof TableSeparator) {
      this.rows.push(row);

      return this;
    }

    if (!is_array(row)) {
      throw new Error('A row must be an array or a TableSeparator instance.');
    }

    this.rows.push(Object.values(row));

    return this;
  }

  appendRow(row) {
    if (!(this.output instanceof ConsoleSectionOutput)) {
      throw new Error(sprintf('Output should be an instance of "%s" when calling "%s".', 'ConsoleSectionOutput', 'appendRow'));
    }

    if (this.rendered) {
      this.output.clear(this.calculateRowCount());
    }

    this.addRow(row);
    this.render();

    return this;
  }

  setRow(column, row) {
    this.rows[column] = row;
    return this;
  }

  setHeaderTitle(title) {
    this.headerTitle = title;
    return this;
  }

  setFooterTitle(title) {
    this.footerTitle = title;
    return this;
  }

  setHorizontal(horizontal = true) {
    this.horizontal = horizontal;
    return this;
  }

  render() {
    let divider = new TableSeparator();
    let rows;
    if (this.horizontal) {
      rows = [];
      forEach(this.headers[0] || [], (header, i) => {
        rows[i] = [header];
        forEach(this.rows, (row) => {
          if (row instanceof TableSeparator) {
            return;
          }
          if (isset(row[i])) {
            rows[i].push(row[i]);
          } else if (rows[i][0] instanceof TableCell && rows[i][0].getColspan() >= 2) {
            // Noop, there is a "title"
          } else {
            rows[i].push(null);
          }
        });
      });
    } else {
      rows = [...this.headers, divider, ...this.rows];
    }

    this.calculateNumberOfColumns(rows);

    rows = this.buildTableRows(rows);
    this.calculateColumnsWidth(rows);

    let isHeader = !this.horizontal;
    let isFirstRow = this.horizontal;
    for (const row of rows) {
      if (divider === row) {
        isHeader = false;
        isFirstRow = true;

        continue;
      }
      if (row instanceof TableSeparator) {
        this.renderRowSeparator();

        continue;
      }
      if (!row) {
        continue;
      }

      if (isHeader || isFirstRow) {
        if (isFirstRow) {
          this.renderRowSeparator(Table.SEPARATOR_TOP_BOTTOM);
          isFirstRow = false;
        } else {
          this.renderRowSeparator(Table.SEPARATOR_TOP, this.headerTitle, this.style.getHeaderTitleFormat());
        }
      }
      if (this.horizontal) {
        this.renderRow(row, this.style.getCellRowFormat(), this.style.getCellHeaderFormat());
      } else {
        this.renderRow(row, isHeader ? this.style.getCellHeaderFormat() : this.style.getCellRowFormat());
      }
    }
    this.renderRowSeparator(Table.SEPARATOR_BOTTOM, this.footerTitle, this.style.getFooterTitleFormat());

    this.cleanup();
    this.rendered = true;
  }

  renderRowSeparator(type = Table.SEPARATOR_MID, title = null, titleFormat = null) {
    let count = this.numberOfColumns;
    if (0 === count) {
      return;
    }

    let borders = this.style.getBorderChars();
    if (!borders[0] && !borders[2] && !this.style.getCrossingChar()) {
      return;
    }

    let crossings = this.style.getCrossingChars();
    let horizontal;
    let leftChar;
    let midChar;
    let rightChar;

    if (Table.SEPARATOR_MID === type) {
      horizontal = borders[2];
      leftChar = crossings[8];
      midChar = crossings[0];
      rightChar = crossings[4];
    } else if (Table.SEPARATOR_TOP === type) {
      horizontal = borders[0];
      leftChar = crossings[1];
      midChar = crossings[2];
      rightChar = crossings[3];
    } else if (Table.SEPARATOR_TOP_BOTTOM === type) {
      horizontal = borders[0];
      leftChar = crossings[9];
      midChar = crossings[10];
      rightChar = crossings[11];
    } else {
      horizontal = borders[0];
      leftChar = crossings[7];
      midChar = crossings[6];
      rightChar = crossings[5];
    }

    let markup = leftChar;
    for (let column = 0; column < count; ++column) {
      markup += horizontal.repeat(this.effectiveColumnWidths[column]);
      markup += column === count - 1 ? rightChar : midChar;
    }

    let titleLength;
    let markupLength;
    let formattedTitle;

    if (null !== title) {
      const formatter = this.output.getFormatter();
      let formattedTitle = sprintf(titleFormat, title);

      titleLength = Helper.strlenWithoutDecoration(formatter, formattedTitle);
      markupLength = Helper.strlen(markup);
      const limit = markupLength - 4;
      if (titleLength > limit) {
        titleLength = limit;
        let formatLength = Helper.strlenWithoutDecoration(formatter, sprintf(titleFormat, ''));
        formattedTitle = sprintf(titleFormat, Helper.substr(title, 0, limit - formatLength - 3) + '...');
      }

      let titleStart = (markupLength - titleLength) / 2;
      //if (false === mb_detect_encoding(markup, null, true)) {
      const letters = markup.split("");
      letters.splice(titleStart, titleLength, ...formattedTitle.split(""));
      markup = letters.join("");
        //markup = substr_replace(markup, formattedTitle, titleStart, titleLength);
      //} else {
      //  markup = mb_substr(markup, 0, titleStart) + formattedTitle + mb_substr(markup, titleStart + titleLength);
      //}
    }

    this.output.writeln(sprintf(this.style.getBorderFormat(), markup));
  }

  renderColumnSeparator(type = Table.BORDER_OUTSIDE) {
    let borders = this.style.getBorderChars();

    return sprintf(this.style.getBorderFormat(), Table.BORDER_OUTSIDE === type ? borders[1] : borders[3]);
  }

  renderRow(row, cellFormat, firstCellFormat = null) {
    let rowContent = this.renderColumnSeparator(Table.BORDER_OUTSIDE);
    let columns = this.getRowColumns(row);
    let last = count(columns) - 1;
    forEach(columns, (column, i) => {
      if (firstCellFormat && 0 === i) {
        rowContent += this.renderCell(row, column, firstCellFormat);
      } else {
        rowContent += this.renderCell(row, column, cellFormat);
      }
      rowContent += this.renderColumnSeparator(last === i ? Table.BORDER_OUTSIDE : Table.BORDER_INSIDE);
    });
    this.output.writeln(rowContent);
  }

  renderCell(row, column, cellFormat) {
    let cell = isset(row[column]) ? row[column] : '';
    let width = this.effectiveColumnWidths[column];
    if (cell instanceof TableCell && cell.getColspan() > 1) {
      // add the width of the following columns(numbers of colspan) +
      for(let i = column + 1 ; i < column + cell.getColspan() ; i++){
        width += this.getColumnSeparatorWidth() + this.effectiveColumnWidths[i];
      }
    }

    // str_pad won't work properly with multi-byte strings, we need to fix the padding
    //const encoding = mb_detect_encoding(cell, null, true);
    //if (false !== encoding)
    //{
    // width += strlen(cell); // - mb_strwidth(cell, encoding);
    //}

    let style = this.getColumnStyle(column);

    if (cell instanceof TableSeparator) {
      return sprintf(style.getBorderFormat(), style.getBorderChars()[2].repeat(width));
    }

    width += Helper.strlen(cell) - Helper.strlenWithoutDecoration(this.output.getFormatter(), cell);
    let content = sprintf(style.getCellRowContentFormat(), cell);

    return sprintf(cellFormat, str_pad(content, width, style.getPaddingChar(), style.getPadType()));
  }

  calculateNumberOfColumns(rows) {
    let columns = [0];
    forEach(rows, (row) => {
      if (row instanceof TableSeparator) {
        return;
      }

      columns.push(this.getNumberOfColumns(row));
    });

    this.numberOfColumns = Math.max(...columns);
  }

  buildTableRows(rows) {
    /** @var WrappableOutputFormatterInterface formatter */
    let formatter = this.output.getFormatter();
    let unmergedRows = [];
    for (let rowKey = 0; rowKey < count(rows); ++rowKey) {
      rows = this.fillNextRows(rows, rowKey);

      // Remove any new line breaks and replace it with a new line
      forEach(rows[rowKey], (cell, column) => {
        let cellString = String(cell);
        let colspan = cell instanceof TableCell ? cell.getColspan() : 1;

        if (isset(this.columnMaxWidths[column]) && Helper.strlenWithoutDecoration(formatter, cell) > this.columnMaxWidths[column]) {
          cellString = formatter.formatAndWrap(cellString, this.columnMaxWidths[column] * colspan);
        }

        if (cellString.indexOf("\n") < 0) {
          return;
        }
        let escaped = implode("\n", cellString.split("\n").map(OutputFormatter.escapeTrailingBackslash));
        cell = cell instanceof TableCell ? new TableCell(escaped, {'colspan': cell.getColspan()}) : escaped;
        cellString = cell.toString();
        let lines = cellString.replace(/\n/g, "<fg=fallback;bg=fallback>\n</>").split("\n");
        forEach(lines, (line, lineKey) => {
          if (colspan > 1) {
            line = new TableCell(line, {'colspan': colspan});
          }
          if (0 === lineKey) {
            rows[rowKey][column] = line;
          } else {
            if (!isset(unmergedRows[rowKey])) {
              unmergedRows[rowKey] = [];
            }
            if (!isset(unmergedRows[rowKey][lineKey])) {
              unmergedRows[rowKey][lineKey] = [];
            }

            unmergedRows[rowKey][lineKey][column] = line;
          }
        });
      });
    }

    let me = this;
    return new TableRows(function* () {
        for (let rowKey = 0; rowKey < rows.length; rowKey++) {
          const row = rows[rowKey];
          yield me.fillCells(row);

          if (isset(unmergedRows[rowKey])) {
            for (let rowKey2 = 0; rowKey2 < unmergedRows[rowKey].length; rowKey2++) {
              const row = unmergedRows[rowKey][rowKey2];
              if (row !== undefined) {
                yield row;
              }
            }
          }
        }
      }
    );
  }

  calculateRowCount() {
    let numberOfRows = count(iterator_to_array(this.buildTableRows([...this.headers, new TableSeparator(), ...this.rows])));

    if (this.headers) {
      ++numberOfRows; // Add row for header separator
    }

    ++numberOfRows; // Add row for footer separator

    return numberOfRows;
  }

  fillNextRows(rows, line) {
    let unmergedRows = [];
    forEach(rows[line], (cell, column) => {
      if (null !== cell && !cell instanceof TableCell && !cell.toString ) {
        throw new Error(sprintf('A cell must be a TableCell, a scalar or an object implementing __toString, %s given + ', gettype(cell)));
      }
      if (cell instanceof TableCell && cell.getRowspan() > 1) {
        let nbLines = cell.getRowspan() - 1;
        let lines = [cell];
        const cellContent = cell.toString();
        if (cellContent.indexOf("\n") >= 0) {
          lines = cellContent.replace(/\n/g, "<fg=fallback;bg=fallback>\n</>").split("\n");
          nbLines = count(lines) > nbLines ? substr_count(cellContent, "\n") : nbLines;

          rows[line][column] = new TableCell(lines[0], {'colspan': cell.getColspan()});
          lines[0] = undefined;
        }

        // create a two dimensional array (rowspan x colspan)
        unmergedRows = array_replace_recursive(array_fill(line + 1, nbLines, []), unmergedRows);
        
        forEach(unmergedRows, (unmergedRow, unmergedRowKey) => {
          if(unmergedRow === undefined){
            return;
          }
          let value = isset(lines[unmergedRowKey - line]) ? lines[unmergedRowKey - line] : '';
          unmergedRows[unmergedRowKey][column] = new TableCell(value, {'colspan': cell.getColspan()});
          if (nbLines === unmergedRowKey - line) {
            return false;
          }
        });
      }
    });

    forEach(unmergedRows, (unmergedRow, unmergedRowKey) => {
      if(unmergedRow === undefined){
        return;
      }
      // we need to know if unmergedRow will be merged or inserted into rows
      if (isset(rows[unmergedRowKey]) && is_array(rows[unmergedRowKey]) && (this.getNumberOfColumns(rows[unmergedRowKey]) + this.getNumberOfColumns(unmergedRows[unmergedRowKey]) <= this.numberOfColumns)) {
        forEach(unmergedRow, (cell, cellKey) => {
          // insert cell into row at cellKey position
          if(cell !== undefined){
            rows[unmergedRowKey].splice( cellKey, 0, cell);
          }
        });
      } else {
        let row = this.copyRow(rows, unmergedRowKey - 1);
        forEach(unmergedRow, (cell, column) => {
          if (cell) {
            row[column] = unmergedRow[column];
          }
        });
        rows.splice(unmergedRowKey, 0, row);
      }
    });

    return rows;
  }

  fillCells(row) {
    if (!is_array(row)) {
      return row;
    }
    let newRow = [];
    forEach(row, (cell, column) => {
      newRow.push(cell);
      if (cell instanceof TableCell && cell.getColspan() > 1) {
        for( let i = 0  ; i < cell.getColspan() -1; i ++){
          newRow.push('');
        }
      }
    });

    return newRow || row;
  }

  copyRow(rows, line) {
    let row = [...rows[line]];
    forEach(row, (cellValue, cellKey) => {
      row[cellKey] = '';
      if (cellValue instanceof TableCell) {
        row[cellKey] = new TableCell('', {'colspan': cellValue.getColspan()});
      }
    });

    return row;
  }

  getNumberOfColumns(row) {
    let columns = count(row);
    forEach(row, (column) => {
      columns -= column === undefined ? 1  : 0;
      columns += column instanceof TableCell ? (column.getColspan() - 1) : 0;
    });

    return columns;
  }

  getRowColumns(row) {
    let columns = range(0, this.numberOfColumns - 1);
    forEach(row, (cell, cellKey) => {
      if (cell instanceof TableCell && cell.getColspan() > 1) {
        // exclude grouped columns +
        const r = range(cellKey + 1, cellKey + cell.getColspan() - 1);
        columns = difference(columns, range(cellKey + 1, cellKey + cell.getColspan() - 1));
      }
    });

    return columns;
  }

  calculateColumnsWidth(rows) {
    for (let column = 0; column < this.numberOfColumns; ++column) {
      let lengths = [];
      for (const orow of rows) {
        
        if (orow instanceof TableSeparator) {
          continue;
        }

        const row = [...orow];
        forEach(row, (cell, i) => {
          if (cell instanceof TableCell) {
            let textContent = Helper.removeDecoration(this.output.getFormatter(), cell);
            let textLength = Helper.strlen(textContent);
            if (textLength > 0) {
              let contentColumns = str_split(textContent, Math.ceil(textLength / cell.getColspan()));
              forEach(contentColumns, (content, position) => {
                row[i + position] = content;
              });
            }
          }
        });
        lengths.push(this.getCellWidth(row, column));
      }

      this.effectiveColumnWidths[column] = Math.max(...lengths) + Helper.strlen(this.style.getCellRowContentFormat()) - 2;
    }
  }

  getColumnSeparatorWidth() {
    return Helper.strlen(sprintf(this.style.getBorderFormat(), this.style.getBorderChars()[3]));
  }

  getCellWidth(row, column) {
    let cellWidth = 0;

    if (isset(row[column])) {
      let cell = row[column];
      cellWidth = Helper.strlenWithoutDecoration(this.output.getFormatter(), cell);
    }

    let columnWidth = isset(this.columnWidths[column]) ? this.columnWidths[column] : 0;
    cellWidth = Math.max(cellWidth, columnWidth);

    return isset(this.columnMaxWidths[column]) ? Math.min(this.columnMaxWidths[column], cellWidth) : cellWidth;
  }

  cleanup() {
    this.effectiveColumnWidths = [];
    this.numberOfColumns = null;
  }

  static initStyles() {
    let borderless = new TableStyle();
    borderless
      .setHorizontalBorderChars('=')
      .setVerticalBorderChars(' ')
      .setFallbackCrossingChar(' ')
    ;

    let compact = new TableStyle();
    compact
      .setHorizontalBorderChars('')
      .setVerticalBorderChars(' ')
      .setFallbackCrossingChar('')
      .setCellRowContentFormat('%s')
    ;

    let styleGuide = new TableStyle();
    styleGuide
      .setHorizontalBorderChars('-')
      .setVerticalBorderChars(' ')
      .setFallbackCrossingChar(' ')
      .setCellHeaderFormat('%s')
    ;

    let box = (new TableStyle())
      .setHorizontalBorderChars('─')
      .setVerticalBorderChars('│')
      .setCrossingChars('┼', '┌', '┬', '┐', '┤', '┘', '┴', '└', '├')
    ;

    let boxDouble = (new TableStyle())
      .setHorizontalBorderChars('═', '─')
      .setVerticalBorderChars('║', '│')
      .setCrossingChars('┼', '╔', '╤', '╗', '╢', '╝', '╧', '╚', '╟', '╠', '╪', '╣')
    ;

    return {
      'fallback': new TableStyle(),
      'borderless': borderless,
      'compact': compact,
      'symfony-style-guide': styleGuide,
      'box': box,
      'box-double': boxDouble,
    };
  }

  resolveStyle(name) {
    if (name instanceof TableStyle) {
      return name;
    }

    if (isset(styles[name])) {
      return styles[name];
    }

    throw new Error(sprintf('Style "%s" is not defined.', name));
  }

}

module.exports = Table;
