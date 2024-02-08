const NEIGHBOR_CELLS = [
  [-1, -1], [-1, 0], [-1, 1], [1, -1],
  [1, 0], [1, 1], [0, 1], [0, -1]
]

class Game {
  /**
   * Инициализация игры
   *
   * @param canvas игровое поле
   * @param [options]
   * @param [options.cellSize] размер клетки
   * @param [options.x] количество клеток по вертикали
   * @param [options.y] количество клеток по горизонтали
   * @param [options.color] цвет живых клеток
   */
  constructor(canvas, options = {}) {
    this.cellSize = options.cellSize
    this.x = options.x
    this.y = options.y

    this.canvas = canvas;
    this.canvas.addEventListener('click', this.#changePoint.bind(this))

    this.ctx = canvas.getContext('2d')
    this.ctx.fillStyle = options.color || '#000000'

    this.ctx.strokeStyle = "gray"
    this.cache = []
    this.disableGrid = false


    this.clear()
    if (!this.disableGrid) {
      this.#drawGrid()
    }
  }

  /**
   * Сеттер количества клеток по вертикали
   */
  setY(y) {
    this.y = y
  }

  /**
   * Сеттер количества клеток по горизонтали
   */
  setX(x) {
    this.x = x
  }

  /**
   * Сеттер для размера клетки
   */
  setCellSize(cellSize) {
    this.cellSize = cellSize
  }

  /**
   * Сеттер для установки цвета живой клетки
   */
  setCellColor(color) {
    this.color = color
    this.ctx.fillStyle = color
    this.#draw()
  }

  /**
   * Сеттер для отрисовки сетки
   */
  setDisableGrid(value) {
    this.disableGrid = value
    this.#draw()
  }

  /**
   * Отрисовка сетки на поле
   */
  #drawGrid() {
    let buffer = 0;
    for (let i = 0; i <= this.x; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(buffer, 0);
      this.ctx.lineTo(buffer, this.canvas.height);
      this.ctx.stroke();
      buffer += this.cellSize;
    }       
    buffer = 0;
    for (let i = 0; i <= this.y; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, buffer);
      this.ctx.lineTo(this.canvas.width, buffer);
      this.ctx.stroke();
      buffer += this.cellSize;
    }
  }

  /**
   * Меняет цвет клекти на противоположный при клике на клетку
   *
   * @param event
   */
  #changePoint(event) {
    const x = Math.floor((event.pageX - event.currentTarget.offsetLeft) / this.cellSize);
    const y = Math.floor((event.pageY - event.currentTarget.offsetTop) / this.cellSize);

    this.stop();
    this.area[y][x] = !this.area[y][x];
    this.#draw();
  }

  /**
   * Закрашивает клетку
   *
   * @param x
   * @param y
   */
  #fillRect(x, y) {
    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
  }

  /**
   * Отрисовка игрового поля
   */
  #draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.area.forEach((line, y) => line.forEach((cell, x) => cell && this.#fillRect(x, y), this), this);
    if (!this.disableGrid) {
      this.#drawGrid()
    }
  }

  /**
   * Проверка клетки жива ли она
   */
  #isAlive(pointX, pointY) {
    const aliveNeighbors = NEIGHBOR_CELLS.reduce((sum, diff) => { // Считаем количество живых соседних клеток
      let x = pointX - diff[0]
      let y = pointY - diff[1]

      // Эмулируем поверхность тора
      if (x < 0) {
        x = this.x - 1
      }
      if (x > this.x - 1) {
        x = 0
      }
      if (y < 0) {
        y = this.y - 1
      }
      if (y > this.y - 1) {
        y = 0
      }

      if (this.area[y][x]) {
        return sum + this.area[y][x]
      }
      return sum
    }, 0)


    if (this.area[pointY][pointX] && (aliveNeighbors < 2 || aliveNeighbors > 3)) {
      return false
    }
    if (this.area[pointY][pointX]) {
      return aliveNeighbors === 2 || aliveNeighbors === 3
    }
    if (!this.area[pointY][pointX] && aliveNeighbors === 3) {
      return true
    }
  }

  /**
   * Добавление клетки
   */
  addFigure(x, y, matrix) {
    if (x + matrix[0].length > this.x || y + matrix.length > this.y) return

    for (let i = 0; i < matrix.length; i++) {
      const row = this.area[i + y]
      this.area[i + y] = row.slice(0, x).concat(matrix[i], row.slice(matrix[i].length, this.x))
    }

    this.#draw()
  }

  /**
   * Запуск игры
   */
  start(tick) {
    if (this.game) return;

    this.game = setInterval(self => {
      let startTime = new Date().getTime()

      let hasAliveCell = false

      let res = ''
      const newArea = self.area.map((row, y) => {
        return row.map((cell, x) => {
          const isAlive = self.#isAlive(x, y)
          if (isAlive) {
            hasAliveCell = true
            res += `${x}:${y}-`
          }
          return isAlive
        })
      });

      if (!hasAliveCell) {
        autoStop()
        self.clear()
      } else {
        if (this.cache.some(cachedRes => cachedRes === res)) {// если такая комбинация уже была, стопаем игру
          autoStop()
        } else {
          self.area = newArea
        }
        this.cache.push(res)
      }

      self.#draw();

      let endTime = new Date().getTime()
      let resultTime = endTime - startTime
      setGenerationTime(resultTime)
    }, tick || 100, this);
  }

  /**
   * Останавливаем генерацию поколений, чистим интервал и кэш
   */
  stop() {
    if (this.game) {
      clearInterval(this.game)
      this.game = null;
      this.cache = []
    }
  }

  /**
   * Чистим всё поле и вызываем перерисовку поля
   */
  clear() {
    this.area = Array(this.y).fill(0).map(() => Array(this.x).fill(0))
    this.cache = []
    this.setDisableGrid(false)
    this.#draw()
  }
}