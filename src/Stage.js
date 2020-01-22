import Constants from './Constants';
import BlockFactory from './BlockFactory';

export default class Stage {
  constructor(container) {
    // Set the container
    this._container = container;

    // _data represents the state of every block of the stage
    // 0 for "empty", hexa code color if not
    // We initialize it with zeros
    this._data = [];
    for (let x = 0; x < Constants.WIDTH; x++) {
      this._data.push([]);
      for (let y = 0; y < Constants.HEIGHT; y++) {
        this._data[x].push(0);
      }
    }

    // Pixi's blocks
    this._blocks = [];
  }

  /**
   * Add shapes to the _container
   */
  draw() {
    var i = 0;
    for (let x = 0; x < Constants.WIDTH; x++) {
      for (let y = 0; y < Constants.HEIGHT; y++) {
        // Color blocks when not empty
        if (this._data[x][y] !== 0) {
          var block = BlockFactory.createBlock(
            x * Constants.SQUARE_SIZE,
            y * Constants.SQUARE_SIZE,
            Constants.SQUARE_SIZE,
            Constants.SQUARE_SIZE,
            this._data[x][y],
            Constants.COLORS.TETRIS_BORDERS,
            0.5,
          );

          this._container.removeChild(this._blocks[i]);
          delete this._blocks[i];
          this._container.addChild(block);
          this._blocks[i] = block;
        } else if (this._blocks[i] === undefined) {
          // Just a grid if empty
          var block = BlockFactory.createBlock(
            x * Constants.SQUARE_SIZE,
            y * Constants.SQUARE_SIZE,
            Constants.SQUARE_SIZE,
            Constants.SQUARE_SIZE,
            Constants.COLORS.BACKGROUND,
            Constants.COLORS.BORDERS,
            0.5,
          );
          this._container.addChild(block);
          this._blocks[i] = block;
        }
        i++;
      }
    }
  }

  /**
   * Check if 'tetromino' is in collision with the stage
   */
  isCollision(tetromino) {
    for (let x = 0; x < tetromino.type.size; x++) {
      for (let y = 0; y < tetromino.type.size; y++) {
        if (
          tetromino.x + x < 0 ||
          tetromino.x + x >= Constants.WIDTH ||
          y >= Constants.HEIGHT ||
          (tetromino.y >= 0 &&
            this._data[tetromino.x + x][tetromino.y + y] !== 0)
        ) {
          if (tetromino.hasBlock(x, y)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Fusion 'tetromino' with the stage
   * If the fusion create a line, we clear the line
   * Return the number of cleared lines
   */
  unite(tetromino) {
    var clearedLines = 0;

    // Fusion the tetromino with the stage
    for (let y = 0; y < tetromino.type.size; y++) {
      for (let x = 0; x < tetromino.type.size; x++) {
        if (
          tetromino.x + x < Constants.WIDTH &&
          tetromino.x + x >= 0 &&
          tetromino.hasBlock(x, y)
        ) {
          this._data[tetromino.x + x][tetromino.y + y] = tetromino.type.color;
        }
      }
    }

    for (let y = 0; y < tetromino.type.size; y++) {
      // Check if the fusion created a new line
      var eraseLine = true;
      if (y + tetromino.y >= Constants.HEIGHT) {
        eraseLine = false;
      } else {
        for (let x = 0; x < Constants.WIDTH; x++) {
          if (this._data[x][y + tetromino.y] === 0) {
            eraseLine = false;
            break;
          }
        }
      }
      // If yes, we erase it and move all concerned blocks
      if (eraseLine) {
        clearedLines++;
        for (let yy = y + tetromino.y; yy >= 0; yy--) {
          for (let x = 0; x < Constants.WIDTH; x++) {
            if (yy > 0) {
              this._data[x][yy] = this._data[x][yy - 1];
            } else {
              this._data[x][yy] = 0;
            }
          }
        }
        // empty the blocks (we will need to redraw)
        this._blocks = [];
      }
    }

    return clearedLines;
  }

  reset() {
    this._data = [];
    for (let x = 0; x < Constants.WIDTH; x++) {
      this._data.push([]);
      for (let y = 0; y < Constants.HEIGHT; y++) {
        this._data[x].push(0);
      }
    }
    this._blocks = [];
  }
}
