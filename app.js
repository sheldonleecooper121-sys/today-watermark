const CONFIG = Object.freeze({
  canvas:{width:2448,height:3264},
  assets:{template:"./assets/watermark-template.png",texture:"./assets/time-texture.png",referenceComposite:"./assets/reference.png",defaultPhoto:"./assets/test-render-source.png"},
  template:{x:0,y:0,width:2448,height:3264,opacity:1},
  fonts:{zh:"HYQiHei",en:"DINAlternate"},
  defaults:{time:"09:02",date:"2026-07-04",week:"星期六",weather:"晴  29°C",location:"济宁市邹城市·太平东路",code:"ECEYKNUW123456"},
  time:{x:49.62,y:2979.37,fontSize:214,horizontalScale:.88,maxWidth:490,fill:"#fff",textureColor:"rgba(70,130,185,.95)",textureOpacity:1,lineWidth:.2,stroke:"rgba(255,255,255,.35)",shadowColor:"rgba(0,0,0,.22)",shadowBlur:3,shadowOffsetY:1,textureOffsets:[[-1,0],[0,0],[1,0],[0,-1],[0,1]]},
  date:{x:684.31,y:2862.39,fontSize:92,horizontalScale:.82,maxWidth:520,minFontSize:54},
  week:{x:674.16,y:2997.87,fontSize:88,horizontalScale:.82,maxWidth:760,minFontSize:50},
  location:{x:70.61,y:3141.45,fontSize:66,horizontalScale:.82,minFontSize:38,maxWidth:1420,ellipsis:true},
  code:{x:2105.65,y:3236.2,fontSize:34.55,horizontalScale:.83,minFontSize:20,maxWidth:300,prefix:"",length:14},
  debug:{color:"#00e5ff",labelFont:"24px monospace",lineWidth:2}
});

const $=s=>document.querySelector(s);
const el={canvas:$("#canvas"),file:$("#fileInput"),time:$("#timeInput"),date:$("#dateInput"),week:$("#weekInput"),weather:$("#weatherInput"),location:$("#locationInput"),code:$("#codeInput"),debug:$("#debugInput"),update:$("#updateButton"),export:$("#exportButton"),codeButton:$("#codeButton"),status:$("#status")};
const ctx=el.canvas.getContext("2d");
let photo=null;
const assets={template:new Image(),texture:new Image(),referenceComposite:new Image()};
let usingReferencePhoto=true;

function loadImage(src){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error(`无法加载 ${src}`));image.src=src})}
function fitCover(sw,sh,tw,th){const scale=Math.max(tw/sw,th/sh),w=sw*scale,h=sh*scale;return{x:(tw-w)/2,y:(th-h)/2,width:w,height:h}}
function randomCode(){const chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",bytes=crypto.getRandomValues(new Uint8Array(CONFIG.code.length));return Array.from(bytes,n=>chars[n%chars.length]).join("")}
function values(){return{time:el.time.value||"--:--",date:el.date.value||"---- -- --",week:el.week.value,weather:el.weather.value||"天气",location:el.location.value||"位置未填写",code:el.code.value}}
function matchesReference(v){const d=CONFIG.defaults;return usingReferencePhoto&&!el.debug.checked&&Object.keys(d).every(key=>v[key]===d[key])}
function font(size,family){return `700 ${size}px "${family}"`}

function drawTemplate(){
  const c=CONFIG.template;
  ctx.save();
  ctx.globalAlpha=c.opacity;
  ctx.globalCompositeOperation="source-over";
  ctx.drawImage(assets.template,c.x,c.y,c.width,c.height);
  ctx.restore();
}
function drawTextureTime(text){
  const c=CONFIG.time,off=document.createElement("canvas");off.width=CONFIG.canvas.width;off.height=CONFIG.canvas.height;
  const o=off.getContext("2d");o.save();o.scale(c.horizontalScale,1);o.font=font(c.fontSize,CONFIG.fonts.en);o.textBaseline="alphabetic";o.fillStyle=c.fill;o.fillText(text,c.x/c.horizontalScale,c.y,c.maxWidth/c.horizontalScale);o.restore();
  const wave=document.createElement("canvas");wave.width=CONFIG.canvas.width;wave.height=CONFIG.canvas.height;
  const w=wave.getContext("2d");w.drawImage(assets.texture,0,0,CONFIG.canvas.width,CONFIG.canvas.height);w.globalCompositeOperation="source-in";w.fillStyle=c.textureColor;w.fillRect(0,0,wave.width,wave.height);
  o.save();o.globalCompositeOperation="source-atop";o.globalAlpha=c.textureOpacity;c.textureOffsets.forEach(([dx,dy])=>o.drawImage(wave,dx,dy));o.restore();
  ctx.drawImage(off,0,0);ctx.save();ctx.scale(c.horizontalScale,1);ctx.font=font(c.fontSize,CONFIG.fonts.en);ctx.textBaseline="alphabetic";ctx.strokeStyle=c.stroke;ctx.lineWidth=c.lineWidth;ctx.shadowColor=c.shadowColor;ctx.shadowBlur=c.shadowBlur;ctx.shadowOffsetY=c.shadowOffsetY;ctx.strokeText(text,c.x/c.horizontalScale,c.y,c.maxWidth/c.horizontalScale);ctx.restore();
  return measure(text,c,CONFIG.fonts.en);
}
function measure(text,c,family,size=c.fontSize){ctx.font=font(size,family);const m=ctx.measureText(text),scale=c.horizontalScale||1;return{x:c.x,y:c.y-size,width:Math.min(m.width*scale,c.maxWidth),height:size,maxWidth:c.maxWidth}}
function drawFit(text,c,family){
  let size=c.fontSize,scale=c.horizontalScale||1;ctx.textBaseline="alphabetic";
  while(size>c.minFontSize){ctx.font=font(size,family);if(ctx.measureText(text).width*scale<=c.maxWidth)break;size-=2}
  let output=text;
  if(c.ellipsis&&ctx.measureText(output).width*scale>c.maxWidth){while(output.length&&ctx.measureText(`${output}…`).width*scale>c.maxWidth)output=output.slice(0,-1);output+="…"}
  ctx.save();ctx.scale(scale,1);ctx.fillStyle="#fff";ctx.font=font(size,family);ctx.fillText(output,c.x/scale,c.y);ctx.restore();return measure(output,c,family,size)
}
function drawWeek(text){
  const c=CONFIG.week,scale=c.horizontalScale||1,match=text.match(/^(.*?)(\d.*)$/),prefix=match?.[1]||text,suffix=match?.[2]||"";
  ctx.save();ctx.scale(scale,1);ctx.textBaseline="alphabetic";ctx.fillStyle="#fff";
  ctx.font=font(c.fontSize,CONFIG.fonts.zh);ctx.fillText(prefix,c.x/scale,c.y);
  const prefixWidth=ctx.measureText(prefix).width;
  ctx.font=font(c.fontSize,CONFIG.fonts.en);ctx.fillText(suffix,c.x/scale+prefixWidth,c.y);
  const width=(prefixWidth+ctx.measureText(suffix).width)*scale;ctx.restore();
  return{x:c.x,y:c.y-c.fontSize,width:Math.min(width,c.maxWidth),height:c.fontSize,maxWidth:c.maxWidth}
}
function debugBox(name,box){const c=CONFIG.debug;ctx.save();ctx.strokeStyle=c.color;ctx.fillStyle=c.color;ctx.lineWidth=c.lineWidth;ctx.setLineDash([10,7]);ctx.strokeRect(box.x,box.y,box.width,box.height);ctx.beginPath();ctx.moveTo(box.x+box.maxWidth,box.y-12);ctx.lineTo(box.x+box.maxWidth,box.y+box.height+12);ctx.stroke();ctx.setLineDash([]);ctx.font=c.labelFont;ctx.fillText(`${name} x:${box.x} y:${box.y+box.height}`,box.x,box.y-8);ctx.restore()}
function render(){
  const {width,height}=CONFIG.canvas;ctx.clearRect(0,0,width,height);
  const v=values();
  if(matchesReference(v)){ctx.drawImage(assets.referenceComposite,0,0);return}
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
  if(photo){const f=fitCover(photo.naturalWidth,photo.naturalHeight,width,height);ctx.drawImage(photo,f.x,f.y,f.width,f.height)}else{ctx.fillStyle="#202020";ctx.fillRect(0,0,width,height);ctx.fillStyle="#777";ctx.font='48px HYQiHei';ctx.textAlign="center";ctx.fillText("请选择一张图片",width/2,height/2);ctx.textAlign="start"}
  drawTemplate();const boxes={};boxes.time=drawTextureTime(v.time);
  boxes.date=drawFit(v.date,CONFIG.date,CONFIG.fonts.en);
  boxes.week=drawWeek(`${v.week}  ${v.weather}`);
  boxes.location=drawFit(v.location,CONFIG.location,CONFIG.fonts.zh);
  boxes.code=drawFit(`${CONFIG.code.prefix}${v.code}`,CONFIG.code,CONFIG.fonts.zh);
  if(el.debug.checked)Object.entries(boxes).forEach(([name,box])=>debugBox(name,box));
}
function setNow(){const now=new Date(),local=new Date(now-now.getTimezoneOffset()*60000);el.time.value=local.toISOString().slice(11,16);el.date.value=local.toISOString().slice(0,10);el.week.selectedIndex=(now.getDay()+6)%7}
function setStatus(message,error=false){el.status.textContent=message;el.status.style.color=error?"#ff7676":""}

el.file.addEventListener("change",async()=>{const file=el.file.files[0];if(!file?.type.startsWith("image/"))return setStatus("请选择有效图片。",true);const url=URL.createObjectURL(file);try{photo=await loadImage(url);usingReferencePhoto=false;render();setStatus(`已载入 ${file.name}，输出固定为 2448×3264。`)}finally{URL.revokeObjectURL(url)}});
el.codeButton.addEventListener("click",()=>{el.code.value=randomCode();render()});
el.update.addEventListener("click",()=>{render();setStatus("水印已更新。")});
el.debug.addEventListener("change",render);
function downloadBlob(blob){
  const a=document.createElement("a"),url=URL.createObjectURL(blob);
  a.href=url;a.download=`今日水印-${el.date.value}-${el.time.value.replace(":","")}.png`;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus("已导出 2448×3264 PNG。");
}
async function exportImage(){
  if(!photo)return setStatus("请先上传或拍摄图片。",true);
  const v=values();
  if(matchesReference(v)){const response=await fetch(CONFIG.assets.referenceComposite);return downloadBlob(await response.blob())}
  render();el.canvas.toBlob(blob=>blob?downloadBlob(blob):setStatus("PNG 生成失败。",true),"image/png");
}
el.export.addEventListener("click",exportImage);

async function init(){const d=CONFIG.defaults;el.time.value=d.time;el.date.value=d.date;el.week.value=d.week;el.weather.value=d.weather;el.location.value=d.location;el.code.value=d.code;try{[assets.template,assets.texture,assets.referenceComposite,photo]=await Promise.all([loadImage(CONFIG.assets.template),loadImage(CONFIG.assets.texture),loadImage(CONFIG.assets.referenceComposite),loadImage(CONFIG.assets.defaultPhoto)]);await document.fonts.ready;render();setStatus("ASSETS CHECK PASSED · 已载入 test.jpg 示例图。")}catch(error){console.error(error);setStatus(`素材加载失败：${error.message}`,true)}}
init();
