/* Shared tool functions for ToolBox (EN). Each page loads this + calls its init. */

/* QR */
let qrIns=null;
function genQR(){
  const t=document.getElementById('qrText').value||' ';
  const box=document.getElementById('qrcode'); if(!box)return; box.innerHTML='';
  qrIns=new QRCode(box,{text:t,width:200,height:200,colorDark:'#1f2430',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});
}
function dlQR(){
  const c=document.querySelector('#qrcode img')||document.querySelector('#qrcode canvas');
  if(!c)return; const a=document.createElement('a');
  a.href=c.src||c.toDataURL('image/png'); a.download='qrcode.png'; a.click();
}

/* Image */
function compressImg(){
  const f=document.getElementById('imgFile').files[0]; if(!f)return;
  const q=parseFloat(document.getElementById('quality').value);
  const rd=new FileReader();
  rd.onload=e=>{
    const im=new Image();
    im.onload=()=>{
      const cv=document.getElementById('cv'); const maxW=1200;
      let w=im.width,h=im.height; if(w>maxW){h=h*maxW/w;w=maxW;}
      cv.width=w; cv.height=h; cv.getContext('2d').drawImage(im,0,0,w,h);
      cv.toBlob(b=>{
        const before=f.size, after=b.size;
        document.getElementById('imgInfo').innerHTML=
          `Original: ${(before/1024).toFixed(1)} KB → Compressed: ${(after/1024).toFixed(1)} KB (saved ${((1-after/before)*100).toFixed(0)}%)`;
        document.getElementById('dlImg').style.display='inline-block';
        cv.dataset.blob=URL.createObjectURL(b);
      }, 'image/jpeg', q);
    };
    im.src=e.target.result;
  };
  rd.readAsDataURL(f);
}
function dlImg(){
  const cv=document.getElementById('cv');
  const a=document.createElement('a'); a.href=cv.dataset.blob; a.download='compressed.jpg'; a.click();
}

/* Tip */
function calcTip(){
  const bill=+document.getElementById('tipBill').value||0;
  const pct=+document.getElementById('tipPct').value||0;
  const people=Math.max(1,+document.getElementById('tipPeople').value||1);
  const tip=bill*pct/100, total=bill+tip;
  document.getElementById('tipOut').innerHTML=
    `Tip: <b>${tip.toFixed(2)}</b> · Total: <b>${total.toFixed(2)}</b><br>
     <span class="big">${ (total/people).toFixed(2) }</span> per person (tip ${ (tip/people).toFixed(2) })`;
}

/* Unit converter */
const UNITS={
  len:{Meter:1,Kilometer:1000,Centimeter:0.01,Mile:1609.34,Foot:0.3048,Inch:0.0254},
  weight:{Kilogram:1,Gram:0.001,Pound:0.453592,Ounce:0.0283495,Jin:0.5},
  temp:null
};
function initConv(){
  const t=document.getElementById('convType').value;
  const from=document.getElementById('convFrom'), to=document.getElementById('convTo');
  from.innerHTML=''; to.innerHTML='';
  if(t!=='temp'){
    Object.keys(UNITS[t]).forEach(k=>{ from.add(new Option(k,k)); to.add(new Option(k,k)); });
    to.selectedIndex=1;
  }else{
    ['Celsius','Fahrenheit','Kelvin'].forEach(k=>{from.add(new Option(k,k));to.add(new Option(k,k));});
    to.selectedIndex=1;
  }
}
function conv(){
  const t=document.getElementById('convType').value;
  const v=parseFloat(document.getElementById('convVal').value)||0;
  const f=document.getElementById('convFrom').value, to=document.getElementById('convTo').value;
  let res;
  if(t==='temp'){
    let c = f==='Celsius'?v : f==='Fahrenheit'?(v-32)*5/9 : v-273.15;
    res = to==='Celsius'?c : to==='Fahrenheit'?c*9/5+32 : c+273.15;
  }else{
    const base=v*UNITS[t][f]; res=base/UNITS[t][to];
  }
  document.getElementById('convOut').innerHTML=`${v} ${f} = <b>${res.toFixed(4)}</b> ${to}`;
}

/* Password */
function genPwd(){
  const len=+document.getElementById('pwdLen').value;
  document.getElementById('pwdLenV').textContent=len;
  let pool='';
  if(document.getElementById('pwdUp').checked)pool+='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if(document.getElementById('pwdLow').checked)pool+='abcdefghijklmnopqrstuvwxyz';
  if(document.getElementById('pwdNum').checked)pool+='0123456789';
  if(document.getElementById('pwdSym').checked)pool+='!@#$%^&*()-_=+[]{};:,.?';
  if(!pool){document.getElementById('pwdOut').textContent='Pick at least one character set';return;}
  let s='';const arr=new Uint32Array(len);
  crypto.getRandomValues(arr);
  for(let i=0;i<len;i++)s+=pool[arr[i]%pool.length];
  document.getElementById('pwdOut').textContent=s;
}

/* Timestamp */
function tsNow(){document.getElementById('tsIn').value=Math.floor(Date.now()/1000);tsToDate();}
function pad(n){return n<10?'0'+n:n;}
function tsToDate(){
  const ts=+document.getElementById('tsIn').value; if(!ts)return;
  const d=new Date(ts*1000);
  document.getElementById('tsOut1').textContent=
    `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function dateToTs(){
  const v=document.getElementById('tsDate').value;
  const m=v.match(/(\d+)-(\d+)-(\d+)\s+(\d+):(\d+):(\d+)/); if(!m)return;
  const d=new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+m[6]);
  document.getElementById('tsOut2').textContent='Unix timestamp: '+Math.floor(d.getTime()/1000);
}

/* Word counter */
function wc(){
  const t=document.getElementById('wcIn').value;
  const chars=t.length;
  const charsNo=t.replace(/\s/g,'').length;
  const words=t.trim()?t.trim().split(/\s+/).length:0;
  const lines=t?t.split(/\n/).length:0;
  const sentences=(t.match(/[.!?]+/g)||[]).length;
  document.getElementById('wcOut').innerHTML=
    `Words: <b>${words}</b> · Characters: <b>${chars}</b> (no spaces: ${charsNo})<br>
     Lines: <b>${lines}</b> · Sentences: <b>${sentences}</b>`;
}

/* Case converter */
function cc(mode){
  const t=document.getElementById('ccIn').value;
  let r=t;
  if(mode==='upper') r=t.toUpperCase();
  else if(mode==='lower') r=t.toLowerCase();
  else if(mode==='title') r=t.replace(/\w\S*/g,w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase());
  else if(mode==='sentence') r=t.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z])/g,(_,a,b)=>a+b.toUpperCase());
  document.getElementById('ccOut').textContent=r;
}

/* Color */
function hexToRgb(h){
  h=h.replace('#',''); if(h.length===3)h=h.split('').map(c=>c+c).join('');
  const n=parseInt(h,16); return {r:(n>>16)&255,g:(n>>8)&255,b:n&255};
}
function updColor(){
  const v=document.getElementById('colorPick').value;
  document.getElementById('colorHex').value=v;
  showColor(v);
}
function hexToColor(){
  let v=document.getElementById('colorHex').value.trim();
  if(!v.startsWith('#'))v='#'+v;
  if(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)){
    document.getElementById('colorPick').value=v.length===4?('#'+v.slice(1).split('').map(c=>c+c).join('')):v;
    showColor(v);
  }
}
function showColor(v){
  const {r,g,b}=hexToRgb(v);
  document.getElementById('colorPrev').style.background=v;
  document.getElementById('colorOut').innerHTML=`HEX: <b>${v.toUpperCase()}</b> · RGB: <b>rgb(${r}, ${g}, ${b})</b>`;
}

/* BMI */
function calcBMI(){
  const w=+document.getElementById('bmiW').value||0;
  const h=(+document.getElementById('bmiH').value||0)/100;
  if(!w||!h){document.getElementById('bmiOut').textContent='Enter weight and height';return;}
  const bmi=w/(h*h);
  let cat=bmi<18.5?'Underweight':bmi<25?'Normal':bmi<30?'Overweight':'Obese';
  document.getElementById('bmiOut').innerHTML=`BMI: <span class="big">${bmi.toFixed(1)}</span> · ${cat}`;
}

/* Percentage */
function calcPct(){
  const x=+document.getElementById('pctX').value||0;
  const y=+document.getElementById('pctY').value||0;
  const mode=document.getElementById('pctMode').value;
  let r;
  if(mode==='of') r=`${x}% of ${y} = <b>${(x*y/100).toFixed(2)}</b>`;
  else if(mode==='is') r=`${x} is <b>${y?(x/y*100).toFixed(2):0}%</b> of ${y}`;
  else r=`${x} + ${y}% = <b>${(x*(1+y/100)).toFixed(2)}</b>`;
  document.getElementById('pctOut').innerHTML=r;
}

/* Time zone */
const TZS=['UTC','Asia/Shanghai','Asia/Tokyo','Asia/Hong_Kong','Asia/Singapore','Asia/Kolkata',
  'Europe/London','Europe/Paris','Europe/Berlin','America/New_York','America/Chicago','America/Los_Angeles','Australia/Sydney'];
function initTZ(){
  const f=document.getElementById('tzFrom'), t=document.getElementById('tzTo');
  TZS.forEach(z=>{f.add(new Option(z,z));t.add(new Option(z,z));});
  f.value='America/New_York'; t.value='Asia/Shanghai';
}
function tzOffsetMs(tz,date){
  const p=new Intl.DateTimeFormat('en-US',{timeZone:tz,hour12:false,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).formatToParts(date);
  const m={}; p.forEach(x=>m[x.type]=x.value);
  const hh=m.hour==='24'?'00':m.hour;
  const asUTC=Date.UTC(+m.year,+m.month-1,+m.day,+hh,+m.minute,+m.second);
  return asUTC-date.getTime();
}
function tzConvert(){
  const v=document.getElementById('tzIn').value; if(!v)return;
  const [dp,tp]=v.split('T'); const [Y,M,D]=dp.split('-').map(Number); const [h,mi]=tp.split(':').map(Number);
  const from=document.getElementById('tzFrom').value, to=document.getElementById('tzTo').value;
  const utcGuess=Date.UTC(Y,M-1,D,h,mi,0);
  const wall=new Date(utcGuess - tzOffsetMs(from,new Date(utcGuess)));
  const fmt=tz=>new Intl.DateTimeFormat('en-US',{timeZone:tz,dateStyle:'full',timeStyle:'short'}).format(wall);
  document.getElementById('tzOut').innerHTML=`${fmt(from)}<br>↓<br><b>${fmt(to)}</b>`;
}

/* JSON */
function fmtJSON(mode){
  const raw=document.getElementById('jsonIn').value;
  try{
    const obj=JSON.parse(raw);
    const out=mode==='min'?JSON.stringify(obj):JSON.stringify(obj,null,2);
    document.getElementById('jsonOut').textContent=out;
  }catch(e){
    document.getElementById('jsonOut').textContent='❌ Invalid JSON: '+e.message;
  }
}

function copyTxt(id){
  const t=document.getElementById(id).textContent;
  navigator.clipboard.writeText(t).then(()=>alert('Copied'));
}
