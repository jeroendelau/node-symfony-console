const {PREG_OFFSET_CAPTURE, PHP_EOL, PREG_SET_ORDER, getenv, escapeshellarg, sprintf, strip_tags, isset, is_string, is_array, is_int, is_iterable, in_array, to_array, array_key_exists, trim, count, array_shift, array_unshift, substr, strpos, strlen, str_replace, preg_match_all, preg_match, implode, stripcslashes, get_class, addcslashes} = require('./PhpPolyfill');
const forEach = require('lodash/forEach');
const termSize = require('term-size');

let size = termSize();

var _width = null;
var _height = null;
var _ssty = null;

class Terminal
{
  static get stty(){
    return process.stdout.isTTY;
  }

  static get width(){
    return size.columns;
  }
  
  static set width(width){
     _width = width;
  }

  static get height(){
    return size.rows;
  }

  static set height(height){
    _height = height;
  }


  getWidth()
  {
    let width = getenv('COLUMNS');
    if (false !== width)
    {
      return Number.parseInt(trim(width));
    }

    if (null === Terminal.width)
    {
      //Terminal.initDimensions();
    }

    return Terminal.width || 80;
  }

  getHeight()
  {
    let height = getenv('LINES');
    if (false !== height)
    {
      return Number.parseInt(trim(height));
    }

    if (null === Terminal.height)
    {
      // Terminal.initDimensions();
    }

    return Terminal.height || 50;
  }

  static hasSttyAvailable()
  {
    return Terminal.stty;
  }

  static initDimensions()
  {
    Terminal.width = Number.parseInt(dimensions[0]);
    Terminal.height = Number.parseInt(dimensions[1]);
    return;
    // We are skipping all this. This is toooooo PHP centric
    // easy node libaries might be available
    if ('\\' === DIRECTORY_SEPARATOR)
    {
      let dimensions = Terminal.getConsoleMode();
      if (preg_match('/^(\d+)x(\d+)(?: \((\d+)x(\d+)\))?/', trim(getenv('ANSICON')), matches))
      {
        // extract [w, H] from "wxh (WxH)"
        // or [w, h] from "wxh"
        console.width = Number.parseInt(matches[1]);
        Terminal.height = isset(matches[4]) ? Number.parseInt(matches[4]) : Number.parseInt(matches[2]);
      } else if (!Terminal.hasVt100Support() && Terminal.hasSttyAvailable())
      {
        // only use stty on Windows if the Terminal. does not support vt100 (e + g +  Windows 7 + git-bash)
        // testing for stty in a Windows 10 vt100-enabled console will implicitly disable vt100 support on STDOUT
        Terminal.initDimensionsUsingStty();
      } else if (null !== dimensions)
      {
        // extract [w, h] from "wxh"
        Terminal.width = Number.parseInt(dimensions[0]);
        Terminal.height = Number.parseInt(dimensions[1]);
      }
    } else
    {
      Terminal.initDimensionsUsingStty();
    }
  }

  static hasVt100Support()
  {
    return false;
    //return function_exists('sapi_windows_vt100_support') && sapi_windows_vt100_support(fopen('php://stdout', 'w'));
  }

  static initDimensionsUsingStty()
  {
    let sttyString = Terminal.getSttyColumns();
    if (sttyString)
    {
      if (preg_match('/rows + (\d+); + columns + (\d+);/i', sttyString, matches))
      {
        // extract [w, h] from "rows h; columns w;"
        Terminal.width = Number.parseInt(matches[2]);
        Terminal.height = Number.parseInt(matches[1]);
      } else if (preg_match('/; + (\d+) + rows; + (\d+) + columns/i', sttyString, matches))
      {
        // extract [w, h] from "; h rows; w columns"
        Terminal.width = Number.parseInt(matches[2]);
        Terminal.height = Number.parseInt(matches[1]);
      }
    }
  }

  static getConsoleMode()
  {
    let info = Terminal.readFromProcess('mode CON');

    if (null === info || !preg_match('/--------+\r?\n + +?(\d+)\r?\n + +?(\d+)\r?\n/', info, matches))
    {
      return null;
    }

    return [Number.parseInt(matches[2]), Number.parseInt(matches[1])];
  }

  static getSttyColumns()
  {
    return Terminal.readFromProcess('stty -a | grep columns');
  }

  static readFromProcess(command)
  {
    if (!function_exists('proc_open'))
    {
      return null;
    }

    let descriptorspec = {
      1: ['pipe', 'w'],
      2: ['pipe', 'w'],
    };

    let process = proc_open(command, descriptorspec, pipes, null, null, {'suppress_errors': true});
    if (!is_resource(process))
    {
      return null;
    }

    let info = stream_get_contents(pipes[1]);
    fclose(pipes[1]);
    fclose(pipes[2]);
    proc_close(process);

    return info;
  }

}

module.exports = Terminal;
