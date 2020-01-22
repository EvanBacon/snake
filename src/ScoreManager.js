import Constants from './Constants';

export default class ScoreManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.best = localStorage.bestScore ? localStorage.bestScore : 0;
    if (this.score > this.best) {
      this.best = localStorage.bestScore = this.score;
    }
    this.level = 0;
    this.score = 0;
    this.clearedLines = 0;
    this.updateDisplay();
  }

  _addPoints(points) {
    this.score += points;
  }

  addClearedLines(lines) {
    var previousClearedLines = this.clearedLines;
    this.clearedLines += lines;
    if (previousClearedLines % 10 > this.clearedLines % 10) {
      this.level++;
    }
    if (lines === 1) {
      this._addPoints(40 * (this.level + 1));
    } else if (lines === 2) {
      this._addPoints(100 * (this.level + 1));
    } else if (lines === 3) {
      this._addPoints(300 * (this.level + 1));
    } else if (lines === 4) {
      this._addPoints(1200 * (this.level + 1));
    }
    this.updateDisplay();
  }

  tetrominoDropped() {
    this._addPoints(5 * (this.level + 1));
    this.updateDisplay();
  }

  updateDisplay() {
    document.querySelector(Constants.DOM.LEVEL).innerText = this.level;
    document.querySelector(Constants.DOM.SCORE).innerText = this.score;
    document.querySelector(Constants.DOM.CLEARED).innerText = this.clearedLines;
    document.querySelector(Constants.DOM.BEST).innerText = this.best;
  }
}
