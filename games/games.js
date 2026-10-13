"use strict";
const board = document.getElementById("board");
const statusLine = document.getElementById("status");
const result = document.getElementById("result");
const kind = document.body.dataset.game;
let moves = 0, matched = 0, chosen = [], locked = false, timer = null, lights = [], won = false;
function shuffle(values) {
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}
function around(index) {
  const row = Math.floor(index / 4), col = index % 4;
  return [index, row > 0 ? index - 4 : -1, row < 3 ? index + 4 : -1, col > 0 ? index - 1 : -1, col < 3 ? index + 1 : -1].filter(i => i >= 0);
}
function updateLights() {
  [...board.children].forEach((button, i) => {
    button.classList.toggle("on", lights[i]);
    button.textContent = lights[i] ? "●" : "○";
    button.setAttribute("aria-pressed", String(lights[i]));
    button.setAttribute("aria-label", `第 ${Math.floor(i / 4) + 1} 行，第 ${i % 4 + 1} 列，${lights[i] ? "亮" : "灭"}`);
  });
  statusLine.textContent = `已点 ${moves} 次`;
}
function selectCard(button, icon, index) {
  if (locked || button.classList.contains("revealed") || button.classList.contains("matched")) return;
  button.textContent = icon;
  button.classList.add("revealed");
  button.setAttribute("aria-label", `卡片 ${index + 1}：${icon}`);
  chosen.push({ button, icon, index });
  if (chosen.length < 2) return;
  moves++;
  if (chosen[0].icon === chosen[1].icon) {
    chosen.forEach(card => { card.button.classList.add("matched"); card.button.setAttribute("aria-label", `卡片 ${card.index + 1}：${card.icon}，已配对`); });
    chosen = [];
    matched++;
    if (matched === 6) result.textContent = `全部配对成功！用了 ${moves} 次尝试，再玩一局？`;
  } else {
    locked = true;
    timer = setTimeout(() => {
      chosen.forEach(card => { card.button.textContent = "?"; card.button.classList.remove("revealed"); card.button.setAttribute("aria-label", `卡片 ${card.index + 1}，未翻开`); });
      chosen = []; locked = false; timer = null;
    }, 900);
  }
  statusLine.textContent = `已配对 ${matched} / 6 · 尝试 ${moves} 次`;
}
function start() {
  clearTimeout(timer); timer = null;
  moves = 0; matched = 0; chosen = []; locked = false; won = false;
  board.replaceChildren(); result.textContent = "";
  if (kind === "memory") {
    const icons = ["🍋", "🌸", "🍀", "🐳", "🍓", "🦋"];
    shuffle([...icons, ...icons]).forEach((icon, index) => {
      const button = document.createElement("button");
      button.type = "button"; button.className = "tile"; button.textContent = "?";
      button.setAttribute("aria-label", `卡片 ${index + 1}，未翻开`);
      button.addEventListener("click", () => selectCard(button, icon, index));
      board.append(button);
    });
    statusLine.textContent = "已配对 0 / 6 · 尝试 0 次";
  } else {
    do {
      lights = Array(16).fill(false);
      shuffle(Array.from({ length: 16 }, (_, i) => i)).slice(0, 8).forEach(index => around(index).forEach(i => lights[i] = !lights[i]));
    } while (!lights.some(Boolean));
    lights.forEach((_, index) => {
      const button = document.createElement("button"); button.type = "button"; button.className = "tile";
      button.addEventListener("click", () => {
        if (won) return;
        around(index).forEach(i => lights[i] = !lights[i]);
        moves++; updateLights();
        if (!lights.some(Boolean)) { won = true; result.textContent = `全部熄灭，过关了！用了 ${moves} 次点击。`; }
      });
      board.append(button);
    });
    updateLights();
  }
}
document.getElementById("restart").addEventListener("click", start);
start();
