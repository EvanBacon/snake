import Tetromino from './Tetromino';
import { Types } from './Tetromino';
import Constants from './Constants';
import Stage from './Stage';
import ScoreManager from './ScoreManager';
import ExpoPixi, { PIXI } from 'expo-pixi';

export default class Game {
  constructor(context) {
    console.log(PIXI);

    // Constants.WIDTH * Constants.SQUARE_SIZE,
    // Constants.HEIGHT * Constants.SQUARE_SIZE,
    this.app = ExpoPixi.application({
      context,
      // backgroundColor: Settings.backgroundColor,
    });

    if (!this.app.renderer.width || !this.app.renderer.height) {
      console.error(
        `Tetris: Game size must be larger than ${this.app.renderer.width}x${
          this.app.renderer.height
        }`,
      );
    }

    // Next tetromino DOM container
    this._domNextContainer = document.querySelector(Constants.DOM.NEXT);

    // Keyboard events
    this._initKeyboardEvents();

    // Mouse events
    this._initMouseEvents();

    // Game board/stage
    this._stage = new Stage(this.app.stage);

    // Init tetrominos
    this._tetris = undefined; // Tetromino on the stage
    this._nextTetromino = undefined; // Next tetromino
    this._newTetromino();

    // Delay between moves
    this._delay = 300;

    // Init timer
    this._timer = Date.now();

    // Score manager
    this._scoreManager = new ScoreManager();

    // GO!
    this._requestId = undefined; // requestAnimationFrame ID (used to pause game)
    this._paused = false;
    this._start();
  }

  /**
   * Start the game
   */
  _start() {
    this._stage.draw();
    this._requestId = requestAnimationFrame(() => this._loop());
  }

  /**
   * Game loop
   */
  _loop() {
    if (new Date().getTime() - this._timer > this._delay) {
      this._timer = new Date().getTime();
      this._drop();
    }
    this._render();
    this._requestId = requestAnimationFrame(() => this._loop());
  }

  /**
   * Pause the game
   */
  _pause() {
    this._paused = !this._paused;
    // Stop or restart loop
    if (this._paused) {
      cancelAnimationFrame(this._requestId);
      document.querySelector(Constants.DOM.START_PAUSE).innerText = 'resume';
      document.querySelector(Constants.DOM.START_PAUSE).innerText = 'continue';
      document.querySelector(Constants.DOM.OVERLAY).className = 'active';
    } else {
      this._start();
      document.querySelector(Constants.DOM.START_PAUSE).id = 'pause';
      document.querySelector(Constants.DOM.START_PAUSE).innerText = 'pause';
      document.querySelector(Constants.DOM.OVERLAY).className = '';
    }
  }

  /**
   * Move the current tetromino downward
   */
  _drop() {
    this._tetris.move(0, 1); // Gravity
    // If collision, cancel  move and unite the tetromino with the game stage
    if (this._stage.isCollision(this._tetris)) {
      this._tetris.move(0, -1);
      this._tetris.remove();
      var clearedLines = this._stage.unite(this._tetris);
      if (clearedLines > 0) {
        this._scoreManager.addClearedLines(clearedLines);
      }
      this._scoreManager.tetrominoDropped();
      this._stage.draw();
      this._newTetromino();
    }
  }

  /**
   * Move the current tetromino as down as possible
   */
  _hardDrop() {
    while (!this._stage.isCollision(this._tetris)) {
      this._tetris.move(0, 1);
    }
    this._tetris.move(0, -1);
    this._tetris.remove();
    var clearedLines = this._stage.unite(this._tetris);
    if (clearedLines > 0) {
      this._scoreManager.addClearedLines(clearedLines);
    }
    this._scoreManager.tetrominoDropped();
    this._stage.draw();
    this._newTetromino();
  }

  /**
   * Called when the game is over
   */
  _gameOver() {
    this._stage.reset();
    this._stage.draw();
    this._scoreManager.reset();
  }

  /**
   * Put a new tetromino on the board
   * And check if the game is lost or not
   */
  _newTetromino() {
    if (!this._nextTetromino) {
      this._nextTetromino = Tetromino.getRandom(this.app.stage);
    }
    this._tetris = this._nextTetromino;
    this._nextTetromino = Tetromino.getRandom(this.app.stage);
    this._domNextContainer.className = this._nextTetromino.type.name;
    // Lose! Restart
    if (this._stage.isCollision(this._tetris)) {
      this._gameOver();
    }
  }

  /**
   * Init keyboard events
   */
  _initKeyboardEvents() {
    var leftKey = this._keyboard(37);
    var upKey = this._keyboard(38);
    var rightKey = this._keyboard(39);
    var downKey = this._keyboard(40);
    var spaceKey = this._keyboard(32);
    var pKey = this._keyboard(80);
    leftKey.press = () => this._pressLeft();
    upKey.press = () => this._pressUp();
    rightKey.press = () => this._pressRight();
    downKey.press = () => this._pressDown();
    spaceKey.press = () => this._pressSpace();
    pKey.press = () => this._pause();
  }

  /**
   * Init mouse events
   */
  _initMouseEvents() {
    var startPauseButton = document.querySelector(Constants.DOM.START_PAUSE);
    startPauseButton.addEventListener('click', () => this._pause());
  }

  /**
   * "Press left" event
   */
  _pressLeft() {
    if (!this._paused) {
      this._tetris.move(-1, 0);
      if (this._stage.isCollision(this._tetris)) {
        this._tetris.move(1, 0);
      }
    }
  }

  /**
   * "Press right" event
   */
  _pressRight() {
    if (!this._paused) {
      this._tetris.move(1, 0);
      if (this._stage.isCollision(this._tetris)) {
        this._tetris.move(-1, 0);
      }
    }
  }

  /**
   * "Press up" event
   */
  _pressUp() {
    if (!this._paused) {
      this._tetris.rotate();
      if (this._stage.isCollision(this._tetris)) {
        this._tetris.antiRotate();
      }
    }
  }

  /**
   * "Press down" event
   */
  _pressDown() {
    if (!this._paused) {
      this._drop();
    }
  }

  /**
   * "Press space" event
   */
  _pressSpace() {
    if (!this._paused) {
      this._hardDrop();
    }
  }

  /**
   * Render function
   */
  _render() {
    this._tetris.draw();
  }

  /**
   * Keyboard events helper
   */
  _keyboard(keyCode) {
    var key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = function(event) {
      if (event.keyCode === key.code) {
        if (key.isUp && key.press) key.press();
        key.isDown = true;
        key.isUp = false;
        event.preventDefault();
      }
    };

    //The `upHandler`
    key.upHandler = function(event) {
      if (event.keyCode === key.code) {
        if (key.isDown && key.release) key.release();
        key.isDown = false;
        key.isUp = true;
        event.preventDefault();
      }
    };

    //Attach event listeners
    window.addEventListener('keydown', key.downHandler.bind(key), false);
    window.addEventListener('keyup', key.upHandler.bind(key), false);
    return key;
  }
}
