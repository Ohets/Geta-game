(function(){
function hillClimb(){
 const box=document.getElementById("hillBox");if(!box)return;
 const vehicles=[{name:"🚙 Buggy",color:"#e63946",acc:.11,max:8.5,grip:.18},{name:"🛻 4x4",color:"#2a9d8f",acc:.095,max:7.3,grip:.22},{name:"🏎️ Sport",color:"#f4a261",acc:.135,max:9.5,grip:.14}];
 const levels=[{name:"🌄 Green Hills",sky:"#55b7ff",ground:"#5c9d3e",goal:1500,water:false,tunnel:false},{name:"🌊 Mountain Lake",sky:"#62c8ff",ground:"#4f963b",goal:1800,water:true,tunnel:false},{name:"🌋 Canyon Tunnel",sky:"#ffb36b",ground:"#70452c",goal:2100,water:false,tunnel:true}];
 let vehicle=0,level=0,canvas,ctx,W=0,H=0,dpr=1,seed=Math.random()*10000,world=0,dist=0,coins=0,fuel=100,gas=0,brake=0,dead=false,last=0,raf,score=0,paused=false,checkpoint=0,wheelSpin=0,splash=0;
 const car={angle:0,speed:0,bounce:0,air:0,airAngle:0};
 function unlocked(i){return i===0||+localStorage.getItem("geta_hill_level_"+i)===1} 
 function choose(){
  box.innerHTML='<div class="hillSelect"><h2>🚙 Hill Climb Racing</h2><p>Wähle Fahrzeug und Strecke</p><div class="hillCars">'+vehicles.map((v,i)=>'<button data-v="'+i+'">'+v.name+'<small>'+(i===0?"Ausgeglichen":i===1?"Stabil":"Schnell")+'</small></button>').join("")+'</div><div class="hillLevels">'+levels.map((l,i)=>'<button data-l="'+i+'" '+(!unlocked(i)?'disabled':'')+'>'+l.name+'<small>'+l.goal+' m'+(unlocked(i)?'':' 🔒')+'</small></button>').join("")+'</div></div>';
  box.querySelectorAll("[data-v]").forEach(b=>b.onpointerdown=()=>{vehicle=+b.dataset.v;refresh()});
  box.querySelectorAll("[data-l]").forEach(b=>b.onpointerdown=()=>{level=+b.dataset.l;refresh()});
  function refresh(){box.querySelectorAll("[data-v]").forEach(x=>x.classList.toggle("selected",+x.dataset.v===vehicle));box.querySelectorAll("[data-l]").forEach(x=>x.classList.toggle("selected",+x.dataset.l===level))}
  refresh();
  box.querySelectorAll("[data-v]").forEach(b=>b.onpointerdown=()=>{vehicle=+b.dataset.v;refresh()});
  box.querySelectorAll("[data-l]").forEach(b=>b.onpointerdown=()=>{level=+b.dataset.l;start()});
 }
 function noise(x){return Math.sin(x*.0017+seed)*.55+Math.sin(x*.0043+seed*1.7)*.25+Math.sin(x*.0091+seed*.31)*.12}
 function gy(x){
  let y=H*.70-noise(x)*H*.17-Math.sin(x*.0007+seed)*H*.07;
  if(level===1 && x>850&&x<1120)y=H*.67;
  return y
 }
 function resize(){if(!canvas)return;const r=box.getBoundingClientRect();W=Math.max(280,r.width);H=Math.max(220,r.height);dpr=Math.min(devicePixelRatio||1,2);canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+"px";canvas.style.height=H+"px";ctx.setTransform(dpr,0,0,dpr,0,0)}
 function circle(x,y,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
 function drawMountain(col,base,amp,scale,off){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,H);for(let sx=0;sx<=W;sx+=10)ctx.lineTo(sx,base-noise(world*scale+sx*scale+off)*amp);ctx.lineTo(W,H);ctx.fill()}
 function draw(){
  const L=levels[level],sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,L.sky);sky.addColorStop(.62,"#d7f2ff");sky.addColorStop(1,"#eaf7d7");ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  circle(W*.78,H*.16,28,"#fff0a0");drawMountain(level===2?"#9b6545":"#a5c99e",H*.64,H*.13,.35,2000);drawMountain(level===2?"#70452c":"#70a968",H*.70,H*.15,.52,4000);
  const x=world+W*.34,ground=gy(x);
  ctx.beginPath();ctx.moveTo(0,H);for(let sx=0;sx<=W;sx+=7)ctx.lineTo(sx,gy(world+sx));ctx.lineTo(W,H);ctx.fillStyle=L.ground;ctx.fill();
  ctx.beginPath();ctx.moveTo(0,H);for(let sx=0;sx<=W;sx+=7)ctx.lineTo(sx,gy(world+sx)+8);ctx.lineTo(W,H);ctx.fillStyle=level===2?"#52321f":"#76502f";ctx.fill();
  if(level===1){const sx=850-world;if(sx<W&&sx+270>0){ctx.fillStyle="#2b9bd1";ctx.fillRect(sx,H*.67,270,H*.33);ctx.fillStyle="#b8edff";for(let wx=sx;wx<sx+270;wx+=35){ctx.beginPath();ctx.arc(wx,H*.68,14,Math.PI,0);ctx.fill()}}}
  if(level===1){const bx=850-world;ctx.fillStyle="#744b2d";for(let i=0;i<7;i++)ctx.fillRect(bx+i*42,H*.62,34,8);ctx.fillStyle="#4a3425";for(let i=0;i<7;i++)ctx.fillRect(bx+i*42,H*.62+8,5,40)}
  if(level===2){const tx=1250-world;ctx.fillStyle="#3b271d";ctx.beginPath();ctx.arc(tx+105,H*.71,105,Math.PI,0);ctx.fill();ctx.fillRect(tx,H*.71,210,H*.29);ctx.fillStyle="#17120f";ctx.beginPath();ctx.arc(tx+105,H*.71,78,Math.PI,0);ctx.fill();ctx.fillRect(tx+27,H*.71,156,H*.29)}
  for(let x0=650;x0<levels[level].goal*7;x0+=1050){const sx=x0-world;if(sx>-220&&sx<W+220){ctx.fillStyle="#9b6b3d";ctx.beginPath();ctx.moveTo(sx,gy(x0)+5);ctx.lineTo(sx+180,gy(x0+180)+5);ctx.lineTo(sx+90,gy(x0+90)-42);ctx.closePath();ctx.fill()}}
  for(let i=0;i<levels[level].goal/110;i++){const ix=430+i*110+(i%3)*35;if(ix<world-40||ix>world+W+40)continue;const iy=gy(ix)-25;if(i%7===0){ctx.fillStyle="#e33";ctx.fillRect(ix-world-9,iy-13,18,26);ctx.fillStyle="#fff";ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.fillText("F",ix-world,iy+4)}else{circle(ix-world,iy,8,"#ffd83d");circle(ix-world,iy,4,"#f5ad18")}}
  const slope=Math.atan2(gy(x+22)-gy(x-22),44),cx=W*.34,cy=ground-25;if(car.air>0){car.air-=1;car.airAngle+=gas*.018-brake*.012}else{car.angle+=(slope-car.angle)*.16;car.airAngle=car.angle}
  car.bounce=Math.sin(performance.now()*.018)*Math.min(2,Math.abs(car.speed)*.3);ctx.save();ctx.translate(cx,cy+car.bounce);ctx.rotate(car.airAngle);const v=vehicles[vehicle];
  ctx.strokeStyle="#333";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-20,4);ctx.lineTo(-20,14);ctx.moveTo(20,4);ctx.lineTo(20,14);ctx.stroke();ctx.fillStyle=v.color;ctx.beginPath();ctx.roundRect(-30,-13,60,25,5);ctx.fill();ctx.fillStyle="#c9efff";ctx.beginPath();ctx.moveTo(-14,-13);ctx.lineTo(-4,-24);ctx.lineTo(12,-24);ctx.lineTo(19,-13);ctx.closePath();ctx.fill();circle(-19,13,10,"#222");circle(19,13,10,"#222");ctx.strokeStyle="#ddd";ctx.lineWidth=2;for(const wx of [-19,19]){ctx.save();ctx.translate(wx,13);ctx.rotate(wheelSpin);ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(5,0);ctx.moveTo(0,-5);ctx.lineTo(0,5);ctx.stroke();ctx.restore()}ctx.fillStyle="#fff";ctx.font="bold 8px sans-serif";ctx.textAlign="center";ctx.fillText("GETA",0,2);ctx.restore();
  document.getElementById("hcDist").textContent=Math.floor(dist)+" m";document.getElementById("hcCoins").textContent="🪙 "+coins;document.getElementById("hcFuel").textContent="⛽ "+Math.max(0,Math.floor(fuel))+"%";document.getElementById("hcScore").textContent="⭐ "+Math.floor(score);document.getElementById("hcLevel").textContent=L.name+" · Checkpoint "+Math.floor(checkpoint)+"/"+L.goal+" m";
 }
 function end(msg){if(dead)return;dead=true;cancelAnimationFrame(raf);score=Math.floor(dist)+coins*25;const old=+localStorage.getItem("geta_hill_high")||0;if(score>old)localStorage.setItem("geta_hill_high",score);if(msg.includes("Level geschafft")){localStorage.setItem("geta_hill_level_"+Math.min(2,level+1),1)}box.insertAdjacentHTML("beforeend",'<div class="hillResult"><strong>'+msg+'</strong><div>'+levels[level].name+' · '+vehicles[vehicle].name+'<br>🏁 Strecke: '+Math.floor(dist)+' m<br>🪙 Münzen: '+coins+'<br>⭐ Score: '+score+'<br>🏆 Rekord: '+Math.max(score,old)+'</div><button onclick="hillClimb()">Nochmal</button></div>')}
 function start(){
  box.innerHTML='<canvas></canvas><div class="hillHud"><span id="hcLevel">'+levels[level].name+'</span><span id="hcDist">0 m</span><span id="hcCoins">🪙 0</span><span id="hcFuel">⛽ 100%</span><span id="hcScore">⭐ 0</span><button id="hcPause">⏸</button></div><div class="hillHint">◀ Bremsen &nbsp; ▶ Gas</div><div class="hillControls"><button id="hcBrake">◀</button><button id="hcGas">▶</button></div>';
  canvas=box.querySelector("canvas");ctx=canvas.getContext("2d");resize();addEventListener("resize",resize);const btn=(el,on)=>{el.onpointerdown=e=>{e.preventDefault();on(1)};el.onpointerup=el.onpointercancel=()=>on(0)};btn(box.querySelector("#hcGas"),v=>gas=v);btn(box.querySelector("#hcBrake"),v=>brake=v);box.querySelector("#hcPause").onpointerdown=e=>{e.preventDefault();paused=!paused;box.querySelector("#hcPause").textContent=paused?"▶":"⏸"};
  world=0;dist=0;coins=0;fuel=100;gas=0;brake=0;dead=false;score=0;paused=false;checkpoint=0;wheelSpin=0;car.angle=0;car.speed=0;car.air=0;car.airAngle=0;last=performance.now();loop(last)
 }
 function loop(now){const dt=Math.min((now-last)/16.67,2);last=now;if(dead)return;if(paused){draw();if(splash>0&&level===1){ctx.save();ctx.strokeStyle="#dff";ctx.lineWidth=2;for(let i=0;i<8;i++){let px=W*.34-28+i*8,py=ground+8-(splash%4)*3;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+(i%2?5:-5),py-12-(i%3)*4);ctx.stroke()}ctx.restore()}raf=requestAnimationFrame(loop);return;}const x=world+W*.34,slope=(gy(x+18)-gy(x-18))/36,v=vehicles[vehicle];car.speed+=gas*v.acc*dt-brake*.17*dt-slope*v.grip*dt;car.speed*=Math.pow(.993,dt);car.speed=Math.max(-2.2,Math.min(v.max,car.speed));world+=Math.max(0,car.speed)*dt*2.55;dist=Math.max(dist,world/7);checkpoint=Math.max(checkpoint,Math.floor(dist/250)*250);wheelSpin+=car.speed*dt*.18;splash=Math.max(0,splash-dt);fuel-=gas*.043*dt;score=Math.floor(dist)+coins*25;
  if(level===1&&x>830&&x<1140){splash=10;if(Math.abs(car.angle)>1.2)end("🌊 Ins Wasser gerutscht!");}if(level===2&&x>1260&&x<1450&&Math.abs(car.angle)>1.45)end("🪨 Im Tunnel überschlagen!");
  const r=Math.floor(x/1000);if(car.air<=0&&Math.abs(slope)>.55&&car.speed>4.5)car.air=22,car.airAngle=slope;
  if(Math.abs(car.airAngle)>1.62&&car.air>0)end("💥 Überschlag in der Luft!");else if(Math.abs(car.angle)>1.55)end("💥 Überschlag!");else if(fuel<=0)end("⛽ Benzin leer!");else if(dist>=levels[level].goal)end("🏆 Level geschafft!");
  draw();raf=requestAnimationFrame(loop)
 }
 choose()
}
window.hillClimb=hillClimb;
})();