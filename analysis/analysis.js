"use strict";
const {el,number,format,lines,metrics,table,bindForm,initPanels} = NT;
const val=(form,key,label,min,max)=>number(form.elements[key].value,label,min,max);
initPanels();
bindForm('growth',(form,out)=>{
 const previous=val(form,'previous','上期金额',0),current=val(form,'current','本期金额');
 if(previous===0)throw Error('上期金额须大于零；零基数无法计算增长率。');
 metrics(out,[['变动金额',format(current-previous)],['增长率',format((current-previous)/previous*100)+'%']]);
}, {previous:100000,current:125000});
bindForm('budget',(form,out)=>{
 const budget=val(form,'budget','预算金额',0),actual=val(form,'actual','实际金额');
 if(budget===0)throw Error('预算金额须大于零；零预算无法计算差异率。');
 metrics(out,[['金额差异（实际 − 预算）',format(actual-budget)],['差异率',format((actual-budget)/budget*100)+'%']]);
 out.append(el('p',actual===budget?'实际与预算一致。':actual>budget?'实际金额高于预算。':'实际金额低于预算。','help'));
}, {budget:200000,actual:185000});
bindForm('breakeven',(form,out)=>{
 const fixed=val(form,'fixed','固定成本',0),price=val(form,'price','单位售价',0),variable=val(form,'variable','单位变动成本',0);
 if(price<=variable)throw Error('单位售价须高于单位变动成本，才能形成正的贡献毛益。');
 const contribution=price-variable,quantity=fixed/contribution;
 if(!Number.isFinite(quantity)||quantity>1e15)throw Error('结果超出支持范围，请调整金额单位或输入。');
 // Remove tiny floating-point tails before rounding complete units upward.
 const nearest=Math.round(quantity);
 const complete=Math.abs(quantity-nearest)<1e-9?nearest:Math.ceil(quantity);
 metrics(out,[['单位贡献毛益',format(contribution)],['保本销量（完整单位）',format(complete)],['理论保本销售额',format(quantity*price)]]);
 out.append(el('p',`完整单位对应销售额：${format(complete*price)}。不包含所得税、阶梯成本或多产品组合变化。`,'help'));
}, {fixed:50000,price:120,variable:70});
bindForm('npv',(form,out)=>{
 const initial=val(form,'initial','期初投入',0),rate=val(form,'rate','年折现率',-99,1000)/100;
 const flows=lines(form.elements.flows.value,100).map((line,i)=>number(line,`第 ${i+1} 年现金流`));
 let present=0;const rows=flows.map((flow,i)=>{const discounted=flow/(1+rate)**(i+1);present+=discounted;return[i+1,format(flow),format(discounted)];});
 if(!Number.isFinite(present)||Math.abs(present)>1e15)throw Error('折现结果超出支持范围，请调整金额单位或折现率。');
 metrics(out,[['净现值 NPV',format(present-initial)],['未来现金流现值合计',format(present)]]);
 table(out,['年末','现金流','折现现值'],rows);
 out.append(el('p','NPV = 各年末现金流折现值之和 − 期初投入。折现率应与现金流期间、币种和口径匹配。','help'));
}, {initial:100000,rate:8,flows:'35000\n40000\n45000'});
bindForm('trend',(form,out)=>{
 const rows=lines(form.elements.data.value,80).map((line,i)=>{const cells=line.split(/[,，\t]/);if(cells.length!==2||!cells[0].trim())throw Error(`第 ${i+1} 行请使用「期间,金额」两列。`);const label=cells[0].trim();if(label.length>40)throw Error('期间名称最多 40 个字。');return[label,number(cells[1],`第 ${i+1} 行金额`)];});
 if(rows.length<2)throw Error('至少输入两个期间，才能生成趋势图。');
 const values=rows.map(row=>row[1]),total=values.reduce((a,b)=>a+b,0);
 metrics(out,[['期间数量',String(rows.length)],['合计',format(total)],['平均值',format(total/rows.length)]]);
 const ns='http://www.w3.org/2000/svg';const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 720 300');svg.setAttribute('class','chart');svg.setAttribute('role','img');svg.setAttribute('aria-label','按输入顺序排列的金额趋势图；完整数值见下方表格。');
 const min=Math.min(0,...values),max=Math.max(0,...values),range=max-min||1;
 const y=v=>250-(v-min)/range*210,x=i=>80+i*620/(rows.length-1);
 const add=(tag,attrs,text)=>{const node=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,v));if(text!==undefined)node.textContent=text;svg.append(node);return node;};
 add('line',{x1:80,y1:y(0),x2:700,y2:y(0),stroke:'#ccd9cf'});
 [min,max].forEach(v=>add('text',{x:72,y:y(v)+4,'text-anchor':'end',fill:'#526158','font-size':12},format(v)));
 add('polyline',{points:rows.map((r,i)=>`${x(i)},${y(r[1])}`).join(' '),fill:'none',stroke:'#27744f','stroke-width':3});
 rows.forEach((r,i)=>{add('circle',{cx:x(i),cy:y(r[1]),r:3,fill:'#235b40'});if(i===0||i===rows.length-1||rows.length<=6)add('text',{x:x(i),y:280,'text-anchor':i===rows.length-1?'end':i===0?'start':'middle',fill:'#526158','font-size':12},r[0].slice(0,10));});
 out.append(svg);table(out,['期间','金额'],rows.map(r=>[r[0],format(r[1])]));
}, {data:'1月,120000\n2月,145000\n3月,138000\n4月,167000\n5月,182000\n6月,195000'});
