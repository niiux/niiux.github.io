"use strict";
const cards = document.getElementById("cards");
const answer = document.getElementById("answer");
for (let bit = 0; bit < 6; bit++) {
  const weight = 2 ** bit;
  const card = document.createElement("label");
  card.className = "number-card";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox"; checkbox.value = String(weight);
  checkbox.name = "card"; checkbox.setAttribute("aria-label", `我的数字在第 ${bit + 1} 张卡片里`);
  const panel = document.createElement("span"); panel.className = "number-panel";
  const title = document.createElement("span"); title.className = "number-heading"; title.textContent = `卡片 ${bit + 1}`;
  const numbers = document.createElement("span"); numbers.className = "numbers";
  for (let number = 1; number <= 63; number++) {
    if (number & weight) { const item = document.createElement("span"); item.textContent = String(number); numbers.append(item); }
  }
  const choice = document.createElement("span"); choice.className = "number-choice"; choice.textContent = "我的数字在这里";
  panel.append(title, numbers, choice); card.append(checkbox, panel); cards.append(card);
  checkbox.addEventListener("change", () => { answer.textContent = ""; });
}
document.getElementById("guess-form").addEventListener("submit", event => {
  event.preventDefault();
  const number = [...cards.querySelectorAll("input:checked")].reduce((sum, input) => sum + Number(input.value), 0);
  answer.textContent = number ? `你心里的数字是 ${number}！` : "先勾选包含你心中数字的卡片；每个 1～63 的数字至少在一张卡片中。";
});
document.getElementById("guess-form").addEventListener("reset", () => { answer.textContent = ""; });
