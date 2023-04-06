import { Controller } from 'stimulus';
import { colors, figures } from '../../figures';

export default class TetrisController extends Controller {
  static targets = ['canvas', 'count'];

  canvas = document.getElementById('game');

  context = this.canvas.getContext('2d');

  sizeCell = 32;

  figuresSequence = [];

  playField = [];

  figure;

  frameAnimation = null;

  gameOver = false;

  count = 0;

  connect() {
    this.generateEmptyCell();
    this.figure = this.nextFigure();
    document.addEventListener('keydown', this.moveFigure);
    requestAnimationFrame(this.gameInit);
  }

  generateEmptyCell = () => {
    for (let row = -2; row < 20; row++) {
      this.playField[row] = [];

      for (let col = 0; col < 14; col++) {
        this.playField[row][col] = 0;
      }
    }
  };

  generateRandomFigure = (min, max) => {
    const minNumber = Math.ceil(min);
    const maxNumber = Math.floor(max);
    return Math.floor(Math.random() * (maxNumber - minNumber + 1) + minNumber);
  };

  generateSequence = () => {
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

    while (sequence.length) {
      const rand = this.generateRandomFigure(0, sequence.length - 1);
      const name = sequence.splice(rand, 1)[0];

      this.figuresSequence.push(name);
    }
  };

  nextFigure = () => {
    if (this.figuresSequence.length === 0) {
      this.generateSequence();
    }

    const name = this.figuresSequence.pop();
    const matrix = figures[name];

    const coll = this.playField[0].length / 2 - Math.ceil(matrix[0].length / 2);
    const row = name === 'I' ? -1 : -2;

    return {
      name,
      matrix,
      row,
      coll,
    };
  };

  rotateFigure = (matrix) => {
    const N = matrix.length - 1;
    return matrix.map((row, i) => row.map((val, j) => matrix[N - j][i]));
  }

  isValidMove = (matrix, cellRow, cellColl) => {
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] && (
          cellColl + col < 0
          || cellColl + col >= this.playField[0].length
          || cellRow + row >= this.playField.length
          || this.playField[cellRow + row][cellColl + col])
        ) {
          return false;
        }
      }
    }
    return true;
  };

  figureSetting = () => {
    for (let row = 0; row < this.figure.matrix.length; row++) {
      for (let col = 0; col < this.figure.matrix[row].length; col++) {
        if (this.figure.matrix[row][col]) {
          if (this.figure.row + row < 0) {
            this.showGameOver();
          }
          this.playField[this.figure.row + row][this.figure.coll + col] = this.figure.name;
        }
      }
    }
    for (let row = this.playField.length - 1; row >= 0;) {
      if (this.playField[row].every((cell) => !!cell)) {
        for (let r = row; r >= 0; r--) {
          for (let c = 0; c < this.playField[r].length; c++) {
            this.playField[r][c] = this.playField[r - 1][c];
          }
        }
      } else {
        row--;
      }
    }
    this.figure = this.nextFigure();
  };

  moveFigure = ((e) => {
    if (this.gameOver) return;

    if (e.keyCode === 37 || e.keyCode === 39) {
      const col = e.keyCode === 37
        ? this.figure.coll - 1
        : this.figure.coll + 1;

      if (this.isValidMove(this.figure.matrix, this.figure.row, col)) {
        this.figure.coll = col;
      }
    }

    if (e.keyCode === 38) {
      const matrix = this.rotateFigure(this.figure.matrix);
      if (this.isValidMove(matrix, this.figure.row, this.figure.coll)) {
        this.figure.matrix = matrix;
      }
    }

    if (e.keyCode === 40) {
      const row = this.figure.row + 1;
      if (!this.isValidMove(this.figure.matrix, row, this.figure.coll)) {
        this.figure.row = row - 1;
        this.figureSetting();
        return;
      }
      this.figure.row = row;
    }
  });

  showGameOver = () => {
    cancelAnimationFrame(this.gameInit);
    this.gameOver = true;

    this.context.fillStyle = 'black';
    this.context.globalAlpha = 0.75;
    this.context.fillRect(0, this.canvas.height / 2 - 30, this.canvas.width, 60);
    this.context.globalAlpha = 1;
    this.context.fillStyle = 'white';
    this.context.font = '36px monospace';
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.fillText('GAME OVER!', this.canvas.width / 2, this.canvas.height / 2);
  };

  buildField = () => {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 15; col++) {
        if (this.playField[row][col]) {
          const name = this.playField[row][col];
          this.context.fillStyle = colors[name];
          this.context.fillRect(
            col * this.sizeCell, row * this.sizeCell, this.sizeCell, this.sizeCell,
          );
        }
      }
    }
  }

  gameInit = () => {
    if (this.gameOver) {
      return;
    }
    this.buildField();
    if (this.figure) {
      if (++this.count > 35) {
        this.figure.row++;
        this.count = 0;
        if (!this.isValidMove(this.figure.matrix, this.figure.row, this.figure.coll)) {
          this.figure.row--;
          this.figureSetting();
        }
      }
      const { name } = this.figure;
      this.context.fillStyle = colors[name];

      for (let row = 0; row < this.figure.matrix.length; row++) {
        for (let col = 0; col < this.figure.matrix[row].length; col++) {
          if (this.figure.matrix[row][col]) {
            this.context.fillRect(
              (this.figure.coll + col) * this.sizeCell,
              (this.figure.row + row) * this.sizeCell,
              this.sizeCell - 1, this.sizeCell - 1,
            );
          }
        }
      }
    }
    this.frameAnimation = requestAnimationFrame(this.gameInit);
  };
}
