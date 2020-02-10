module.exports = class SpinnerFrameJuggler{
  
  constructor(frames, fps) {
    this.frames = frames;
    this.fps = fps;
    this.lastFrame = frames[0];
    this.started = null;
    this.enabled = null;
    
    this.start();
  }
  
  start(){
    this.enabled = true;
    this.started = new Date().getTime();
  }

  stop(){
    this.lastFrame = this.getFrame();
    this.enabled = false;
    this.started = null;
  }
  
  
  getFrame(){
    if(!this.enabled){
      return this.lastFrame;
    }else{
      const elapsed = (new Date().getTime() - this.started)/1000;
      const frameIndex = Math.floor((elapsed * this.fps) % this.frames.length);
      return this.frames[frameIndex];
    }
  }
}