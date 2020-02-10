const {escapeshellarg, STR_PAD_RIGHT, STR_PAD_LEFT, STR_PAD_BOTH, sprintf, isset, is_string, is_array, is_int, in_array, to_array, array_key_exists, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match, implode, stripcslashes} = require('../PhpPolyfill');
const forEach = require('lodash/forEach');


class TableStyle {

  constructor(props) {
    this.paddingChar = ' ';
    this.horizontalOutsideBorderChar = '-';
    this.horizontalInsideBorderChar = '-';
    this.verticalOutsideBorderChar = '|';
    this.verticalInsideBorderChar = '|';
    this.crossingChar = '+';
    this.crossingTopRightChar = '+';
    this.crossingTopMidChar = '+';
    this.crossingTopLeftChar = '+';
    this.crossingMidRightChar = '+';
    this.crossingBottomRightChar = '+';
    this.crossingBottomMidChar = '+';
    this.crossingBottomLeftChar = '+';
    this.crossingMidLeftChar = '+';
    this.crossingTopLeftBottomChar = '+';
    this.crossingTopMidBottomChar = '+';
    this.crossingTopRightBottomChar = '+';
    this.headerTitleFormat = '<fg=black;bg=white;options=bold> %s </>';
    this.footerTitleFormat = '<fg=black;bg=white;options=bold> %s </>';
    this.cellHeaderFormat = '<info>%s</info>';
    this.cellRowFormat = '%s';
    this.cellRowContentFormat = ' %s ';
    this.borderFormat = '%s';
    this.padType = STR_PAD_RIGHT;
  }

  clone(){
    const cloned = new TableStyle();
    cloned
      .setBorderFormat(this.getBorderFormat())
      .setBorderFormat(this.getBorderFormat())
      .setCellHeaderFormat(this.getCellHeaderFormat())
      .setCellRowContentFormat(this.getCellRowContentFormat())
      .setCellRowFormat(this.getCellRowFormat())
      .setCrossingChars(...this.getCrossingChars())
      .setFooterTitleFormat(this.getFooterTitleFormat())
      .setHeaderTitleFormat(this.getHeaderTitleFormat())
      .setHorizontalBorderChars(this.horizontalOutsideBorderChar, this.horizontalInsideBorderChar)
      .setVerticalBorderChars(this.verticalOutsideBorderChar, this.verticalInsideBorderChar)
      .setPaddingChar(this.getPaddingChar())
      .setPadType(this.getPadType());
     return cloned;
  }
  
  setPaddingChar(paddingChar) {
    if (!paddingChar) {
      throw new Error('The padding char must not be empty');
    }

    this.paddingChar = paddingChar;

    return this;
  }

  getPaddingChar() {
    return this.paddingChar;
  }

  setHorizontalBorderChars(outside, inside = null) {
    this.horizontalOutsideBorderChar = outside;
    this.horizontalInsideBorderChar = inside || outside;

    return this;
  }

  setVerticalBorderChars(outside, inside = null) {
    this.verticalOutsideBorderChar = outside;
    this.verticalInsideBorderChar = inside || outside;

    return this;
  }

  getBorderChars() {
    return [
      this.horizontalOutsideBorderChar,
      this.verticalOutsideBorderChar,
      this.horizontalInsideBorderChar,
      this.verticalInsideBorderChar,
    ];
  }

  setCrossingChars(cross, topLeft, topMid, topRight, midRight, bottomRight, bottomMid, bottomLeft, midLeft, topLeftBottom = null, topMidBottom = null, topRightBottom = null) {
    this.crossingChar = cross;
    this.crossingTopLeftChar = topLeft;
    this.crossingTopMidChar = topMid;
    this.crossingTopRightChar = topRight;
    this.crossingMidRightChar = midRight;
    this.crossingBottomRightChar = bottomRight;
    this.crossingBottomMidChar = bottomMid;
    this.crossingBottomLeftChar = bottomLeft;
    this.crossingMidLeftChar = midLeft;
    this.crossingTopLeftBottomChar = topLeftBottom || midLeft;
    this.crossingTopMidBottomChar = topMidBottom || cross;
    this.crossingTopRightBottomChar = topRightBottom || midRight;

    return this;
  }

  setFallbackCrossingChar(char) {
    return this.setCrossingChars(char, char, char, char, char, char, char, char, char);
  }

  getCrossingChar() {
    return this.crossingChar;
  }

  getCrossingChars() {
    return [
      this.crossingChar,
      this.crossingTopLeftChar,
      this.crossingTopMidChar,
      this.crossingTopRightChar,
      this.crossingMidRightChar,
      this.crossingBottomRightChar,
      this.crossingBottomMidChar,
      this.crossingBottomLeftChar,
      this.crossingMidLeftChar,
      this.crossingTopLeftBottomChar,
      this.crossingTopMidBottomChar,
      this.crossingTopRightBottomChar,
    ];
  }

  setCellHeaderFormat(cellHeaderFormat) {
    this.cellHeaderFormat = cellHeaderFormat;

    return this;
  }

  getCellHeaderFormat() {
    return this.cellHeaderFormat;
  }

  setCellRowFormat(cellRowFormat) {
    this.cellRowFormat = cellRowFormat;

    return this;
  }

  getCellRowFormat() {
    return this.cellRowFormat;
  }

  setCellRowContentFormat(cellRowContentFormat) {
    this.cellRowContentFormat = cellRowContentFormat;

    return this;
  }

  getCellRowContentFormat() {
    return this.cellRowContentFormat;
  }

  setBorderFormat(borderFormat) {
    this.borderFormat = borderFormat;

    return this;
  }

  getBorderFormat() {
    return this.borderFormat;
  }

  setPadType(padType) {
    if (!in_array(padType, [STR_PAD_LEFT, STR_PAD_RIGHT, STR_PAD_BOTH], true)) {
      throw new Error('Invalid padding type +  Expected one of (STR_PAD_LEFT, STR_PAD_RIGHT, STR_PAD_BOTH) + ');
    }

    this.padType = padType;

    return this;
  }

  getPadType() {
    return this.padType;
  }

  getHeaderTitleFormat() {
    return this.headerTitleFormat;
  }

  setHeaderTitleFormat(format) {
    this.headerTitleFormat = format;

    return this;
  }

  getFooterTitleFormat() {
    return this.footerTitleFormat;
  }

  setFooterTitleFormat(format) {
    this.footerTitleFormat = format;

    return this;
  }

}

module.exports = TableStyle;
  