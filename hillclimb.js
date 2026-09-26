(function(){
function hillClimb(){
 const box=document.getElementById("hillBox");if(!box)return;
 box.innerHTML='<canvas></canvas><div class="hillHud"><span id="hcDist">0 m</span><span id="hcCoins">🪙 0</span><span id="hcFuel">⛽ 100%</span><span id="hcScore">⭐ 0</span></div><div class="hillHint">◀ Bremsen &nbsp; ▶ Gas</div><div class="hillControls"><button id="hcBrake">◀</button><button id="hcGas">▶</button></div>';
 const c=box.querySelector("canvas"),ctx=c.getContext("2d");let W=0,H=0,dpr=1;
 function resize(){const r=box.getBoundingClientRect();W=Math.max(280,r.width);H=Math.max(220,r.height);dpr=Math.min(devicePixelRatio||1,2);c.width=W*dpr;c.height=H*dpr;c.style.width=W+"px";c.style.height=H+"px";ctx.setTransform(dpr,0,0,dpr,0,0)}resize();addEventListener("resize",resize);
 let seed=Math.random()*10000,world=0,dist=0,coins=0,fuel=100,gas=0,brake=0,dead=false,last=performance.now(),raf,score=0;
 const vehicles=[
  {name:"🚙 Buggy",color:"#e63946",acc:.11,max:8.5,grip:.18},
  {name:"🛻 4x4",color:"#2a9d8f",acc:.095,max:7.3,grip:.22},
  {name:"🏎️ Sport",color:"#f4a261",acc:.135,max:9.5,grip:.14}
 ];
 let vehicle=0,car={angle:0,speed:0,bounce:0,wheel:0,air:0,airAngle:0};
 function choose(){
  box.innerHTML='<div class="hillSelect"><h2>🚙 Hill Climb Racing</h2><p>Wähle dein Fahrzeug</p><div class="hillCars">'+vehicles.map((v,i)=>'<button data-v="'+i+'">'+v.name+'<small>'+ (i===0?"Ausgeglichen":i===1?"Stabil":"Schnell")+'</small></button>').join("")+'</div></div>';
  box.querySelectorAll("[data-v]").forEach(b=>b.onpointerdown=()=>{vehicle=+b.dataset.v;start()});
 }
 function start(){
  box.innerHTML='<canvas></canvas><div class="hillHud"><span id="hcDist">0 m</span><span id="hcCoins">🪙 0</span><span id="hcFuel">⛽ 100%</span><span id="hcScore">⭐ 0</span></div><div class="hillHint">◀ Bremsen &nbsp; ▶ Gas</div><div class="hillControls"><button id="hcBrake">◀</button><button id="hcGas">▶</button></div>';
  setup();
 }
 function noise(x){return Math.sin(x*.0017+seed)*.55+Math.sin(x*.0043+seed*1.7)*.25+Math.sin(x*.0091+seed*.31)*.12}
 function gy(x){
   let y=H*.70-noise(x)*H*.17-Math.sin(x*.0007+seed)*H*.07;
   for(const r of ramps){if(x>r.x&&x<r.x+r.w){const t=(x-r.x)/r.w;y-=Math.sin(t*Math.PI)*r.h}}
   return y;
 }
 const ramps=[];for(let x=700;x<15000;x+=1100+Math.random()*800)ramps.push({x,w:170+Math.random()*80,h:35+Math.random()*35});
 let items=[];for(let x=380;x<15000;x+=220+Math.random()*260){items.push({x,type:"coin",taken:false});if(Math.random()<.55)items.push({x:x+70,type:"fuel",taken:false})}
 function setup(){
  const cc=box.querySelector("canvas"),cx=cc.getContext("2d");ctx.canvas=cc;Object.assign(ctx,cx);
 }
 // canvas context is recreated through the original ctx; resize uses the original canvas reference
 function bind(){const gasBtn=box.querySelector("#hcGas"),brakeBtn=box.querySelector("#hcBrake");const button=(el,on)=>{el.onpointerdown=e=>{e.preventDefault();on(1)};el.onpointerup=el.onpointercancel=()=>on(0)};button(gasBtn,v=>gas=v);button(brakeBtn,v=>brake=v)}
 function circle(x,y,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
 function mountain(col,base,amp,scale,off){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,H);for(let sx=0;sx<=W;sx+=10)ctx.lineTo(sx,base-noise(world*scale+sx*scale+off)*amp);ctx.lineTo(W,H);ctx.fill()}
 function draw(){
  const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#55b7ff");sky.addColorStop(.62,"#c7efff");sky.addColorStop(1,"#eaf7d7");ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  circle(W*.78,H*.16,28,"#fff0a0");mountain("#a5c99e",H*.64,H*.13,.35,2000);mountain("#70a968",H*.70,H*.15,.52,4000);
  const x=world+W*.34,ground=gy(x);
  ctx.beginPath();ctx.moveTo(0,H);for(let sx=0;sx<=W;sx+=7)ctx.lineTo(sx,gy(world+sx));ctx.lineTo(W,H);ctx.fillStyle="#5c9d3e";ctx.fill();
  ctx.beginPath();ctx.moveTo(0,H);for(let sx=0;sx<=W;sx+=7)ctx.lineTo(sx,gy(world+sx)+8);ctx.lineTo(W,H);ctx.fillStyle="#76502f";ctx.fill();
  for(const r of ramps){const sx=r.x-world;if(sx>-r.w&&sx<W+r.w){ctx.fillStyle="#9b6b3d";ctx.beginPath();ctx.moveTo(sx,gy(r.x)+7);ctx.lineTo(sx+r.w,gy(r.x+r.w)+7);ctx.lineTo(sx+r.w,gy(r.x+r.w)-r.h*.15);ctx.lineTo(sx+r.w*.5,gy(r.x+r.w*.5)-r.h);ctx.closePath();ctx.fill();}}
  for(const it of items){if(it.taken)continue;const sx=it.x-world;if(sx<-40||sx>W+40)continue;const y=gy(it.x)-25;if(it.type==="coin"){ctx.shadowColor="#ffd83d";ctx.shadowBlur=10;circle(sx,y,9,"#ffd83d");ctx.shadowBlur=0;circle(sx,y,5,"#f5ad18")}else{ctx.fillStyle="#e33";ctx.fillRect(sx-9,y-13,18,26);ctx.fillStyle="#fff";ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.fillText("F",sx,y+4)}}
  const slope=Math.atan2(gy(x+22)-gy(x-22),44),cxp=W*.34,cyp=ground-25;
  if(car.air>0){car.air-=1;car.airAngle+=gas*.018-brake*.012}
  else{car.angle+=(slope-car.angle)*.16;car.airAngle=car.angle}
  car.bounce=Math.sin(performance.now()*.018)*Math.min(2,Math.abs(car.speed)*.3);
  ctx.save();ctx.translate(cxp,cyp+car.bounce);ctx.rotate(car.airAngle);const v=vehicles[vehicle];
  ctx.fillStyle=v.color;ctx.beginPath();ctx.roundRect(-30,-13,60,25,5);ctx.fill();
  ctx.fillStyle="#c9efff";ctx.beginPath();ctx.moveTo(-14,-13);ctx.lineTo(-4,-24);ctx.lineTo(12,-24);ctx.lineTo(19,-13);ctx.closePath();ctx.fill();
  circle(-19,13,10,"#222");circle(19,13,10,"#222");circle(-19,13,4,"#aaa");circle(19,13,4,"#aaa");
  ctx.fillStyle="#fff";ctx.font="bold 8px sans-serif";ctx.textAlign="center";ctx.fillText("GETA",0,2);ctx.restore();
  document.getElementById("hcDist").textContent=Math.floor(dist)+" m";document.getElementById("hcCoins").textContent="🪙 "+coins;document.getElementById("hcFuel").textContent="⛽ "+Math.max(0,Math.floor(fuel))+"%";document.getElementById("hcScore").textContent="⭐ "+Math.floor(score);
 }
 function end(msg){if(dead)return;dead=true;cancelAnimationFrame(raf);score=Math.floor(dist)+coins*25;const old=+localStorage.getItem("geta_hill_high")||0;if(score>old)localStorage.setItem("geta_hill_high",score);box.insertAdjacentHTML("beforeend",'<div class="hillResult"><strong>'+msg+'</strong><div>🚙 '+vehicles[vehicle].name+'<br>🏁 Strecke: '+Math.floor(dist)+' m<br>🪙 Münzen: '+coins+'<br>⭐ Score: '+score+'<br>🏆 Rekord: '+Math.max(score,old)+'</div><button onclick="hillClimb()">Nochmal</button></div>')}
 function loop(now){const dt=Math.min((now-last)/16.67,2);last=now;if(dead)return;const x=world+W*.34,slope=(gy(x+18)-gy(x-18))/36,v=vehicles[vehicle];
  car.speed+=gas*v.acc*dt-brake*.17*dt-slope*v.grip*dt;car.speed*=Math.pow(.993,dt);car.speed=Math.max(-2.2,Math.min(v.max,car.speed));world+=Math.max(0,car.speed)*dt*2.55;dist=Math.max(dist,world/7);fuel-=gas*.043*dt;score=Math.floor(dist)+coins*25;
  for(const it of items){if(!it.taken&&Math.abs(it.x-x)<34){it.taken=true;if(it.type==="coin")coins++;else fuel=Math.min(100,fuel+30)}}
  const nextRamp=ramps.find(r=>x>r.x-20&&x<r.x+r.w+20);if(nextRamp&&car.air<=0&&Math.abs(slope)>0.55&&car.speed>4.5)car.air=20;
  if(Math.abs(car.airAngle)>1.62&&car.air>0)end("💥 Überschlag in der Luft!");else if(Math.abs(car.angle)>1.55)end("💥 Überschlag!");else if(fuel<=0)end("⛽ Benzin leer!");else if(dist>=1500)end("🏆 Ziel erreicht!");
  draw();raf=requestAnimationFrame(loop)
 }
 choose();
 function begin(){bind();last=performance.now();loop(last)}
 const oldStart=start;start=function(){oldStart();bind();last=performance.now();loop(last)};
}
window.hillClimb=hillClimb;
})();