(function(){
function hillClimb(){
 const box=document.getElementById("hillBox"); if(!box)return;
 box.innerHTML='<canvas></canvas><div class="hillHud"><span id="hcDist">0 m</span><span id="hcCoins">🪙 0</span><span id="hcFuel">⛽ 100%</span><span id="hcScore">⭐ 0</span></div><div class="hillHint">◀ Zurück &nbsp; ▶ Gas</div><div class="hillControls"><button id="hcBrake">◀</button><button id="hcGas">▶</button></div>';
 const c=box.querySelector("canvas"),ctx=c.getContext("2d"); let W=0,H=0,dpr=1;
 function resize(){const r=box.getBoundingClientRect();W=Math.max(280,r.width);H=Math.max(220,r.height);dpr=Math.min(devicePixelRatio||1,2);c.width=W*dpr;c.height=H*dpr;c.style.width=W+"px";c.style.height=H+"px";ctx.setTransform(dpr,0,0,dpr,0,0)}
 resize(); addEventListener("resize",resize);
 let seed=Math.random()*10000,world=0,dist=0,coins=0,fuel=100,gas=0,brake=0,dead=false,last=performance.now(),raf,score=0;
 const car={angle:0,speed:0,bounce:0,wheel:0,air:0};
 function noise(x){return Math.sin(x*.0017+seed)*.55+Math.sin(x*.0043+seed*1.7)*.25+Math.sin(x*.0091+seed*.31)*.12}
 function gy(x){return H*.70-noise(x)*H*.17-Math.sin(x*.0007+seed)*H*.07}
 let items=[];
 for(let x=380;x<15000;x+=220+Math.random()*260){
   items.push({x,type:"coin",taken:false});
   if(Math.random()<.55)items.push({x:x+70,type:"fuel",taken:false});
 }
 function button(el,on){el.onpointerdown=e=>{e.preventDefault();on(1)};el.onpointerup=el.onpointercancel=()=>on(0)}
 button(box.querySelector("#hcGas"),v=>gas=v);button(box.querySelector("#hcBrake"),v=>brake=v);
 document.addEventListener("keydown",e=>{if(["ArrowRight","d","D"].includes(e.key)){gas=1;e.preventDefault()}if(["ArrowLeft","a","A"].includes(e.key)){brake=1;e.preventDefault()}});
 document.addEventListener("keyup",e=>{if(["ArrowRight","d","D"].includes(e.key))gas=0;if(["ArrowLeft","a","A"].includes(e.key))brake=0});
 function reset(){world=0;dist=0;coins=0;fuel=100;gas=0;brake=0;dead=false;score=0;car.angle=0;car.speed=0;car.wheel=0;car.air=0;items.forEach(i=>i.taken=false);last=performance.now();loop(last)}
 function circle(x,y,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
 function drawMountain(col,base,amp,scale,off){
   ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,H);
   for(let sx=0;sx<=W;sx+=10)ctx.lineTo(sx,base-noise(world*scale+sx*scale+off)*amp);
   ctx.lineTo(W,H);ctx.fill()
 }
 function draw(){
   const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#62b8ff");sky.addColorStop(.62,"#bfe9ff");sky.addColorStop(1,"#eaf7d7");ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
   circle(W*.78,H*.16,28,"#fff2a6"); drawMountain("#9cc995",H*.64,H*.13,.35,2000);drawMountain("#6eaa67",H*.70,H*.15,.52,4000);
   const x=world+W*.34, ground=gy(x);
   ctx.beginPath();ctx.moveTo(0,H);for(let sx=0;sx<=W;sx+=7)ctx.lineTo(sx,gy(world+sx));ctx.lineTo(W,H);ctx.fillStyle="#5c9d3e";ctx.fill();
   ctx.beginPath();ctx.moveTo(0,H);for(let sx=0;sx<=W;sx+=7)ctx.lineTo(sx,gy(world+sx)+8);ctx.lineTo(W,H);ctx.fillStyle="#76502f";ctx.fill();
   for(const it of items){if(it.taken)continue;const sx=it.x-world;if(sx<-40||sx>W+40)continue;const y=gy(it.x)-25;
     if(it.type==="coin"){ctx.shadowColor="#ffd83d";ctx.shadowBlur=10;circle(sx,y,9,"#ffd83d");ctx.shadowBlur=0;circle(sx,y,5,"#f5ad18");}
     else{ctx.fillStyle="#e33";ctx.fillRect(sx-9,y-13,18,26);ctx.fillStyle="#fff";ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.fillText("F",sx,y+4)}
   }
   const slope=Math.atan2(gy(x+22)-gy(x-22),44); const cx=W*.34, cy=ground-25;
   car.angle+=(slope-car.angle)*.12; car.bounce=Math.sin(performance.now()*.018)*Math.min(2,Math.abs(car.speed)*.3);
   ctx.save();ctx.translate(cx,cy+car.bounce);ctx.rotate(car.angle);
   ctx.strokeStyle="#222";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-18,5);ctx.lineTo(-18,16);ctx.moveTo(18,5);ctx.lineTo(18,16);ctx.stroke();
   ctx.fillStyle="#e63946";ctx.beginPath();ctx.roundRect(-30,-13,60,25,5);ctx.fill();
   ctx.fillStyle="#c9efff";ctx.beginPath();ctx.moveTo(-14,-13);ctx.lineTo(-4,-24);ctx.lineTo(12,-24);ctx.lineTo(19,-13);ctx.closePath();ctx.fill();
   ctx.fillStyle="#222";circle(-19,13,10,"#222");circle(19,13,10,"#222");circle(-19,13,4,"#aaa");circle(19,13,4,"#aaa");
   ctx.fillStyle="#fff";ctx.font="bold 8px sans-serif";ctx.textAlign="center";ctx.fillText("GETA",0,2);ctx.restore();
   document.getElementById("hcDist").textContent=Math.floor(dist)+" m";document.getElementById("hcCoins").textContent="🪙 "+coins;document.getElementById("hcFuel").textContent="⛽ "+Math.max(0,Math.floor(fuel))+"%";document.getElementById("hcScore").textContent="⭐ "+Math.floor(score);
 }
 function end(msg){if(dead)return;dead=true;cancelAnimationFrame(raf);score=Math.floor(dist)+coins*25;const old=+localStorage.getItem("geta_hill_high")||0;if(score>old)localStorage.setItem("geta_hill_high",score);box.insertAdjacentHTML("beforeend",'<div class="hillResult"><strong>'+msg+'</strong><div>🏁 Strecke: '+Math.floor(dist)+' m<br>🪙 Münzen: '+coins+'<br>⭐ Score: '+score+'<br>🏆 Rekord: '+Math.max(score,old)+'</div><button onclick="hillClimb()">Nochmal</button></div>')}
 function loop(now){const dt=Math.min((now-last)/16.67,2);last=now;if(dead)return;
   const x=world+W*.34,slope=(gy(x+18)-gy(x-18))/36;
   car.speed+=gas*.11*dt-brake*.17*dt-slope*.18*dt;car.speed*=Math.pow(.993,dt);car.speed=Math.max(-2.2,Math.min(8.5,car.speed));
   world+=Math.max(0,car.speed)*dt*2.55;dist=Math.max(dist,world/7);car.wheel+=car.speed*dt*.28;fuel-=gas*.043*dt;
   score=Math.floor(dist)+coins*25;
   for(const it of items){if(!it.taken&&Math.abs(it.x-x)<34){it.taken=true;if(it.type==="coin")coins++;else fuel=Math.min(100,fuel+30)}}
   if(Math.abs(car.angle)>1.52)end("💥 Überschlag!");else if(fuel<=0)end("⛽ Benzin leer!");else if(dist>=1500)end("🏆 Ziel erreicht!");
   draw();raf=requestAnimationFrame(loop)
 }
 loop(last)
}
window.hillClimb=hillClimb;
})();