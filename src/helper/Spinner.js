const SpinnerFrames = require('./SpinnerFrames');
const ConsoleSectionOutput = require('../output/ConsoleSectionOutput');

module.exports = class Spinner
{
  constructor(output, message = '', style = SpinnerFrames.DOTDOTDOT) {
    this.output = output;
    this.enabled = true;
    this.message = null;
    this.frames = null;

    this.activeMsg = '';
    this.interval = null;
    this
      .setMessage(message)
      .setStyle(style)
      .start();
  }
  

  /** {@inheritDoc} */
  stop()
  {
    this.pause();
    this.clear();
    return this;
  }
  
  pause()
  {
    this.enabled = false;
    clearInterval(this.interval);
    this.frames.stop();
    return this;
  }

  /** {@inheritDoc} */
  start()
  {
    if(this.output.isDecorated()) {
      this.enabled = true;
      this.interval = setInterval(() => {
        this.update()
      }, Math.floor(1000 / this.frames.fps));
      this.update();
      this.frames.start();
    }else{
      this.output.writeln(this.message);
    }
    return this;
  }
  
  setMessage(message){
    this.message = message;
    return this;
  }
  
  setStyle(style){
    this.frames = SpinnerFrames.create(style);
    return this;
  }
  
  clear(){
    let len = this.activeMsg.length;

    if(this.output instanceof ConsoleSectionOutput){
      this.output.clear();
    }else{
      this.output.write(`\x1b[${len}D\x1b[$0K`);
    }
  }

  update(){
    this.clear();
    this.activeMsg = `${this.message}${this.frames.getFrame()}`;
    if(this.output instanceof ConsoleSectionOutput){
      this.output.overwrite(this.activeMsg);
    }else{
      this.output.write(`${this.activeMsg}`);
    }
  }
}