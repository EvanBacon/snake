import { PIXI } from 'expo-pixi';

export default class BlockFactory {
  static createBlock(
    x,
    y,
    width,
    height,
    backgroundColor,
    borderColor,
    borderWidth,
  ) {
    let block = new PIXI.Container();
    let border = new PIXI.Sprite(getTexture(borderColor));
    border.width = width;
    border.height = height;
    block.addChild(border);
    const background = new PIXI.Sprite(getTexture(backgroundColor));
    background.width = width - 2 * borderWidth;
    background.height = height - 2 * borderWidth;
    background.position.x = borderWidth;
    background.position.y = borderWidth;
    block.addChild(background);
    block.position.x = x;
    block.position.y = y;
    return block;
  }
}

function getTexture(color) {
  if (colorTextures[color] === undefined) {
    var canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.rect(0, 0, 1, 1);
    ctx.fill();
    ctx.closePath();
    colorTextures[color] = PIXI.Texture.fromCanvas(canvas);
  }
  return colorTextures[color];
}

var colorTextures = {};
