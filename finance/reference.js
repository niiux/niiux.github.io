"use strict";
const search = document.getElementById("search");
const cards = [...document.querySelectorAll(".resource-link")];
const buttons = [...document.querySelectorAll("[data-filter]")];
const official = document.getElementById("official-section");
let category = "all";
function filter() {
 const keyword = search.value.trim().toLocaleLowerCase();
 const counts = {featured:0,official:0};
 cards.forEach(card => {
  const text = (card.textContent + ' ' + (card.dataset.keywords || '')).toLocaleLowerCase();
  const show = (category === "all" || card.dataset.kind === category) && text.includes(keyword);
  card.hidden = !show; if(show) counts[card.dataset.kind]++;
 });
 document.getElementById("count").textContent = `找到 ${counts.featured} 个精选资源，${counts.official} 个官方入口`;
 document.getElementById("official-count").textContent = counts.official;
 document.getElementById("featured-section").hidden = counts.featured === 0;
 official.hidden = counts.official === 0;
 if(counts.official && (keyword || category === 'official')) official.open = true;
 document.getElementById("empty").hidden = counts.featured + counts.official !== 0;
}
buttons.forEach(button => button.addEventListener("click", () => {
 category = button.dataset.filter;
 buttons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
 filter();
}));
search.addEventListener("input", filter);
filter();
