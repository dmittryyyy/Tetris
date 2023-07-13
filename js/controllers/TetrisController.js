import { Controller } from 'stimulus';
import { colors } from '../helpers/colors';
import { tetrominos } from '../helpers/figures';

export default class TetrisController extends Controller {
 static targets = ['field', 'loss', 'score', 'next', 'pause'];

 connect() {
   this.createGrid();
   this.createDOMCells();
   this.gameLoop();
   window.addEventListener('keydown', this.keyPressed);
   window.addEventListener('keyup', () => {
     this.keyHold = false;
   });
   window.addEventListener('click', this.restartGame);
 }

  gameWidth = 12;

  gameHeight = 18;

  startSpeed = 25;

  grid = [];

  currentPiece = Math.floor(Math.random() * 7);

  nextPiece = Math.floor(Math.random() * 7);

  currentX = this.gameWidth / 2;

  currentY = 0;

  currentRotation = 0;

  keyHold = false;

  gameTick = false;

  speed = this.startSpeed;

  counter = 0;

  fullLines = [];

  pieceCount = 1;

  gameOver = false;

  score = 0;

  linesCount = 0;

  bkgCount = 0;

  isPaused = false;

  async gameLoop() {
    if (!this.gameOver && !this.isPaused) {
      this.drawGrid();
      this.drawCurrentPiece();
      await this.sleep(50);
      this.gameTick = false;
      this.counter++;
      if (this.counter === this.speed) {
        this.counter = 0;
        if (this.pieceFits(
          this.currentPiece, this.currentX, this.currentY + 1, this.currentRotation,
        )) {
          this.currentY++;
        } else {
          for (let px = 0; px < 4; px++) {
            for (let py = 0; py < 4; py++) {
              if (tetrominos[this.currentPiece][this.rotate(px, py, this.currentRotation)] === 'X') {
                this.grid[
                  (this.currentY + py) * this.gameWidth + (this.currentX + px)
                ] = this.currentPiece;
              }
            }
          }

          this.score += 5;
          this.scoreTarget.innerHTML = `SCORE: ${this.score}`;
          for (let py = 0; py < 4; py++) {
            if (this.currentY + py < this.gameHeight - 1) {
              let isLine = true;
              for (let px = 1; px < this.gameWidth - 1; px++) {
                isLine &= this.grid[(this.currentY + py) * this.gameWidth + px] !== 7;
              }
              if (isLine) {
                for (let px = 1; px < this.gameWidth - 1; px++) {
                  this.grid[(this.currentY + py) * this.gameWidth + px] = 9;
                  this.fieldTarget.children[(this.currentY + py) * this.gameWidth + px].classList.add('remove');
                }
                this.fullLines.push(this.currentY + py);
                this.linesCount++;
              }
            }
          }

          if (this.fullLines.length) {
            const bonus = 0.2 * this.fullLines.length;
            this.score += this.fullLines.length * 50 * (1 + bonus);
            this.scoreTarget.innerHTML = `SCORE: ${this.score}`;
            this.drawGrid();
            await this.sleep(250);

            this.fullLines.forEach((line) => {
              for (let px = 1; px < this.gameWidth - 1; px++) {
                for (let py = line; py > 0; py--) {
                  this.fieldTarget.children[py * this.gameWidth + px].classList.remove('remove');
                }
              }
            });
            await this.sleep(250);

            this.fullLines.forEach((line) => {
              for (let px = 1; px < this.gameWidth - 1; px++) {
                for (let py = line; py > 0; py--) {
                  this.grid[py * this.gameWidth + px] = this.grid[(py - 1) * this.gameWidth + px];
                  this.grid[px] = 7;
                }
              }
            });
            this.fullLines = [];
          }
          this.currentPiece = this.nextPiece;
          this.nextPiece = Math.floor(Math.random() * 7);
          this.currentX = this.gameWidth / 2;
          this.currentY = 0;
          this.currentRotation = 0;
          this.drawNextPiece();
          if (!this.pieceFits(
            this.currentPiece, this.currentX, this.currentY, this.currentRotation,
          )) {
            this.gameOver = true;
            this.drawCurrentPiece();
          }
        }
      }
      if (this.linesCount > 0 && this.linesCount % 10 === 0) {
        this.speed -= 3;
        if (this.speed <= 0) {
          this.speed = 1;
        }
        this.linesCount = 0;
        document.body.classList.remove(`bkg-${this.bkgCount % 10}`);
        this.bkgCount++;
        document.body.classList.add(`bkg-${this.bkgCount % 10}`);
      }

      await this.gameLoop();
    } else if (this.gameOver) {
      this.lossTarget.classList.remove('hidden');
    }
  }

  rotate(px, py, r) {
    let pIndex = 0;
    switch (r % 4) {
      case 0:
        pIndex = py * 4 + px;
        break;
      case 1:
        pIndex = 12 + py - (px * 4);
        break;
      case 2:
        pIndex = 15 - (py * 4) - px;
        break;
      case 3:
        pIndex = 3 - py + (px * 4);
        break;
    }
    return pIndex;
  }

  createGrid = () => {
    for (let x = 0; x < this.gameWidth; x++) {
      for (let y = 0; y < this.gameHeight; y++) {
        this.grid[
          y * this.gameWidth + x
        ] = (x === 0 || x === this.gameWidth - 1 || y === this.gameHeight - 1) ? 8 : 7;
      }
    }
  }

  createDOMCells = () => {
    const cellSize = `${95 / (this.gameHeight)}vmin`;
    this.fieldTarget.style.gridTemplateColumns = `0px repeat(${this.gameWidth - 2}, ${cellSize}) 0px`;
    this.fieldTarget.style.gridTemplateRows = `repeat(${this.gameHeight - 1}, ${cellSize}) 0px`;
    for (let x = 0; x < this.gameWidth; x++) {
      for (let y = 0; y < this.gameHeight; y++) {
        const cell = document.createElement('div');
        cell.style.width = cell.style.height = cellSize;
        this.fieldTarget.appendChild(cell);
      }
    }
    this.nextTarget.style.gridTemplateColumns = `repeat(4, ${50 / this.gameHeight}vmin)`;
    this.nextTarget.style.gridRows = `repeat(4, ${50 / this.gameHeight}vmin)`;
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        const cell = document.createElement('div');
        cell.style.width = cell.style.height = `${50 / this.gameHeight}vmin`;
        this.nextTarget.appendChild(cell);
      }
    }
    this.scoreTarget.innerHTML = `SCORE: ${this.score}`;
    document.body.classList.add('bkg-0');
    this.drawNextPiece();
  }

  drawGrid = () => {
    for (let x = 0; x < this.gameWidth; x++) {
      for (let y = 0; y < this.gameHeight; y++) {
        if (x === 0 || x === this.gameWidth - 1) {
          this.fieldTarget.children[y * this.gameWidth + x].style.width = '0px';
        } else if (y === this.gameHeight - 1) {
          this.fieldTarget.children[y * this.gameWidth + x].style.height = '0px';
        } else {
          this.fieldTarget.children[y * this.gameWidth + x]
            .style.backgroundColor = colors[this.grid[y * this.gameWidth + x]];
          if (this.grid[y * this.gameWidth + x] !== 7) {
            this.fieldTarget.children[y * this.gameWidth + x].classList.add('piece');
          } else if (this.fieldTarget.children[y * this.gameWidth + x].classList.contains('piece')) {
            this.fieldTarget.children[y * this.gameWidth + x].classList.remove('piece');
          }
        }
      }
    }
  }

  drawCurrentPiece = () => {
    for (let px = 0; px < 4; px++) {
      for (let py = 0; py < 4; py++) {
        if (tetrominos[this.currentPiece][this.rotate(px, py, this.currentRotation)] === 'X') {
          this.fieldTarget.children[(this.currentY + py) * this.gameWidth + (this.currentX + px)]
            .style.backgroundColor = colors[this.currentPiece];
          this.fieldTarget.children[(this.currentY + py) * this.gameWidth + (this.currentX + px)]
            .classList.add('piece');
        }
      }
    }
  }

  drawNextPiece = () => {
    for (let px = 0; px < 4; px++) {
      for (let py = 0; py < 4; py++) {
        this.nextTarget.children[py * 4 + px].style.backgroundColor = 'rgba(255, 255, 255, 0)';
        if (tetrominos[this.nextPiece][4 * py + px] === 'X') {
          this.nextTarget.children[py * 4 + px].style.backgroundColor = colors[this.nextPiece];
        }
      }
    }
  }

  dropPiece = () => {
    while (this.pieceFits(
      this.currentPiece, this.currentX, this.currentY + 1, this.currentRotation,
    )) {
      this.currentY++;
    }
  }

  pieceFits(piece, posX, posY, rotation) {
    for (let px = 0; px < 4; px++) {
      for (let py = 0; py < 4; py++) {
        const pIndex = this.rotate(px, py, rotation);
        const gIndex = (posY + py) * this.gameWidth + (posX + px);

        if (posX + px >= 0 && posX + px < this.gameWidth) {
          if (posY + py >= 0 && posY + py < this.gameHeight) {
            if (tetrominos[piece][pIndex] === 'X' && this.grid[gIndex] !== 7) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }

  keyPressed = async (e) => {
    const code = e.keyCode;
    switch (code) {
      case 37: // Left Arrow
        if (!this.gameTick && this.pieceFits(
          this.currentPiece, this.currentX - 1, this.currentY, this.currentRotation,
        )) {
          this.currentX--;
          this.gameTick = true;
        }
        break;
      case 39: // Right Arrow
        if (!this.gameTick && this.pieceFits(
          this.currentPiece, this.currentX + 1, this.currentY, this.currentRotation,
        )) {
          this.currentX++;
          this.gameTick = true;
        }
        break;
      case 38: // Up Arrow
        if (!this.keyHold && !this.gameTick && this.pieceFits(
          this.currentPiece, this.currentX, this.currentY, this.currentRotation + 1,
        )) {
          this.currentRotation++;
          this.keyHold = true;
          this.gameTick = true;
        }
        break;
      case 40: // Down Arrow
        if (!this.gameTick && this.pieceFits(
          this.currentPiece, this.currentX, this.currentY + 1, this.currentRotation,
        )) {
          this.currentY++;
          this.gameTick = true;
        }
        break;
      case 27: // Escape
        if (this.isPaused) {
          this.isPaused = false;
          this.pauseTarget.classList.add('hidden');
          await this.gameLoop();
        } else {
          this.isPaused = true;
          this.pauseTarget.classList.remove('hidden');
        }
        break;
      case 32: // SPACE
        this.dropPiece();
        break;
    }
  }

  restartGame = async () => {
    if (this.gameOver) {
      this.pieceCount = 0;
      this.score = 0;
      this.scoreTarget.innerHTML = `SCORE: ${this.score}`;
      this.speed = this.startSpeed;
      this.fieldTarget.classList.add('hidden');
      this.grid = [];
      this.gameOver = false;
      this.currentPiece = Math.floor(Math.random() * 7);
      this.nextPiece = Math.floor(Math.random() * 7);
      setTimeout(() => {
        this.drawNextPiece();
        this.gameLoop();
      }, 500);
      this.collapseGrid();
      this.createGrid();
    }
  }

  collapseGrid = () => {
    for (let x = 0; x < this.gameWidth; x++) {
      for (let y = 0; y < this.gameHeight; y++) {
        this.fieldTarget.children[y * this.gameWidth + x].style = 'opacity: 0';
      }
    }
    for (let x = 0; x < this.gameWidth; x++) {
      for (let y = 0; y < this.gameHeight; y++) {
        this.fieldTarget.children[y * this.gameWidth + x].style = 'opacity: 1';
      }
    }
  }

  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
}
