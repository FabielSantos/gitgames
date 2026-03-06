/**
 * Git Games – Tetris (jogo funcional na homepage)
 */
(function () {
  var COLS = 10;
  var ROWS = 20;
  var BLOCK = 30;
  var COLORS = [
    null,
    "#58a6ff", // I
    "#3fb950", // S
    "#a371f7", // Z
    "#d29922", // O
    "#f85149", // T
    "#79c0ff", // J
    "#db61a2", // L
  ];

  var SHAPES = [
    null,
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
    [[2, 2, 0], [0, 2, 2], [0, 0, 0]],                       // S
    [[0, 3, 3], [3, 3, 0], [0, 0, 0]],                       // Z
    [[4, 4], [4, 4]],                                         // O
    [[0, 5, 0], [5, 5, 5], [0, 0, 0]],                       // T
    [[0, 0, 6], [6, 6, 6], [0, 0, 0]],                       // J
    [[7, 0, 0], [7, 7, 7], [0, 0, 0]],                       // L
  ];

  var canvas = document.getElementById("tetris-canvas");
  var nextCanvas = document.getElementById("tetris-next");
  var startBtn = document.getElementById("tetris-start");
  var scoreEl = document.getElementById("tetris-score");
  var levelEl = document.getElementById("tetris-level");
  var linesEl = document.getElementById("tetris-lines");

  if (!canvas || !nextCanvas || !startBtn) return;

  var ctx = canvas.getContext("2d");
  var nextCtx = nextCanvas.getContext("2d");
  var grid = [];
  var current = null;
  var nextPiece = null;
  var score = 0;
  var level = 1;
  var lines = 0;
  var running = false;
  var lastTime = 0;
  var dropInterval = 1000;
  var animationId = null;

  function createGrid() {
    var g = [];
    for (var r = 0; r < ROWS; r++) {
      g[r] = [];
      for (var c = 0; c < COLS; c++) g[r][c] = 0;
    }
    return g;
  }

  function randomPiece() {
    var id = 1 + Math.floor(Math.random() * 7);
    var shape = SHAPES[id].map(function (row) { return row.slice(); });
    return { id: id, shape: shape, row: 0, col: Math.floor((COLS - shape[0].length) / 2) };
  }

  function drawBlock(ctx, x, y, color, size) {
    var s = size || BLOCK;
    ctx.fillStyle = color;
    ctx.fillRect(x * s + 1, y * s + 1, s - 2, s - 2);
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(x * s + 2, y * s + 2, s - 4, 2);
  }

  function drawGrid() {
    var scale = BLOCK;
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        if (grid[r][c]) {
          drawBlock(ctx, c, r, COLORS[grid[r][c]], scale);
        }
      }
    }
  }

  function drawPiece(p, offR, offC, scale) {
    scale = scale || BLOCK;
    var s = p.shape;
    for (var r = 0; r < s.length; r++) {
      for (var c = 0; c < s[r].length; c++) {
        if (s[r][c]) {
          drawBlock(ctx, p.col + c + (offC || 0), p.row + r + (offR || 0), COLORS[p.id], scale);
        }
      }
    }
  }

  function drawNext() {
    nextCtx.fillStyle = "#161b22";
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (!nextPiece) return;
    var s = nextPiece.shape;
    var cell = 20;
    var offsetX = (nextCanvas.width - s[0].length * cell) / 2 / cell;
    var offsetY = (nextCanvas.height - s.length * cell) / 2 / cell;
    for (var r = 0; r < s.length; r++) {
      for (var c = 0; c < s[r].length; c++) {
        if (s[r][c]) {
          nextCtx.fillStyle = COLORS[nextPiece.id];
          nextCtx.fillRect((c + offsetX) * cell + 1, (r + offsetY) * cell + 1, cell - 2, cell - 2);
        }
      }
    }
  }

  function rotate(p) {
    var n = p.shape.length;
    var m = p.shape[0].length;
    var out = [];
    for (var c = 0; c < m; c++) {
      out[c] = [];
      for (var r = n - 1; r >= 0; r--) out[c].push(p.shape[r][c]);
    }
    return { id: p.id, shape: out, row: p.row, col: p.col };
  }

  function collide(p, dr, dc) {
    var s = p.shape;
    for (var r = 0; r < s.length; r++) {
      for (var c = 0; c < s[r].length; c++) {
        if (!s[r][c]) continue;
        var nr = p.row + r + dr;
        var nc = p.col + c + dc;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return true;
        if (grid[nr] && grid[nr][nc]) return true;
      }
    }
    return false;
  }

  function merge() {
    var s = current.shape;
    for (var r = 0; r < s.length; r++) {
      for (var c = 0; c < s[r].length; c++) {
        if (s[r][c]) {
          var gr = current.row + r;
          var gc = current.col + c;
          if (gr >= 0 && gr < ROWS && gc >= 0 && gc < COLS) grid[gr][gc] = current.id;
        }
      }
    }
  }

  function clearLines() {
    var cleared = 0;
    for (var r = ROWS - 1; r >= 0; r--) {
      var full = true;
      for (var c = 0; c < COLS; c++) if (!grid[r][c]) { full = false; break; }
      if (full) {
        grid.splice(r, 1);
        grid.unshift(Array(COLS).fill(0));
        cleared++;
        r++;
      }
    }
    if (cleared > 0) {
      var points = [0, 100, 300, 500, 800];
      score += (points[cleared] || 800) * level;
      lines += cleared;
      level = Math.floor(lines / 10) + 1;
      dropInterval = Math.max(100, 1000 - (level - 1) * 80);
    }
  }

  function spawn() {
    current = nextPiece || randomPiece();
    nextPiece = randomPiece();
    drawNext();
    if (collide(current, 0, 0)) {
      running = false;
      if (animationId) cancelAnimationFrame(animationId);
      startBtn.disabled = false;
      startBtn.textContent = "Jogar de novo";
    }
  }

  function tick() {
    if (!current || !running) return;
    if (collide(current, 1, 0)) {
      merge();
      clearLines();
      spawn();
    } else {
      current.row++;
    }
    updateUI();
    render();
  }

  function render() {
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    if (current) drawPiece(current);
  }

  function updateUI() {
    if (scoreEl) scoreEl.textContent = score;
    if (levelEl) levelEl.textContent = level;
    if (linesEl) linesEl.textContent = lines;
  }

  function loop(now) {
    if (!running) return;
    animationId = requestAnimationFrame(loop);
    if (lastTime === 0) lastTime = now;
    var delta = now - lastTime;
    if (delta >= dropInterval) {
      lastTime = now;
      tick();
    }
  }

  function start() {
    grid = createGrid();
    score = 0;
    level = 1;
    lines = 0;
    dropInterval = 1000;
    lastTime = 0;
    nextPiece = null;
    current = null;
    running = true;
    startBtn.disabled = true;
    startBtn.textContent = "Jogando...";
    spawn();
    updateUI();
    render();
    canvas.focus();
    animationId = requestAnimationFrame(loop);
  }

  function move(dc) {
    if (!current || !running) return;
    if (!collide(current, 0, dc)) {
      current.col += dc;
      render();
    }
  }

  function rotateCurrent() {
    if (!current || !running) return;
    var rotated = rotate(current);
    if (!collide(rotated, 0, 0)) {
      current = rotated;
      render();
    }
  }

  function softDrop() {
    if (!current || !running) return;
    if (!collide(current, 1, 0)) {
      current.row++;
      score += 1;
      updateUI();
      render();
    }
  }

  function hardDrop() {
    if (!current || !running) return;
    while (!collide(current, 1, 0)) {
      current.row++;
      score += 2;
    }
    merge();
    clearLines();
    spawn();
    updateUI();
    render();
  }

  canvas.addEventListener("keydown", function (e) {
    if (!running) return;
    e.preventDefault();
    switch (e.key) {
      case "ArrowLeft":
      case "a":
      case "A":
        move(-1);
        break;
      case "ArrowRight":
      case "d":
      case "D":
        move(1);
        break;
      case "ArrowDown":
      case "s":
      case "S":
        softDrop();
        break;
      case "ArrowUp":
      case "w":
      case "W":
        rotateCurrent();
        break;
      case " ":
        e.preventDefault();
        hardDrop();
        break;
    }
  });

  startBtn.addEventListener("click", start);

  updateUI();
  render();
  drawNext();
})();
