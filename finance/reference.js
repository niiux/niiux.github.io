"use strict";
const search = document.getElementById("search");
const cards = [...document.querySelectorAll(".source-card")];
const buttons = [...document.querySelectorAll("[data-filter]")];
let category = "all";
function filter() {
 const keyword = search.value.trim().toLocaleLowerCase();
 let count = 0;
 cards.forEach(card => {
  const show = (category === "all" || card.dataset.category === category) && card.textContent.toLocaleLowerCase().includes(keyword);
  card.hidden = !show; if (show) count++;
 });
 document.getElementById("count").textContent = `显示 ${count} / ${cards.length} 个入口`;
 document.getElementById("empty").hidden = count !== 0;
}
buttons.forEach(button => button.addEventListener("click", () => {
 category = button.dataset.filter;
 buttons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
 filter();
}));
search.addEventListener("input", filter);
filter();
