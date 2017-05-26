import './style.scss';
import _ from 'lodash';

const TILE_SIDE  = 50;
const FREE_SPACE = 8;
const OFFSET = FREE_SPACE+TILE_SIDE;
const ROWS = 4;
const COLS = 4;

let hiscore = 1000000;
let moves_counter = 0;

const Elements = _.mapValues({
  board:        '#board',
  moves:        '#moves',
  movesSpan:    '#moves-span',
  hiscore:      '#hiscore',
  hiscoreSpan:  '#hiscore-span',
  shuffle:      '#shuffle'
}, queryString => document.querySelector(queryString));

const blink = (element, times = 6) => {
  if (times <= 0) return;
  const visible = times % 2 === 1;
  element.style.visibility = visible ? 'visible' : 'hidden';
  return setTimeout(() => blink(element, times-1), 250);
};

const freeTile = { row: ROWS-1, col: COLS-1 };

const adjacent = (tile1, tile2) => 
  Math.abs(tile1.row-tile2.row) + 
  Math.abs(tile1.col-tile2.col) === 1;

const solved = () => Elements.tiles.every(tile => 
  tile.row == tile.dataset.row && 
  tile.col == tile.dataset.col);

const inBounds = ({row, col}) => 
  _.inRange(row, ROWS) && 
  _.inRange(col, COLS);

const randomTile = () => {
  const {row, col} = freeTile;
  return _.sample([
    {row: row+1, col},
    {row: row-1, col},
    {row, col: col+1},
    {row, col: col-1}
  ].filter(inBounds));
};

const getTile = ({row, col}) => Elements.tiles.find(tile => tile.row == row && tile.col == col);

const moveFrom = (drow, dcol) => {
  const t = {row: freeTile.row+drow, col: freeTile.col+dcol};
  if (inBounds(t)) {
    moveTile(getTile(t));
  }
};

const computeXY = ({row, col}) => ({ dx: col*OFFSET, dy: row*OFFSET });

const swapWith = (tile) => {
  const {dx, dy} = computeXY({
    row: freeTile.row - tile.dataset.row,
    col: freeTile.col - tile.dataset.col
  });
  const {row, col} = freeTile;
  freeTile.row = tile.row;
  freeTile.col = tile.col;
  tile.row = row;
  tile.col = col;
  tile.style.transform = `translate(${dx}px, ${dy}px)`;
};

const moveTile = (tile) => {
  if (!adjacent(freeTile, tile) || solved()) return;
  moves_counter += 1;
  Elements.moves.innerText = moves_counter;
  swapWith(tile);
  if (solved()) {
    blink(Elements.movesSpan);
    if (moves_counter < hiscore) {
      Elements.hiscore.innerText = moves_counter;
      hiscore = moves_counter;
      blink(Elements.hiscoreSpan);
    }
  }
};

const shuffle = () => {
  _.times(ROWS*ROWS*COLS*COLS, () => swapWith(getTile(randomTile())));
  moves_counter = 0;    
  Elements.moves.innerText = moves_counter;
};

const keyLocks = [];

document.addEventListener('keydown', event => {
  if (!keyLocks[event.keyCode]) {
    keyLocks[event.keyCode] = true;
    switch (event.key) {
      case 'ArrowUp':
        moveFrom(1, 0);
        break;
      case 'ArrowDown':
        moveFrom(-1, 0);
        break;
      case 'ArrowLeft':
        moveFrom(0, 1);
        break;
      case 'ArrowRight':
        moveFrom(0, -1);
        break;
      case 'Enter':
        shuffle();
        break;
      default: break;
    }
  }
});

document.addEventListener('keyup', ({keyCode}) => delete keyLocks[keyCode]);

Elements.tiles = 
  _.range(ROWS*COLS - 1).map(i => {
    const row = Math.floor(i / ROWS);
    const col = i % ROWS;
    const tile = document.createElement('div');
    const left = col*OFFSET + FREE_SPACE;
    const top = row*OFFSET + FREE_SPACE;
    tile.className = 'tile';
    tile.innerHTML = `<p>${i+1}</p>`;
    tile.dataset.row = tile.row = row;
    tile.dataset.col = tile.col = col;
    tile.style.left = left + 'px';
    tile.style.top = top + 'px';
    return tile;
  });

Elements.tiles.forEach(tile => Elements.board.appendChild(tile));

Elements.board.addEventListener('click', ({target}) => {
  if (target.className === 'tile') {
    moveTile(target);
  } else if (target.parentElement.className === 'tile') {
    moveTile(target.parentElement);
  }
});

Elements.shuffle.addEventListener('click', (e) => {
  e.preventDefault();
  shuffle();
});