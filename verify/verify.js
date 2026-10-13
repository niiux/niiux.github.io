"use strict";
const {el,number,format,lines,metrics,table,bindForm,initPanels} = NT;
initPanels();
function money(value,label='金额') {
 const raw=String(value).trim();
 if(!/^[+-]?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(raw))throw Error(`${label}请填写最多两位小数的金额；千位逗号必须每三位一组。`);
 const clean=raw.replace(/,/g,'');const negative=clean.startsWith('-');const unsigned=clean.replace(/^[+-]/,'');
 const [integer,fraction='']=unsigned.split('.');
 if(integer.replace(/^0+/,'').length>12)throw Error(`${label}的整数部分最多 12 位。`);
 const cents=BigInt(integer)*100n+BigInt(fraction.padEnd(2,'0'));
 return negative?-cents:cents;
}
function moneyText(cents) {
 const negative=cents<0n,abs=negative?-cents:cents;
 return (negative?'-':'')+new Intl.NumberFormat('zh-CN').format(abs/100n)+'.'+String(abs%100n).padStart(2,'0');
}
function csvCell(value) {
 if(typeof value==='number')return String(value);
 let text=String(value);
 // Keep pasted text from becoming a spreadsheet formula on export.
 if(/^[\s]*[=+@-]/.test(text)||/^[\t\r]/.test(text))text="'"+text;
 return '"'+text.replace(/"/g,'""')+'"';
}
function results(out,headers,rows,filename) {
 if(rows.length){table(out,headers,rows.slice(0,200));if(rows.length>200)out.append(el('p',`显示前 200 行，共 ${rows.length} 行；下载可获得完整结果。`,'help'));}
 const button=el('button','下载结果 CSV','action-button secondary');button.type='button';
 button.addEventListener('click',()=>{const csv='\ufeff'+[headers,...rows].map(row=>row.map(csvCell).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const link=el('a');link.href=url;link.download=filename+'.csv';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 const actions=el('div',undefined,'actions');actions.append(button);out.append(actions);
}
function counts(items) {
 const map=new Map();items.forEach((text,index)=>{if(!map.has(text))map.set(text,[]);map.get(text).push(index+1);});return map;
}
bindForm('compare',(form,out)=>{
 const a=lines(form.elements.listA.value),b=lines(form.elements.listB.value),ma=counts(a),mb=counts(b);
 const rows=[...new Set([...ma.keys(),...mb.keys()])].map(text=>[text,ma.get(text)?.length||0,mb.get(text)?.length||0]).filter(row=>row[1]!==row[2]).map(row=>[...row,row[1]-row[2]]);
 metrics(out,[['A 有效行',format(a.length)],['B 有效行',format(b.length)],['次数不一致的项目',format(rows.length)]]);
 out.append(el('p',rows.length?'差异为 A 次数 − B 次数；只列出次数不一致的项目。':'两份清单的项目及出现次数一致；不比较行顺序。','help'));
 results(out,['项目','A 次数','B 次数','次数差异'],rows,'清单比对');
}, {listA:'单据001\n单据002\n单据002\n单据004',listB:'单据001\n单据002\n单据003'});
bindForm('duplicates',(form,out)=>{
 const list=lines(form.elements.list.value),map=counts(list),rows=[...map.entries()].filter(([,indexes])=>indexes.length>1).map(([text,indexes])=>[text,indexes.length,indexes.join('、')]);
 metrics(out,[['有效行',format(list.length)],['不同项目',format(map.size)],['重复项目',format(rows.length)]]);
 out.append(el('p',rows.length?'行号按去掉空行后的有效行从 1 开始计数。':'没有发现重复项目。','help'));
 results(out,['项目','出现次数','有效行序号'],rows,'重复值检查');
}, {list:'供应商A\n供应商B\n供应商A\n供应商C\n供应商B'});
bindForm('reconcile',(form,out)=>{
 const a=lines(form.elements.amountsA.value),b=lines(form.elements.amountsB.value);
 const total=(list,label)=>list.reduce((sum,line,i)=>sum+money(line,`${label} 第 ${i+1} 行`),0n);
 const sumA=total(a,'A'),sumB=total(b,'B'),tolerance=money(form.elements.tolerance.value,'允许差异');
 if(tolerance<0n)throw Error('允许差异不能为负数。');
 const difference=sumA-sumB,abs=difference<0n?-difference:difference;
 metrics(out,[['A 合计（元）',moneyText(sumA)],['B 合计（元）',moneyText(sumB)],['差异 A − B（元）',moneyText(difference)]]);
 out.append(el('p',difference===0n?'金额合计相等。':abs<=tolerance?'差异在允许范围内。':'差异超出允许范围。','note'));
 results(out,['A 有效行','B 有效行','A 合计','B 合计','差异','允许差异'],[[a.length,b.length,moneyText(sumA),moneyText(sumB),moneyText(difference),moneyText(tolerance)]],'金额勾稽');
}, {amountsA:'100.10\n200.20',amountsB:'300.30',tolerance:'0.00'});
function randomBelow(size) {
 const buffer=new Uint32Array(1),limit=Math.floor(4294967296/size)*size;
 do {crypto.getRandomValues(buffer);} while(buffer[0]>=limit);
 return buffer[0]%size;
}
bindForm('sample',(form,out)=>{
 const population=lines(form.elements.population.value),size=number(form.elements.sampleSize.value,'抽取数量',1,10000);
 if(!Number.isInteger(size)||size>population.length)throw Error('抽取数量须为整数，且不能超过总体有效行数。');
 const indexes=Array.from({length:population.length},(_,i)=>i);
 for(let i=0;i<size;i++){const j=i+randomBelow(indexes.length-i);[indexes[i],indexes[j]]=[indexes[j],indexes[i]];}
 const selected=indexes.slice(0,size).sort((a,b)=>a-b),rows=selected.map((index,i)=>[i+1,index+1,population[index]]);
 metrics(out,[['总体有效行',format(population.length)],['抽取数量',format(size)],['抽取比例',format(size/population.length*100)+'%']]);
 out.append(el('p','使用浏览器的密码学随机数进行不放回抽取；输出按原有效行序号排序。再次抽取会产生新的随机结果。','help'));
 results(out,['序号','原有效行序号','样本内容'],rows,'随机样本');
}, {population:'单据001\n单据002\n单据003\n单据004\n单据005\n单据006\n单据007\n单据008',sampleSize:3});
function uppercaseAmount(cents) {
 const digits='零壹贰叁肆伍陆柒捌玖',units=['仟','佰','拾',''],groups=['','万','亿'];
 function groupText(number) {
  const text=String(number).padStart(4,'0');let result='',pending=false;
  [...text].forEach((char,i)=>{const digit=Number(char);if(digit===0){if(result)pending=true;}else{if(pending)result+='零';result+=digits[digit]+units[i];pending=false;}});return result;
 }
 let integer=cents/100n,parts=[];do{parts.push(Number(integer%10000n));integer/=10000n;}while(integer>0n);
 let result='',pending=false;
 for(let i=parts.length-1;i>=0;i--){const part=parts[i];if(!part){if(result)pending=true;continue;}if(result&&(pending||part<1000))result+='零';result+=groupText(part)+groups[i];pending=false;}
 result=(result||'零')+'元';const jiao=Number(cents%100n/10n),fen=Number(cents%10n);
 if(jiao)result+=digits[jiao]+'角';else if(fen&&cents>=100n)result+='零';
 if(fen)result+=digits[fen]+'分';else result+='整';
 return '人民币'+result;
}
bindForm('uppercase',(form,out)=>{
 const cents=money(form.elements.amount.value);
 if(cents<0n)throw Error('金额大写转换请使用非负金额。');
 out.append(el('p',uppercaseAmount(cents),'amount-uppercase'));
 out.append(el('p',`金额：${moneyText(cents)} 元`,'help'));
 const copy=el('button','复制大写','action-button secondary');copy.type='button';const feedback=el('p','', 'copy-feedback');
 copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(uppercaseAmount(cents));feedback.textContent='已复制。';}catch{feedback.textContent='浏览器未允许复制，请选中上方文字手动复制。';}});
 out.append(copy,feedback);
}, {amount:'12345.67'});
