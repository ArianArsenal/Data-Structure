/* Player: walks a precomputed list of frames (step, back, play, speed). */
(function (root) {
  'use strict';
  const DSV = root.DSV;

  class Player {
    constructor(onShow, onState) {
      this.onShow = onShow; // (frame, prevFrame, index, tweenMs)
      this.onState = onState; // () -> refresh controls
      this.frames = [];
      this.i = 0;
      this.speed = 1;
      this.playing = false;
      this.timer = 0;
    }

    interval() {
      return 1100 / this.speed;
    }

    tween() {
      return Math.min(420, this.interval() * 0.6);
    }

    load(frames, autoplay) {
      this.pause();
      this.frames = frames;
      this.go(0, 0);
      if (autoplay && frames.length > 1) this.play();
    }

    go(i, tween) {
      if (!this.frames.length) return;
      this.i = Math.max(0, Math.min(this.frames.length - 1, i));
      this.onShow(this.frames[this.i], this.frames[this.i - 1], this.i, tween === undefined ? this.tween() : tween);
      this.onState();
    }

    next() {
      if (this.i < this.frames.length - 1) this.go(this.i + 1);
      else this.pause();
    }

    prev() {
      this.go(this.i - 1);
    }

    first() {
      this.go(0);
    }

    last() {
      this.go(this.frames.length - 1);
    }

    atEnd() {
      return this.i >= this.frames.length - 1;
    }

    play() {
      if (this.playing) return;
      if (this.atEnd()) this.go(0, 0);
      this.playing = true;
      this.schedule();
      this.onState();
    }

    schedule() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        if (!this.playing) return;
        this.next();
        if (this.atEnd()) this.pause();
        else this.schedule();
      }, this.interval());
    }

    pause() {
      this.playing = false;
      clearTimeout(this.timer);
      this.onState();
    }

    toggle() {
      if (this.playing) this.pause();
      else this.play();
    }

    setSpeed(s) {
      this.speed = s;
      if (this.playing) this.schedule();
    }
  }
  DSV.Player = Player;
})(typeof window !== 'undefined' ? window : globalThis);
