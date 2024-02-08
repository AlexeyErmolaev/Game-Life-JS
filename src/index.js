const DEFAULT_X_CELLS_COUNT = 10
const DEFAULT_Y_CELLS_COUNT = 10

let isPlay = false

const area = document.querySelector('.game')
const canvas = document.querySelector('.game__area')

canvas.width = area.offsetWidth
canvas.height = area.offsetHeight;

const xCell = document.querySelector('#x_cell')
const yCell = document.querySelector('#y_cell')

const gameMenuMessage = document.querySelector(".game__mennu__message")
const startBtn = document.querySelector('.button__start')
const randomBtn = document.querySelector('.button__random')
const clearBtn = document.querySelector('.button__clear')

const generationTimeField = document.querySelector('.game__menu__generation-time')
const colorInput = document.querySelector('#cellColor')
const disableGridCheckbox = document.querySelector('#disableGrid')

let x = +xCell.value
let y = +yCell.value
let color = colorInput.value

let cellSize = Math.round(area.offsetWidth / x)

const game = new Game(canvas, { cellSize, x, y, color })

function start () {
  game.start()
  startBtn.classList.add('button__stop')
  startBtn.innerText = 'Stop'
  xCell.disabled = true
  yCell.disabled = true
  isPlay = true
}

function stop () {
  game.stop()
  startBtn.classList.remove('button__stop')
  startBtn.innerText = 'Start'
  xCell.disabled = false
  yCell.disabled = false
  isPlay = false
}

function autoStop () {
  gameMenuMessage.innerText = 'Game over'
  stop()
}

canvas.addEventListener('click', stop)

function setGenerationTime (time) {
  generationTimeField.innerText = `${time}ms`
}

disableGridCheckbox.addEventListener('change', (e) => {
  game.setDisableGrid(e.target.checked)
})

colorInput.addEventListener('change', (e) => {
  color = e.target.value
  game.setCellColor(color)
})

xCell.addEventListener('change', (e) => {
  x = +e.target.value
  game.setX(+e.target.value)
  game.setCellSize(Math.round(area.offsetWidth / x))
  game.clear()
})

yCell.addEventListener('change', (e) => {
  y = +e.target.value
  game.setY(+e.target.value)
  game.setCellSize(Math.round(area.offsetWidth / y))
  game.clear()
})

clearBtn.addEventListener('click', () => {
  stop()
  game.setX(DEFAULT_X_CELLS_COUNT)
  game.setY(DEFAULT_Y_CELLS_COUNT)
  game.clear()
  game.setCellSize(Math.round(area.offsetWidth / DEFAULT_X_CELLS_COUNT))
  
  xCell.value = DEFAULT_X_CELLS_COUNT
  yCell.value = DEFAULT_Y_CELLS_COUNT

  disableGridCheckbox.checked = false
  game.setDisableGrid(false)

  generationTimeField.innerText = ``
  gameMenuMessage.innerText = ''
})

startBtn.addEventListener('click', () => {
  if (isPlay) {
    stop()
  } else {
    start()
    gameMenuMessage.innerText = ''
  }
})

randomBtn.addEventListener('click', () => {
  gameMenuMessage.innerText = ''
  game.addFigure(
    0, 0, Array(y).fill(Array(x).fill(0))
      .map(line => line.map(() => (Math.random() / Math.random()) > 0.3 ? 0 : 1))
  )
})