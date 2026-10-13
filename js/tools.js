"use strict";
window.NT = (() => {
 const el = (tag, text, className) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; };
 function number(value, label, min = -1e15, max = 1e15) {
  const raw = String(value).trim();
  if (!raw || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(raw)) throw Error(`${label}请填写有效数字。`);
  const result = Number(raw);
  if (!Number.isFinite(result) || result < min || result > max) throw Error(`${label}应在 ${min} 至 ${max} 之间。`);
  return result;
 }
 const format = value => new Intl.NumberFormat('zh-CN', {maximumFractionDigits:2}).format(value);
 function lines(text, max = 10000) {
  const list = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (!list.length) throw Error('请先输入数据。');
  if (list.length > max) throw Error(`最多支持 ${max} 行数据。`);
  return list;
 }
 function metrics(output, items) {
  const dl = el('dl', undefined, 'metrics');
  items.forEach(([label,value]) => { const box=el('div',undefined,'metric'); box.append(el('dt',label),el('dd',value));dl.append(box); });
  output.append(dl);
 }
 function table(output, headers, rows) {
  const wrap=el('div',undefined,'table-wrap'), t=el('table'), head=el('thead'), hr=el('tr');
  headers.forEach(label=>{const th=el('th',label);th.scope='col';hr.append(th);});head.append(hr);t.append(head);
  const body=el('tbody');rows.forEach(row=>{const tr=el('tr');row.forEach(value=>tr.append(el('td',String(value))));body.append(tr);});t.append(body);wrap.append(t);output.append(wrap);
 }
 function bindForm(id, calculate, example) {
  const form=document.getElementById(id), output=form.querySelector('.output');
  form.addEventListener('input',()=>output.replaceChildren());
  form.addEventListener('submit',event=>{event.preventDefault();output.replaceChildren();try {calculate(form,output);} catch(error){output.replaceChildren(el('p',error.message,'error'));}});
  form.querySelector('[data-example]')?.addEventListener('click',()=>{Object.entries(example).forEach(([key,value])=>{form.elements[key].value=value;});form.requestSubmit();});
 }
 function initPanels() {
  const buttons=[...document.querySelectorAll('[data-tool]')], panels=[...document.querySelectorAll('[data-panel]')];
  buttons.forEach(button=>button.addEventListener('click',()=>{buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));panels.forEach(panel=>panel.hidden=panel.dataset.panel!==button.dataset.tool);}));
 }
 return {el,number,format,lines,metrics,table,bindForm,initPanels};
})();
