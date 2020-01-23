import { PIXI } from 'expo-pixi';
import { PixelRatio } from 'react-native';

import Directions from './constants/Directions';

function _loopValue(v, min, max) {
  if (Settings.areWallsLooping) {
    if (v < min) return max;
    else if (v > max) return min;
  }
  return v;
}

const Settings = {
  initialSize: 6,
  tileSize: 30,
  hasGrid: true,
  foodColor: 0xff0000,
  snakeColor: 0x6660e7,
  backgroundColor: 0x7ED321,
  timeInterval: 90,
  areWallsLooping: true,
  initialFood: 3,
};

export default class Main {
  constructor(context) {
    this.app = new PIXI.Application({ 
      context, 
      backgroundColor: Settings.backgroundColor 
    });

    const size = Settings.tileSize * PixelRatio.get();
    const width = Math.round(this.app.renderer.width / size);
    const height = Math.round(this.app.renderer.height / size);
    const board = new Board(
      size,
      new Position(height, width),
      Settings.timeInterval,
    );
    this.app.stage.addChild(board);
    this.board = board;
  }
}

class Position {
  col = 0;
  row = 0;
  constructor(row = 0, col = 0) {
    this.row = row;
    this.col = col;
  }

  random = () => {
    return new Position(
      Math.floor(this.row * Math.random()),
      Math.floor(this.col * Math.random()),
    );
  };
  add = pos => {
    this.row += pos.row;
    this.col += pos.col;
    return this;
  };
}

class Board extends PIXI.Container {
  isRunning = false;

  constructor(size, boardSize, interval) {
    super();
    this._tileSize = size;
    this._boardSize = boardSize;
    this._interval = interval;

    this.restart();
  }

  restart = () => {
    this._generateField();
    this._generateStartingPositions();
    this._restartFood();
    this.headDirection = Directions.LEFT;
    this.isChangingDirection = true;
    this.isRunning = true;

    this.tick(this._interval);
  };

  setPaused = (isPaused) => {
    if (!isPaused === this.isRunning) {
      return;
    }
    this.isRunning = !isPaused;
    this.onPlaying(this.isRunning);
  }

  _generateStartingPositions = () => {
    this.snakeLength = Settings.initialSize;

    this.head = new Position(3, 3);
    this.tail = new Position(
      this.head.row,
      _loopValue(
        this.head.col + this.snakeLength - 1,
        0,
        this._boardSize.col - 1,
      ),
    );

    for (let i = 0; i < this.snakeLength; i++) {
      const c = _loopValue(this.head.col + i, 0, this._boardSize.col - 1);
      const r = _loopValue(this.head.row, 0, this._boardSize.row - 1);
      this.matrix[c][r].isSnake = true;
    }
  };

  matrix = [];

  _generateField = () => {
    let index = 0;
    for (let col = 0; col < this._boardSize.col; col++) {
      if (!this.matrix[col]) this.matrix[col] = [];
      for (let row = 0; row < this._boardSize.row; row++) {
        if (this.matrix[col][row]) {
          this.matrix[col][row].reset();
        } else {
          let tile = new Tile(this._tileSize, col, row, false, index);
          this.matrix[col][row] = tile;
          this.addChild(tile);
        }
        index += 1;
      }
    }
  };

  _restartFood = () => {
    this.foodPositions = [];
    for (let child of this.children) {
      if (!child.isSnake) {
        this.foodPositions.push(child.parentIndex);
      }
    }

    for (let i = 0; i < Settings.initialFood; i++) {
      this._generateFood();
    }
  };

  _generateFood = () => {
    const cell = this.children[
      this.foodPositions[Math.floor(Math.random() * this.foodPositions.length)]
    ];
    cell.isSnake = true;
    cell.isFood = true;
  };

  _updateTail = () => {
    this.currentTail.isSnake = false;

    this.foodPositions.push(this.currentTail.parentIndex);

    const velocity = this._getVelocityForDirection(this.currentTail.direction);
    this.tail.add(velocity);
    this.tail = this.loopPosition(this.tail);
  };

  get currentHead() {
    return this.matrix[this.head.col][this.head.row];
  }

  get currentTail() {
    return this.matrix[this.tail.col][this.tail.row];
  }

  _getVelocityForDirection = dir => {
    let position = new Position();
    if (dir === Directions.UP) {
      position.row--;
    } else if (dir === Directions.DOWN) {
      position.row++;
    } else if (dir === Directions.LEFT) {
      position.col--;
    } else if (dir === Directions.RIGHT) {
      position.col++;
    }
    return position;
  };

  loopPosition = p => {
    p.row = _loopValue(p.row, 0, this._boardSize.row - 1);
    p.col = _loopValue(p.col, 0, this._boardSize.col - 1);
    return p;
  };

  tick = interval => {
    clearInterval(this.secondsInterval);

    this.secondsInterval = setInterval(() => {
      if (!this.isRunning) return;
      const n = this.foodPositions.indexOf(this.currentHead.parentIndex);
      this.foodPositions.splice(n, 1);

      this.currentHead.direction = this.headDirection;

      const velocity = this._getVelocityForDirection(this.headDirection);
      this.head.add(velocity);
      this.head = this.loopPosition(this.head);

      if (this.currentHead.isSnake) {
        if (this.currentHead.isFood) {
          this.snakeLength++;
          this.currentHead.isFood = false;
          this._generateFood();
          this.onScore(this.snakeLength - Settings.initialSize);
        } else if (this.isChangingDirection === false) {
          this.gameOver();
        }
      } else {
        this._updateTail();
        this.currentHead.isSnake = true;
      }

      this.isChangingDirection = false;
    }, interval);
  };

  gameOver = () => {
    this.isRunning = false;
    this.onPlaying(false);
    clearInterval(this.secondsInterval);
  };

  onTap = () => {
    if (!this.isRunning) {
      this.restart();
      this.onPlaying(true);
    }
  };

  onSwipe = dir => {
    if (this.isRunning) {
      if (dir && this.headDirection !== otherDir[dir]) {
        this.isChangingDirection = true;
        this.headDirection = dir;
      }
    } else {
      this.restart();
    }
    this.onPlaying(true);
  };
}

const otherDir = {
  [Directions.DOWN]: Directions.UP,
  [Directions.RIGHT]: Directions.LEFT,
  [Directions.UP]: Directions.DOWN,
  [Directions.LEFT]: Directions.RIGHT,
};

class Square extends PIXI.Graphics {
  _color;
  _size;

  set size(v) {
    this._size = v;
    this._redraw();
  }

  set color(v) {
    this._color = v;
    this._redraw();
  }

  _redraw = () => {
    this.clear();
    this.beginFill(this._color);

    this.lineStyle(1, Settings.hasGrid ? 0x131313 : this._color, 0.5, 0.5);
    this.drawRect(0, 0, this._size, this._size);
  };

  constructor({ color, size }) {
    super();
    this._size = size;
    this._color = color;
    this._redraw();
  }
}
class Tile extends Square {
  direction = Directions.LEFT;
  _isFood = false;

  reset() {
    this._isFood = false;
    this._isSnake = false;
    this.direction = Directions.LEFT;
    this._updateColor();
  }

  _updateColor = () => {
    if (this._isFood) this.color = Settings.foodColor;
    else if (this._isSnake) this.color = Settings.snakeColor;
    else this.color = Settings.backgroundColor;
  };

  get isFood() {
    return this._isFood;
  }

  set isFood(v) {
    this._isFood = v;
    this._updateColor();
  }

  get isSnake() {
    return this._isSnake;
  }
  set isSnake(v) {
    this._isSnake = v;
    this._updateColor();
  }
  constructor(size, x, y, isSnake, parentIndex) {
    super({ size });
    this.x = size * x;
    this.y = size * y;

    this.isSnake = isSnake;
    this.parentIndex = parentIndex;
  }
}