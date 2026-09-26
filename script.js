function saveHigh(key,value,lower=false){try{const n=Number(value),old=Number(localStorage.getItem("geta_"+key)||"");if(!old||(lower?n<old:n>old)){localStorage.setItem("geta_"+key,String(n));return true}}catch(e){}return false}
function getHigh(key){try{return localStorage.getItem("geta_"+key)}catch(e){return null}}
function highText(key,unit){const v=getHigh(key);return v?'<div class="highscore">🏆 Rekord: '+v+(unit||"")+'</div>':'<div class="highscore">🏆 Noch kein Rekord</div>'}
function toggleFullscreen(btn){const article=btn.closest("article");if(!document.fullscreenElement){const p=article.requestFullscreen?article.requestFullscreen():article.webkitRequestFullscreen?.();if(p&&p.catch)p.catch(()=>{})}else if(document.exitFullscreen)document.exitFullscreen()}
document.addEventListener("fullscreenchange",()=>{document.querySelectorAll(".fullscreenBtn").forEach(btn=>btn.textContent=document.fullscreenElement===btn.closest("article")?"⛶ Vollbild verlassen":"⛶ Vollbild")});

let THREE=window.THREE;function ensureThree(run){if(THREE)return run();const urls=["https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js","https://unpkg.com/three@0.128.0/build/three.min.js"];let i=0;function load(){if(i>=urls.length){alert("3D-Bibliothek konnte nicht geladen werden. Bitte Internetverbindung prüfen.");return}const x=document.createElement("script");x.src=urls[i++];x.onload=()=>{THREE=window.THREE;run()};x.onerror=load;document.head.appendChild(x)}load()}
function make3D(box,opts={}){box.innerHTML='<div class="threeWrap"></div>';const wrap=box.firstChild,scene=new THREE.Scene();scene.background=new THREE.Color(opts.bg||0x07101f);scene.fog=new THREE.Fog(opts.fog||0x07101f,10,35);const camera=new THREE.PerspectiveCamera(55,1,.1,100);camera.position.set(0,2,7);const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;wrap.appendChild(renderer.domElement);const hemi=new THREE.HemisphereLight(0xffffff,0x203040,2.2);scene.add(hemi);const light=new THREE.DirectionalLight(0xffffff,2.5);light.position.set(4,8,6);light.castShadow=true;light.shadow.mapSize.set(1024,1024);scene.add(light);function resize(){const r=wrap.getBoundingClientRect();renderer.setSize(Math.max(280,r.width),Math.max(190,r.height),false);camera.aspect=r.width/Math.max(190,r.height);camera.updateProjectionMatrix()}resize();return{scene,camera,renderer,wrap,resize}}
function mat(c,rough=.55,metal=.1){return new THREE.MeshStandardMaterial({color:c,roughness:rough,metalness:metal})}
function cube(s,c){return new THREE.Mesh(new THREE.BoxGeometry(...s),mat(c))}
function sphere(r,c){return new THREE.Mesh(new THREE.SphereGeometry(r,20,14),mat(c))}
function addText(scene,text,x,y,z,size=.4){const c=document.createElement("canvas"),ctx=c.getContext("2d");ctx.font="bold 42px sans-serif";ctx.fillStyle="white";ctx.textAlign="center";ctx.fillText(text,128,60);const t=new THREE.CanvasTexture(c);const m=new THREE.SpriteMaterial({map:t,transparent:true});const sp=new THREE.Sprite(m);sp.position.set(x,y,z);sp.scale.set(size,size*.35,1);scene.add(sp);return sp}

let activeAnimation=null;
function stop3D(){if(activeAnimation){cancelAnimationFrame(activeAnimation);activeAnimation=null}}

let reactionTimer,reactReady=false,reactStart;
function reaction(){if(!THREE)return ensureThree(()=>reaction());const box=document.getElementById("reactionResult");clearTimeout(reactionTimer);reactReady=false;stop3D();const g=make3D(box);g.camera.position.set(0,0,6);const cube3=cube([2.2,2.2,2.2],0x555555);g.scene.add(cube3);function loop(){cube3.rotation.x+=.01;cube3.rotation.y+=.015;g.renderer.render(g.scene,g.camera);activeAnimation=requestAnimationFrame(loop)}loop();g.renderer.domElement.onclick=()=>{if(reactReady){const ms=Math.round(performance.now()-reactStart);saveHigh("reaction",ms,true);reactReady=false;box.innerHTML='<strong>⚡ '+ms+' ms</strong>'+highText("reaction"," ms")+'<br><button onclick="reaction()">Nochmal</button>'}else{clearTimeout(reactionTimer);box.innerHTML='<strong>❌ Fehlstart!</strong><br><button onclick="reaction()">Nochmal</button>'}};reactionTimer=setTimeout(()=>{reactReady=true;cube3.material.color.set(0x22dd66)},1000+Math.random()*3000)}
document.addEventListener("click",e=>{if(!reactReady&&e.target.classList.contains("reactionBtn")&&!e.target.classList.contains("goBtn")){clearTimeout(reactionTimer);document.getElementById("reactionResult").innerHTML='<strong>❌ Fehlstart!</strong><br><button onclick="reaction()">Nochmal</button>'}if(reactReady&&e.target.classList.contains("goBtn")){const ms=Math.round(performance.now()-reactStart);saveHigh("reaction",ms,true);document.getElementById("reactionResult").innerHTML='<strong>⚡ '+ms+' ms</strong>'+highText("reaction"," ms")+'<br><button onclick="reaction()">Nochmal</button>';reactReady=false}});

function reaction3D(){const box=document.getElementById("reaction3DBox"),g=make3D(box);const cube3=cube([2.2,2.2,2.2],0x666666);g.scene.add(cube3);g.camera.position.set(0,0,6);let running=true;function loop(){if(!running)return;cube3.rotation.x+=.008;cube3.rotation.y+=.012;g.renderer.render(g.scene,g.camera);activeAnimation=requestAnimationFrame(loop)}loop();setTimeout(()=>{if(running){cube3.material.color.set(0x22dd66);running=false}},1000+Math.random()*2500)}

let spaceRun;
function space(){if(!THREE)return ensureThree(()=>space());const b=document.getElementById("spaceBox");clearInterval(spaceRun);stop3D();const g=make3D(b);g.camera.position.set(0,1,9);const ship=new THREE.Group();const body=new THREE.Mesh(new THREE.ConeGeometry(.45,1.6,16),mat(0xdddddd));body.rotation.x=Math.PI/2;ship.add(body);const wing1=cube([1.5,.12,.5],0x3366ff),wing2=wing1.clone();wing1.position.x=-.7;wing2.position.x=.7;ship.add(wing1,wing2);ship.position.y=-2.2;g.scene.add(ship);const stars=new THREE.Group();for(let i=0;i<40;i++){const s=sphere(.035,0xffffff);s.position.set((Math.random()-.5)*12,(Math.random()-.5)*7,-Math.random()*18);stars.add(s)}g.scene.add(stars);let score=0,obs=[],x=0,tick=0,alive=true;const scoreEl=document.createElement("div");scoreEl.className="score3d";scoreEl.textContent="Score: 0";b.appendChild(scoreEl);function move(d){x=Math.max(-3.2,Math.min(3.2,x+d));ship.position.x=x}b.querySelector(".threeWrap").onpointerdown=e=>{if(e.clientX<innerWidth/2)move(-.6);else move(.6)};document.onkeydown=e=>{if(e.key==="ArrowLeft")move(-.6);if(e.key==="ArrowRight")move(.6)};function end(){alive=false;clearInterval(spaceRun);stop3D();b.innerHTML='<strong>💥 Asteroid getroffen! Score '+score+'</strong>'+highText("space","")+'<br><button onclick="space()">Nochmal</button>'}spaceRun=setInterval(()=>{if(!alive)return;tick++;if(tick%16===0){const o=sphere(.35+Math.random()*.35,0x777777);o.position.set((Math.random()-.5)*7,2.8,-10);o.userData.passed=false;g.scene.add(o);obs.push(o)}obs.forEach(o=>{o.position.z+=.13+score*.001;o.rotation.x+=.03;o.rotation.y+=.04;if(!o.userData.passed&&o.position.z>7){o.userData.passed=true;score++;scoreEl.textContent="Score: "+score}if(Math.abs(o.position.x-ship.position.x)<.75&&Math.abs(o.position.z-ship.position.z)<.9&&Math.abs(o.position.y-ship.position.y)<.9)end();if(o.position.z>10){g.scene.remove(o)}})},50);function loop(){if(!alive)return;g.renderer.render(g.scene,g.camera);activeAnimation=requestAnimationFrame(loop)}loop()}

function memory(){if(!THREE)return ensureThree(()=>memory());const r=document.getElementById("memoryResult");r.innerHTML="";const g=make3D(r);g.wrap.style.height="220px";const vals=["🍎","🚀","⭐","🐱","🍎","🚀","⭐","🐱"];let open=[],done=0,moves=0,start=performance.now();const cards=[];vals.sort(()=>Math.random()-.5).forEach((v,i)=>{const group=new THREE.Group();const base=cube([1.3,.16,1.3],0x315b9a);const label=addText(group,v,0,.12,0,.65);label.visible=false;group.add(base);group.position.set((i%4-1.5)*1.55,0,Math.floor(i/4)*-1.55);group.rotation.x=-.15;group.userData={v,open:false,done:false};group.addEventListener;g.scene.add(group);cards.push(group);group.traverse(o=>{if(o.isMesh)o.userData.card=group});base.userData.card=group});g.camera.position.set(0,3.8,7.5);g.camera.lookAt(0,0,-.8);function pick(clientX,clientY){const rect=g.renderer.domElement.getBoundingClientRect(),mouse=new THREE.Vector2((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1),ray=new THREE.Raycaster();ray.setFromCamera(mouse,g.camera);const hit=ray.intersectObjects(cards,true)[0];if(!hit)return;const c=hit.object.userData.card;if(!c||c.userData.open||c.userData.done||open.length>=2)return;c.userData.open=true;c.children[0].material.color.set(0x22aa66);c.children.find(x=>x.isSprite).visible=true;open.push(c);moves++;if(open.length===2){if(open[0].userData.v===open[1].userData.v){open.forEach(x=>x.userData.done=true);done+=2;open=[]}else setTimeout(()=>{open.forEach(x=>{x.userData.open=false;x.children[0].material.color.set(0x315b9a);x.children.find(y=>y.isSprite).visible=false});open=[]},550)}if(done===8){const sec=((performance.now()-start)/1000).toFixed(1);saveHigh("memory",Number(sec),true);r.insertAdjacentHTML("beforeend",'<p>🏆 '+sec+' s bei '+moves+' Zügen</p>'+highText("memory"," s")+'<br><button onclick="memory()">Nochmal</button>')}}g.renderer.domElement.onpointerdown=e=>pick(e.clientX,e.clientY);function loop(){cards.forEach(c=>{if(c.userData.open)c.rotation.y+=.02});g.renderer.render(g.scene,g.camera);activeAnimation=requestAnimationFrame(loop)}loop()}

function aim(){if(!THREE)return ensureThree(()=>aim());const b=document.getElementById("aimBox");stop3D();const g=make3D(b);let n=0,start=performance.now(),target=sphere(.42,0xff3333);g.scene.add(target);g.camera.position.set(0,0,8);function next(){target.position.set((Math.random()-.5)*5,(Math.random()-.5)*3,-Math.random()*2);target.scale.setScalar(Math.max(.5,1-n*.05))}next();g.renderer.domElement.onpointerdown=e=>{const r=g.renderer.domElement.getBoundingClientRect(),m=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),ray=new THREE.Raycaster();ray.setFromCamera(m,g.camera);if(ray.intersectObject(target).length){n++;if(n>=10){const sec=((performance.now()-start)/1000).toFixed(3);saveHigh("aim",Number(sec),true);b.innerHTML='<strong>🎯 '+sec+' s</strong>'+highText("aim"," s")+'<br><button onclick="aim()">Nochmal</button>';return}next()}};function loop(){target.rotation.y+=.03;g.renderer.render(g.scene,g.camera);activeAnimation=requestAnimationFrame(loop)}loop()}

let planeFrame;
function flappy(){if(!THREE)return ensureThree(()=>flappy());const b=document.getElementById("flappyBox");stop3D();const g=make3D(b);g.camera.position.set(0,0,10);const plane=new THREE.Group();const fuselage=cube([1.4,.25,.45],0xffffff);fuselage.castShadow=true;plane.add(fuselage);const wing=cube([2.4,.08,.55],0x3366ff);wing.castShadow=true;plane.add(wing);plane.position.x=-3.2;g.scene.add(plane);let y=0,v=0,score=0,obs=[],alive=true,spawn=0,last=performance.now();b.onpointerdown=()=>{v=.13};document.onkeydown=e=>{if(e.code==="Space"||e.key==="ArrowUp"){e.preventDefault();v=.13}};function end(){alive=false;stop3D();b.innerHTML='<strong>💥 Game Over – Score '+score+'</strong>'+highText("flappy","")+'<br><button onclick="flappy()">Nochmal</button>'}function loop(now){if(!alive)return;const dt=Math.min((now-last)/16,2);last=now;v-=.008*dt;y+=v*dt;plane.position.y=y;spawn-=dt;if(y<-3.3||y>3.3)return end();if(spawn<=0){spawn=Math.max(38,65-score*.7);const gap=Math.max(2.1,3.5-score*.035),center=(Math.random()-.5)*3.5;const top=cube([1,6,1],0x44aa55),bot=cube([1,6,1],0x44aa55);top.position.set(5,center+gap/2+3,-1);bot.position.set(5,center-gap/2-3,-1);g.scene.add(top,bot);obs.push({top,bot,x:5,pass:false})}obs.forEach(o=>{o.x-=.06+.001*score;o.top.position.x=o.bot.position.x=o.x;if(!o.pass&&o.x<plane.position.x){o.pass=true;score++}if(o.x<-.5&&Math.abs(o.x-plane.position.x)<.8&&(plane.position.y>o.top.position.y-3||plane.position.y<o.bot.position.y+3))end()});g.renderer.render(g.scene,g.camera);activeAnimation=requestAnimationFrame(loop)}loop(performance.now())}

let raceRun;
function racing(){if(!THREE)return ensureThree(()=>racing());const b=document.getElementById("racingBox");stop3D();const g=make3D(b);g.camera.position.set(0,3.5,8);const road=cube([7,.15,22],0x333333);road.position.y=-2.2;road.receiveShadow=true;g.scene.add(road);for(let z=-10;z<10;z+=3){const line=cube([.12,.03,1.2],0xffffff);line.position.set(0,-2.1,z);line.receiveShadow=true;g.scene.add(line)}const grass=cube([18,.1,24],0x315b35);grass.position.y=-2.35;grass.position.z=-1;g.scene.add(grass);const car=cube([1.1,.55,1.8],0xff3333);car.position.set(0,-1.55,3);car.castShadow=true;g.scene.add(car);let x=0,score=0,obs=[],tick=0,alive=true;function move(d){x=Math.max(-2.7,Math.min(2.7,x+d));car.position.x=x}document.onkeydown=e=>{if(e.key==="ArrowLeft")move(-.7);if(e.key==="ArrowRight")move(.7)};g.renderer.domElement.onpointerdown=e=>move(e.clientX<innerWidth/2?-.7:.7);function end(){alive=false;stop3D();b.innerHTML='<strong>🏁 Unfall! Score '+score+'</strong>'+highText("racing","")+'<br><button onclick="racing()">Nochmal</button>'}raceRun=setInterval(()=>{if(!alive)return;tick++;const speed=.11+score*.002;if(tick%Math.max(10,26-Math.floor(score/3))===0){const o=cube([1.1,.55,1.8],0x3366ff);o.position.set((Math.random()-.5)*5.2, -1.55,-12);g.scene.add(o);obs.push(o)}obs.forEach(o=>{o.position.z+=speed;if(o.position.z>2){score++;g.scene.remove(o)}if(Math.abs(o.position.x-car.position.x)<1&&Math.abs(o.position.z-car.position.z)<1.2)end()});obs=obs.filter(o=>o.parent);g.renderer.render(g.scene,g.camera)},50)}

let pongRun;
function pong(){if(!THREE)return ensureThree(()=>pong());const b=document.getElementById("pongBox");stop3D();const g=make3D(b);g.camera.position.set(0,0,11);const field=cube([10,.2,7],0x101010);g.scene.add(field);const p=cube([.35,2,.4],0xffffff),cpu=cube([.35,2,.4],0xffffff),ball=sphere(.32,0xffffff);p.position.x=-4.5;cpu.position.x=4.5;g.scene.add(p,cpu,ball);let py=0,cy=0,bx=0,by=0,vx=.09,vy=.07,ps=0,cs=0;function move(d){py=Math.max(-2.2,Math.min(2.2,py+d));p.position.y=py}document.onkeydown=e=>{if(e.key==="ArrowUp")move(.45);if(e.key==="ArrowDown")move(-.45)};g.renderer.domElement.onpointerdown=e=>{const r=g.renderer.domElement.getBoundingClientRect();move(e.clientY<r.top+r.height/2?.45:-.45)};pongRun=setInterval(()=>{bx+=vx;by+=vy;cy+=(by-cy)*.05;if(by>3.1||by<-3.1)vy*=-1;if(bx<-4.1&&Math.abs(by-py)<1.4){vx=Math.abs(vx)+.002;bx=-4.1}if(bx>4.1&&Math.abs(by-cy)<1.4){vx=-Math.abs(vx)-.002;bx=4.1}if(bx<-5){cs++;bx=0;by=0;vx=.09;vy=(Math.random()-.5)*.14}if(bx>5){ps++;bx=0;by=0;vx=-.09;vy=(Math.random()-.5)*.14}ball.position.set(bx,by,1);cpu.position.y=cy;if(ps>=5||cs>=5){clearInterval(pongRun);b.innerHTML='<strong>🏓 '+(ps>cs?'Du gewinnst!':'Computer gewinnt!')+' '+ps+' : '+cs+'</strong>'+highText("pong"," Punkte")+'<br><button onclick="pong()">Nochmal</button>';return}g.renderer.render(g.scene,g.camera)},30)}

function flight3d(){if(!THREE)return ensureThree(()=>flight3d());const b=document.getElementById("flight3dBox");stop3D();const g=make3D(b);g.camera.position.set(0,1,9);const plane=cube([1,.25,1.6],0xffffff);plane.position.set(0,0,2);g.scene.add(plane);let x=0,y=0,score=0,objects=[],alive=true;function steer(dx,dy){x=Math.max(-3.5,Math.min(3.5,x+dx));y=Math.max(-2.4,Math.min(2.4,y+dy));plane.position.set(x,y,2)}document.onkeydown=e=>{if(e.key==="ArrowLeft")steer(-.45,0);if(e.key==="ArrowRight")steer(.45,0);if(e.key==="ArrowUp")steer(0,.4);if(e.key==="ArrowDown")steer(0,-.4)};g.renderer.domElement.onpointerdown=e=>{const r=g.renderer.domElement.getBoundingClientRect();steer(e.clientX<r.left+r.width/2?-.45:.45,e.clientY<r.top+r.height/2?.4:-.4)};for(let i=0;i<10;i++){const o=Math.random()<.6?new THREE.Mesh(new THREE.TorusGeometry(1,.12,10,24),mat(0xffcc33)):cube([1.5,1.5,1.5],0xcc4444);o.position.set((Math.random()-.5)*7,(Math.random()-.5)*5,-i*5-5);g.scene.add(o);objects.push(o)}function end(){alive=false;stop3D();b.innerHTML='<strong>💥 Flug beendet – Score '+score+'</strong>'+highText("flight3d","")+'<br><button onclick="flight3d()">Nochmal</button>'}function loop(){if(!alive)return;objects.forEach(o=>{o.position.z+=.08+score*.002;o.rotation.x+=.015;o.rotation.y+=.02;if(o.position.z>3){o.position.z=-30;o.position.x=(Math.random()-.5)*7;o.position.y=(Math.random()-.5)*5;score++}if(o.position.z>1&&o.position.z<3&&Math.abs(o.position.x-x)<1&&Math.abs(o.position.y-y)<1)end()});g.renderer.render(g.scene,g.camera);activeAnimation=requestAnimationFrame(loop)}loop()}

function boot3D(){if(!window.THREE)return;document.querySelectorAll(".threeStart").forEach(b=>b.disabled=false)}

let flightSimFrame;
function flightSim(){
 if(!THREE)return ensureThree(()=>flightSim());
 stop3D();
 const b=document.getElementById("flightSimBox"),g=make3D(b,{bg:0x72b8e8,fog:0x72b8e8});
 g.camera.position.set(0,2.0,8);
 const world=new THREE.Group();g.scene.add(world);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(100,220),mat(0x3f8f45));ground.rotation.x=-Math.PI/2;ground.position.set(0,-2.25,-70);ground.receiveShadow=true;world.add(ground);
 const runway=cube([7,.06,65],0x4a4a4a);runway.position.set(0,-2.18,-8);runway.receiveShadow=true;world.add(runway);
 for(let z=20;z>-55;z-=6){const line=cube([.25,.04,2.5],0xffffff);line.position.set(0,-2.1,z);world.add(line)}
 // Destination island airport runway: it approaches the aircraft when the world scrolls.
 const destinationRunway=cube([9,.06,70],0x444444);
 destinationRunway.position.set(0,-2.18,-335);
 destinationRunway.receiveShadow=true;
 world.add(destinationRunway);
 for(let z=-305;z>-370;z-=6){const line=cube([.28,.04,2.5],0xffffff);line.position.set(0,-2.1,z);world.add(line)}
 const airportApron=cube([18,.05,28],0x555555);
 airportApron.position.set(12,-2.17,-335);
 world.add(airportApron);

 for(let x=-35;x<=35;x+=7){for(let z=15;z>-120;z-=12){const t=cube([.25,.9,.25],0x70452b);const crown=sphere(.75,0x237a3a);const tree=new THREE.Group();t.position.y=-1.65;crown.position.y=-.8;tree.add(t,crown);tree.position.set(x+(Math.random()-.5)*2,0,z+(Math.random()-.5)*4);tree.scale.setScalar(.7+Math.random()*.7);world.add(tree)}}
 for(let x=-28;x<=28;x+=14){const hill=sphere(5,0x507c4b);hill.scale.y=.5;hill.position.set(x,-.2,-80-Math.random()*25);world.add(hill)}
 const clouds=new THREE.Group();for(let i=0;i<18;i++){const cl=new THREE.Group();for(let j=0;j<4;j++){const p=sphere(.7,0xffffff);p.position.set((Math.random()-.5)*1.6,Math.random()*.8,(Math.random()-.5)*1.4);cl.add(p)}cl.position.set((Math.random()-.5)*30,5+Math.random()*5,-15-Math.random()*90);cl.scale.setScalar(1+Math.random());clouds.add(cl)}world.add(clouds);
 const plane=new THREE.Group();const fus=cube([1.05,.34,2.4],0xf4f4f4);const wings=cube([3.4,.1,.65],0x3267b1);const tail=cube([.65,.55,.3],0xf4f4f4);tail.position.z=1;plane.add(fus,wings,tail);plane.position.set(0,.2,5);plane.castShadow=true;g.scene.add(plane);
 const cockpit=cube([.72,.28,.5],0x172b50);cockpit.position.set(0,.2,-.25);plane.add(cockpit);
 const hud=document.createElement("div");hud.className="flightHud";b.appendChild(hud);
 const controls=document.createElement("div");controls.className="flightSimControls";controls.innerHTML='<button data-fs="left">◀</button><button data-fs="up">▲</button><button data-fs="down">▼</button><button data-fs="right">▶</button><button data-fs="yawL">↶</button><button data-fs="yawR">↷</button>';b.appendChild(controls);
 const throttle=document.createElement("input");throttle.type="range";throttle.min="0";throttle.max="100";throttle.value="55";throttle.className="flightThrottle";b.appendChild(throttle);
 const msg=document.createElement("div");msg.className="flightMessage";msg.textContent="🛫 Startflug – halte das Flugzeug über der Landebahn";b.appendChild(msg);
 let px=0,py=.2,pitch=0,roll=0,heading=0,speed=.055,alt=500,distance=0,alive=true,last=performance.now(),takeoff=false,landing=false;
 function steer(dx,dy){px=Math.max(-4.5,Math.min(4.5,px+dx));py=Math.max(-1.8,Math.min(3.2,py+dy))}
 controls.querySelector('[data-fs="left"]').onpointerdown=()=>steer(-.45,0);
 controls.querySelector('[data-fs="right"]').onpointerdown=()=>steer(.45,0);
 controls.querySelector('[data-fs="up"]').onpointerdown=()=>steer(0,.28);
 controls.querySelector('[data-fs="down"]').onpointerdown=()=>steer(0,-.28);
 document.onkeydown=e=>{if(e.key==="ArrowLeft")steer(-.35,0);if(e.key==="ArrowRight")steer(.35,0);if(e.key==="ArrowUp")steer(0,.22);if(e.key==="ArrowDown")steer(0,-.22);if(e.key==="w"||e.key==="W")throttle.value=Math.min(100,+throttle.value+5);if(e.key==="s"||e.key==="S")throttle.value=Math.max(0,+throttle.value-5)};
 function end(text){alive=false;stop3D();b.innerHTML='<strong>'+text+'</strong><br><button onclick="flightSim()">Nochmal</button>'}
 function loop(now){if(!alive)return;const dt=Math.min((now-last)/16,2);last=now;const power=+throttle.value;speed=.025+power*.00075;world.position.z+=speed*dt;distance+=speed*dt*.2;const targetAlt=takeoff?1800:Math.max(500,1800+py*650);alt+=(targetAlt-alt)*.015*dt;heading=(heading+px*.12*dt+360)%360;plane.position.x=px;plane.position.y=py;plane.rotation.z=-px*.07;plane.rotation.x=-py*.035;
 if(!takeoff&&distance>1.2){takeoff=true;msg.textContent="🛫 Abgehoben! Steuere Höhe und Kurs mit den Pfeilen."}
 if(takeoff&&distance>8&&distance<12){msg.textContent="☁️ Reiseflug – Wolken und Landschaft unter dir."}
 if(takeoff&&distance>16){landing=true;msg.textContent="🛬 Landeanflug: zurück zur Landebahn!"}
 if(landing&&distance>25){if(Math.abs(px)<1.1&&py>-1.7&&py<-.8&&power<35)end("🛬 Perfekte Landung!");else end("💥 Landung verpasst");}
 if(py<-1.75||py>3.15)return end("⚠️ Flugzeug außer Kontrolle");
 hud.innerHTML="ALT "+Math.round(alt)+" m<br>SPEED "+Math.round(140+power*2.2)+" km/h<br>HDG "+String(Math.round(heading)).padStart(3,"0")+"°<br>THR "+power+"%<br>DIST "+distance.toFixed(1)+" km";
 g.renderer.render(g.scene,g.camera);activeAnimation=requestAnimationFrame(loop)}
 loop(performance.now());
}

// Real internet 3D aircraft
let realObjLoaderPromise=null;
function ensureOBJLoader(done){
 if(THREE&&THREE.OBJLoader)return done(true);
 if(realObjLoaderPromise)return realObjLoaderPromise.then(()=>done(true)).catch(()=>done(false));
 realObjLoaderPromise=new Promise((resolve,reject)=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/loaders/OBJLoader.js";s.onload=()=>THREE&&THREE.OBJLoader?resolve():reject();s.onerror=reject;document.head.appendChild(s)});
 realObjLoaderPromise.then(()=>done(true)).catch(()=>done(false));
}
function flightSimReal(){
 if(!THREE)return ensureThree(()=>flightSimReal());
 stop3D();
 const b=document.getElementById("flightSimBox"),g=make3D(b,{bg:0x79bfe8,fog:0x79bfe8});
 const world=new THREE.Group();g.scene.add(world);
 const water=new THREE.Mesh(new THREE.PlaneGeometry(900,900),mat(0x167ca4,.75));water.rotation.x=-Math.PI/2;water.position.set(0,-2.55,-190);world.add(water);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(300,520),mat(0x4d9147));ground.rotation.x=-Math.PI/2;ground.position.set(0,-2.35,-185);world.add(ground);
 function runway(x,z,len,w){const r=cube([w,.08,len],0x444444);r.position.set(x,-2.18,z);world.add(r);for(let p=z+len/2-7;p>z-len/2+7;p-=7){const m=cube([.34,.04,3.1],0xffffff);m.position.set(x,-2.11,p);world.add(m)}const a=cube([.18,.04,len],0xf2f2f2),q=a.clone();a.position.set(x-w/2+.35,-2.11,z);q.position.set(x+w/2-.35,-2.11,z);world.add(a,q)}
 runway(0,-28,112,10);runway(-105,-160,72,7);
 const taxi=cube([5,.06,185],0x555555);taxi.position.set(17,-2.13,-82);world.add(taxi);
 for(let z=8;z>-175;z-=12){const m=cube([.2,.03,4],0xf0d85a);m.position.set(17,-2.08,z);world.add(m)}
 function road(x,z,w,d,rot=0){const r=cube([w,.055,d],0x4d4d4d);r.position.set(x,-2.08,z);r.rotation.y=rot;world.add(r);const l=cube([.12,.025,d*.72],0xe0dfb4);l.position.set(x,-2.015,z);l.rotation.y=rot;world.add(l)}
 road(-28,-118,4,210,.04);road(48,-142,4,190,-.035);road(4,-210,5,170,Math.PI/2);
 function island(x,z,w,d){const m=new THREE.Mesh(new THREE.CylinderGeometry(w*.42,w,w*.13,28),mat(0x4b9145));m.scale.z=d/w;m.position.set(x,-2.08,z);world.add(m);for(let i=0;i<4;i++){const h=new THREE.Mesh(new THREE.ConeGeometry(w*.1,w*.28,12),mat(0x568441));h.position.set(x+(i-1.5)*w*.2,-1.72,z+(i%2)*d*.2-d*.1);world.add(h)}}
 island(-82,-72,62,92);island(82,-105,66,105);island(-72,-235,76,115);island(92,-315,70,120);
 function tree(x,z,s=1){const h=new THREE.Group(),t=cube([.24,1.4,.24],0x74502f),c=sphere(.85,0x2f7d3c);t.position.y=-1.2;c.position.y=-.05;h.add(t,c);h.position.set(x,-.15,z);h.scale.setScalar(s);world.add(h)}
 for(let i=0;i<72;i++){const side=i%2?1:-1;tree(side*(14+(i*19)%62),18-i*4.5,.65+(i%4)*.13)}
 for(let i=0;i<35;i++)tree(-70+(i%7)*20,-90-Math.floor(i/7)*24,.7+(i%3)*.15);
 for(let i=0;i<16;i++){const side=i%2?1:-1,h=new THREE.Mesh(new THREE.ConeGeometry(12+(i%4)*4,18+(i%5)*5,12),mat(0x587d4c));h.position.set(side*(88+(i%3)*12),5,-35-i*22);world.add(h)}
 const apron=cube([58,.07,48],0x555555);apron.position.set(0,-2.12,-6);world.add(apron);
 const terminal=cube([26,2.8,8],0xb9c0c8);terminal.position.set(0,-.65,18);world.add(terminal);const roof=cube([28,.35,10],0x303943);roof.position.set(0,.95,18);world.add(roof);
 const tower=new THREE.Group(),shaft=cube([2.2,9,2.2],0x9ea7ad),cab=cube([4,1.5,4],0x24374a);shaft.position.y=2.2;cab.position.y=6.7;tower.add(shaft,cab);tower.position.set(20,-2,-2);world.add(tower);
 const bu=["assets/environment/Building_Small.glb","assets/environment/Building_Medium.glb","assets/environment/Building_Large.glb"];
 const placements=[[-18,-2,20,2],[20,-2,20,1.7],[-24,-2,-48,1.8],[24,-2,-54,1.7],[-30,-2,-76,1.5],[30,-2,-82,1.5],[-42,-2,-112,1.8],[-25,-2,-124,1.7],[25,-2,-130,1.5],[42,-2,-142,1.8],[-38,-2,-168,1.6],[38,-2,-178,1.5],[-62,-2,-202,1.5],[62,-2,-214,1.6]];
 placements.forEach(a=>{const h=new THREE.Group();h.position.set(a[0],a[1],a[2]);h.scale.setScalar(a[3]);world.add(h);loadRealGLB(bu[Math.abs(a[0]+a[2])%3],h,()=>{})});
 for(let row=0;row<6;row++)for(let col=0;col<7;col++){const x=-54+col*18+(row%2)*5,z=-95-row*22;if(Math.abs(x)<12)continue;const h=new THREE.Group();h.position.set(x,-2,z);h.scale.setScalar(1.25+(row%3)*.12);world.add(h);loadRealGLB(bu[(row*7+col)%3],h,()=>{})}
 const harbour=cube([48,.08,30],0x4d5960);harbour.position.set(73,-2.08,-225);world.add(harbour);for(let i=0;i<5;i++){const d=cube([5,.12,26],0x775a3e);d.position.set(48+i*12,-1.96,-225);world.add(d)}
 const bridge=cube([9,.4,58],0x696969);bridge.position.set(0,-1.85,-250);world.add(bridge);
 const props=[["assets/environment/Tree_Quaternius_1.glb",-70,-2,-120,1.5],["assets/environment/Tree_Quaternius_2.glb",70,-2,-145,1.5],["assets/environment/Tree_Quaternius_3.glb",-72,-2,-180,1.5],["assets/environment/Bush.glb",72,-2,-190,1.7],["assets/environment/Rock_01.glb",-58,-2,-228,1.2],["assets/environment/Rock_02.glb",58,-2,-238,1.2],["assets/environment/Bench_01.glb",-12,-2,-72,1.1],["assets/environment/Fence_01.glb",12,-2,-72,1]];
 props.forEach(a=>{const h=new THREE.Group();h.position.set(a[1],a[2],a[3]);h.scale.setScalar(a[4]);world.add(h);loadRealGLB(a[0],h,()=>{})});
 const urls={A320:"assets/A320_nologo.glb",A350:"assets/A350_nologo.glb",B737:"assets/B737_nologo.glb",A380:"assets/imported/A380_nologo.glb",B787:"assets/imported/B787_nologo.glb",EVTOL:"assets/imported/EVTOL_nologo.glb",Drone:"assets/imported/drone_nologo.glb"};
 const traffic=[];[["A320",-16,2,-38,.8],["B737",18,4,-70,.65],["A350",-22,5,-118,.7],["B787",25,7,-166,.65],["EVTOL",-38,3,-205,.55]].forEach(a=>{const h=new THREE.Group();h.position.set(a[1],a[2],a[3]);h.scale.setScalar(a[4]);world.add(h);traffic.push(h);loadRealGLB(urls[a[0]],h,()=>{})});
 const plane=new THREE.Group();plane.position.set(0,.25,6);g.scene.add(plane);
 let viewMode="external",cockpitGroup=null;
 const viewBar=document.createElement("div");viewBar.style.cssText="position:absolute;left:50%;top:5px;transform:translateX(-50%);z-index:25;display:flex;gap:2px;flex-wrap:nowrap;justify-content:center;width:96%";
 viewBar.innerHTML='<button style="font-size:10px;padding:3px 5px" data-view="cockpit">🛫 Cockpit</button><button style="font-size:10px;padding:3px 5px" data-view="external">🌍 Außen</button><button style="font-size:10px;padding:3px 5px" data-view="wing">🪽 Flügel</button><button style="font-size:10px;padding:3px 5px" data-view="cabin">💺 Kabine</button>';b.appendChild(viewBar);
 const cockpitHud=document.createElement("div");cockpitHud.style.cssText="position:absolute;inset:0;pointer-events:none;z-index:18;display:none;color:#d9f5ff;font-family:monospace";
 cockpitHud.innerHTML='<div style="position:absolute;left:4%;top:4%;width:92%;height:60%;border:1px solid rgba(180,220,230,.5);background:rgba(3,9,14,.78);border-radius:8px;overflow:hidden"><div style="position:absolute;left:8%;top:6%;width:68%;height:88%;border:1px solid rgba(255,255,255,.25);overflow:hidden;background:linear-gradient(#4389c7 0 50%,#76563b 50% 100%)"><div id="cpPitchLadder" style="position:absolute;inset:-20%;background:repeating-linear-gradient(to bottom,transparent 0,transparent 9%,rgba(255,255,255,.85) 9.5%,transparent 10%);transform:translateY(0) rotate(0deg)"></div><div style="position:absolute;left:25%;right:25%;top:49%;height:2px;background:#ffd44d"></div><div style="position:absolute;left:40%;right:40%;top:43%;height:1px;background:#fff"></div><div style="position:absolute;left:40%;right:40%;top:55%;height:1px;background:#fff"></div><div id="cpHorizonText" style="position:absolute;left:5px;top:5px;font-size:9px">PITCH 0°</div></div><div style="position:absolute;right:3%;top:8%;font-size:10px">SPD<br><span id="cpSpeed">0</span></div><div style="position:absolute;right:3%;top:42%;font-size:10px">ALT<br><span id="cpAlt">120</span>m</div><div style="position:absolute;right:3%;bottom:8%;font-size:10px">VS<br><span id="cpVs">+0</span></div><div style="position:absolute;left:3%;bottom:7%;font-size:9px">BANK <span id="cpBank">0</span>°</div><div style="position:absolute;left:3%;top:7%;font-size:9px">HDG <span id="cpHdg">000</span>°</div><div style="position:absolute;left:4%;bottom:4%;font-size:9px">PFD</div></div><div style="position:absolute;left:4%;bottom:7%;width:92%;height:23%;border:1px solid rgba(180,220,230,.45);background:rgba(10,18,24,.72);border-radius:8px;padding:6px;box-sizing:border-box;font-size:10px"><div>A320 FLIGHT DISPLAY</div><div style="margin-top:5px">SPD <span id="cpSpeed2">0</span> &nbsp; ALT <span id="cpAlt2">120</span>m &nbsp; HDG <span id="cpHdg2">000</span>°</div><div style="margin-top:4px">VS <span id="cpVs2">+0</span> &nbsp; PITCH <span id="cpPitch2">0</span>° &nbsp; BANK <span id="cpBank2">0</span>° &nbsp; THR <span id="cpThr">60</span>%</div><div style="margin-top:4px">TRIM <span id="cpTrim">0.0</span>° &nbsp; <span id="cpAp">MANUAL</span></div></div><div style="position:absolute;left:37%;bottom:1%;font-size:8px">A320 COCKPIT • PFD / FLIGHT DATA</div>';b.appendChild(cockpitHud);
 function makeA320Cockpit(){
 const cg=new THREE.Group();
 cg.userData.controls={};

 const dark=mat(0x141b1e),panel=mat(0x343b3e),screen=mat(0x07151b),amber=mat(0xd7a84b),white=mat(0xd9e0df);
 const dash=cube([8.2,1.15,1.25],panel);dash.position.set(0,1.15,-1.35);cg.add(dash);
 // Two PFD/ND pairs plus center ECAM, in a simplified A320-inspired layout.
 [-3.0,-1.0,1.0,3.0].forEach((x,i)=>{
  const s=cube([1.65,.9,.09],screen);s.position.set(x,1.45,-2.03);cg.add(s);
  const frame=cube([1.82,1.06,.06],dark);frame.position.set(x,1.45,-2.08);cg.add(frame);
 });
 [0].forEach(x=>{const e=cube([1.65,.9,.08],screen);e.position.set(0,1.42,-2.12);cg.add(e)});
 // glareshield
 const glare=cube([8.3,.28,1.0],dark);glare.position.set(0,1.88,-1.65);glare.rotation.x=-.12;cg.add(glare);
 // windshield pillars
 [-3.9,0,3.9].forEach(x=>{const p=cube([.18,3.2,.18],dark);p.position.set(x,2.65,-.35);p.rotation.z=x===0?0:(x<0?-.035:.035);cg.add(p)});
 // center pedestal
 const pedestal=cube([2.6,.65,2.2],dark);pedestal.position.set(0,.72,-.35);pedestal.rotation.x=-.08;cg.add(pedestal);
 // dual thrust levers
 [-.38,.38].forEach((x,i)=>{const base=cube([.24,.18,.85],panel);base.position.set(x,1.02,-.42);base.rotation.x=-.18;cg.add(base);
  const handle=cube([.28,.5,.18],amber);handle.position.set(x,1.32,-.58);handle.rotation.x=-.18;handle.userData.cockpitControl="throttle";handle.userData.throttleIndex=i;cg.add(handle);cg.userData.controls["throttle"+i]=handle});
 // speed brake + flap levers
 [-.78,.78].forEach((x,i)=>{const l=cube([.12,.42,.12],white);l.position.set(x,.98,.05);l.rotation.x=-.35;l.userData.cockpitControl=i===0?"speedbrake":"flaps";cg.add(l);cg.userData.controls[i===0?"speedbrake":"flaps"]=l});
 // Airbus-style sidesticks
 [-2.9,2.9].forEach(x=>{const stem=cube([.14,.62,.14],dark);stem.position.set(x,.62,-.05);stem.rotation.z=x<0?-.12:.12;cg.add(stem);
  const grip=cube([.28,.38,.28],panel);grip.position.set(x,.95,-.18);grip.userData.cockpitControl="sidestick";cg.add(grip);if(x<0)cg.userData.controls.sidestick=grip;
  for(let j=0;j<3;j++){const btn=cube([.08,.08,.08],amber);btn.position.set(x+(x<0?.08:-.08),1.0-j*.10,-.34);cg.add(btn)}});
 // overhead panel
 const overhead=cube([7.0,1.0,.55],dark);overhead.position.set(0,3.35,-.55);overhead.rotation.x=.15;cg.add(overhead);
 for(let r=0;r<2;r++)for(let i=0;i<14;i++){const sw=cube([.25,.12,.08],i%3===0?amber:panel);sw.position.set(-3.1+i*.48,3.48+r*.22,-.82);cg.add(sw)}
 // rear console details / seats
 [-3.2,3.2].forEach(x=>{const seat=cube([1.5,1.8,.8],dark);seat.position.set(x,-.05,.9);cg.add(seat)});
 const gearLever=cube([.16,.48,.16],amber);gearLever.position.set(.62,.96,.22);gearLever.rotation.x=-.28;gearLever.userData.cockpitControl="gear";cg.add(gearLever);cg.userData.controls.gear=gearLever;
 cg.userData.instrumentMeshes={};
 return cg;
}
 viewBar.querySelectorAll("button").forEach(q=>q.onclick=()=>{viewMode=q.dataset.view;cockpitHud.style.display=viewMode==="cockpit"?"block":"none"});
 function bindCockpitControls(){
 if(!cockpitGroup||selected!=="A320"||cockpitGroup.userData.bound)return;
 cockpitGroup.userData.bound=true;const c=cockpitGroup.userData.controls||{};
 const toggleFlaps=()=>{flaps=!flaps;msg.textContent=flaps?"🪽 Cockpit: Klappen ausgefahren":"🪽 Cockpit: Klappen eingefahren"};
 const toggleGear=()=>{gear=!gear;msg.textContent=gear?"🛬 Cockpit: Fahrwerk ausgefahren":"🛫 Cockpit: Fahrwerk eingefahren"};
 const toggleBrake=()=>{brake=true;msg.textContent="🛑 Cockpit: Bremse";setTimeout(()=>brake=false,700)};
 [c.throttle0,c.throttle1].filter(Boolean).forEach(h=>{h.addEventListener("pointerdown",e=>{e.preventDefault();h.userData.dragging=true;h.userData.lastY=e.clientY;h.setPointerCapture&&h.setPointerCapture(e.pointerId)});h.addEventListener("pointermove",e=>{if(h.userData.dragging){const dy=e.clientY-h.userData.lastY;h.userData.lastY=e.clientY;throttle.value=Math.max(0,Math.min(100,+throttle.value-dy*.45))}});h.addEventListener("pointerup",()=>h.userData.dragging=false);h.addEventListener("pointercancel",()=>h.userData.dragging=false)});
 if(c.flaps)c.flaps.addEventListener("pointerdown",e=>{e.preventDefault();toggleFlaps()});
 if(c.speedbrake)c.speedbrake.addEventListener("pointerdown",e=>{e.preventDefault();toggleBrake()});
 if(c.gear)c.gear.addEventListener("pointerdown",e=>{e.preventDefault();toggleGear()});
 if(c.sidestick){c.sidestick.addEventListener("pointerdown",e=>{e.preventDefault();c.sidestick.userData.dragging=true;c.sidestick.userData.lastX=e.clientX;c.sidestick.userData.lastY=e.clientY;c.sidestick.setPointerCapture&&c.sidestick.setPointerCapture(e.pointerId)});c.sidestick.addEventListener("pointermove",e=>{if(c.sidestick.userData.dragging){const dx=e.clientX-c.sidestick.userData.lastX,dy=e.clientY-c.sidestick.userData.lastY;c.sidestick.userData.lastX=e.clientX;c.sidestick.userData.lastY=e.clientY;px=Math.max(-5.5,Math.min(5.5,px+dx*.035));pitch=Math.max(-12,Math.min(12,pitch-dy*.12))}});c.sidestick.addEventListener("pointerup",()=>c.sidestick.userData.dragging=false);c.sidestick.addEventListener("pointercancel",()=>c.sidestick.userData.dragging=false)}
}
 const msg=document.createElement("div");msg.className="flightMessage";msg.textContent="🛫 Hauptflughafen – starte über die lange Startbahn";b.appendChild(msg);
 const hud=document.createElement("div");hud.className="flightHud";b.appendChild(hud);
 const select=document.createElement("select");select.innerHTML='<option value="A320">✈️ A320</option><option value="A350">✈️ A350</option><option value="B737">✈️ B737</option><option value="A380">✈️ A380</option><option value="B787">✈️ B787</option><option value="EVTOL">🚁 EVTOL</option><option value="Drone">🚁 Drone</option>';select.style.cssText="position:absolute;right:8px;top:42px;z-index:20;padding:5px";b.appendChild(select);
 const weather=document.createElement("select");weather.innerHTML='<option value="clear">☀️ Klar</option><option value="rain">🌧️ Regen</option><option value="night">🌙 Nacht</option>';weather.style.cssText="position:absolute;right:8px;top:78px;z-index:20;padding:5px";b.appendChild(weather);
 const throttle=document.createElement("input");throttle.type="range";throttle.min="0";throttle.max="100";throttle.value="60";throttle.className="flightThrottle";b.appendChild(throttle);
 const controls=document.createElement("div");controls.className="flightSimControls";controls.innerHTML='<button data-fs="left">◀</button><button data-fs="up">▲</button><button data-fs="down">▼</button><button data-fs="right">▶</button><button data-fs="yawL">↶</button><button data-fs="yawR">↷</button>';b.appendChild(controls);

 // Compact A320 FMA / landing annunciator panel.
 const fma=document.createElement("div");fma.style.cssText="position:absolute;left:50%;top:6px;transform:translateX(-50%);z-index:26;background:rgba(4,9,13,.82);border:1px solid rgba(190,210,220,.42);border-radius:5px;padding:4px 7px;font:10px monospace;letter-spacing:.2px;pointer-events:none;white-space:nowrap";fma.innerHTML='<span id="cpMode">MANUAL</span> &nbsp; THR <span id="cpThrMode">IDLE</span> &nbsp; <span id="cpFmaGear">LDG</span>';b.appendChild(fma);
 // Airbus-style cockpit status strip for landing gear and flaps.
 const cockpitStatus=document.createElement("div");cockpitStatus.style.cssText="position:absolute;right:8px;bottom:8px;z-index:25;background:rgba(5,10,16,.78);border:1px solid rgba(180,220,230,.45);border-radius:6px;padding:6px 8px;font-size:10px;line-height:1.45;pointer-events:none";cockpitStatus.innerHTML='GEAR <span id="cpGearState">DOWN</span> &nbsp; FLAPS <span id="cpFlapsState">EXT</span><br>SPD BRK <span id="cpBrakeState">ARM</span> &nbsp; AP <span id="cpApState">OFF</span>';b.appendChild(cockpitStatus);
 const extras=document.createElement("div");extras.style.cssText="position:absolute;left:8px;bottom:8px;z-index:20;display:flex;gap:4px;flex-wrap:wrap";extras.innerHTML='<button data-x="gear">🛬 Fahrwerk</button><button data-x="flaps">🪽 Klappen</button><button data-x="brake">🛑 Bremse</button><button data-x="ap">🧭 AP</button><button data-x="trimUp">▲ Trimm</button><button data-x="trimDown">▼ Trimm</button><button data-x="pause">⏸️</button><button data-x="reset">↻</button>';b.appendChild(extras);
 let selected="A320",px=0,py=.25,heading=0,alt=120,speed=0,verticalSpeed=0,bank=0,pitch=0,yawInput=0,trim=0,last=performance.now(),alive=true,gear=true,flaps=false,brake=false,mission=0,fuel=100,paused=false,autopilot=false,apHeading=0,apAltitude=120,cameraDistance=10;
 function loadAircraft(){plane.clear();msg.textContent="🛫 "+selected+" wird geladen …";loadRealGLB(urls[selected],plane,ok=>{msg.textContent=ok?"🟢 "+selected+" – Welt geladen":"🔴 Flugzeugmodell konnte nicht geladen werden"})}
 select.onchange=()=>{selected=select.value;loadAircraft()};weather.onchange=()=>{const v=weather.value;if(v==="night"){g.scene.background.set(0x071326);g.scene.fog.color.set(0x071326)}else if(v==="rain"){g.scene.background.set(0x6d7884);g.scene.fog.color.set(0x6d7884)}else{g.scene.background.set(0x79bfe8);g.scene.fog.color.set(0x79bfe8)}};
 function steer(dx,dy){px=Math.max(-5.5,Math.min(5.5,px+dx));pitch=Math.max(-12,Math.min(12,pitch+dy*7))}function yaw(v){yawInput=Math.max(-1,Math.min(1,yawInput+v))}
 controls.querySelector('[data-fs="left"]').onpointerdown=()=>steer(-.45,0);controls.querySelector('[data-fs="right"]').onpointerdown=()=>steer(.45,0);controls.querySelector('[data-fs="up"]').onpointerdown=()=>steer(0,.3);controls.querySelector('[data-fs="down"]').onpointerdown=()=>steer(0,-.3);controls.querySelector('[data-fs="yawL"]').onpointerdown=()=>yaw(-.35);controls.querySelector('[data-fs="yawR"]').onpointerdown=()=>yaw(.35);
 document.onkeydown=e=>{if(e.key==="ArrowLeft")steer(-.3,0);if(e.key==="ArrowRight")steer(.3,0);if(e.key==="ArrowUp")steer(0,.2);if(e.key==="ArrowDown")steer(0,-.2);if(e.key==="a"||e.key==="A")yawInput=Math.max(-1,yawInput-.25);if(e.key==="d"||e.key==="D")yawInput=Math.min(1,yawInput+.25);if(e.key==="w"||e.key==="W")throttle.value=Math.min(100,+throttle.value+5);if(e.key==="s"||e.key==="S")throttle.value=Math.max(0,+throttle.value-5);if(e.key==="p"||e.key==="P"){paused=!paused;msg.textContent=paused?"⏸️ Pause":"▶️ Flug fortgesetzt"}if(e.key==="t"||e.key==="T"){autopilot=!autopilot;if(autopilot){apHeading=heading;apAltitude=alt;msg.textContent="🧭 Autopilot EIN"}else msg.textContent="🧭 Autopilot AUS"}};
 extras.querySelector('[data-x="gear"]').onclick=()=>{gear=!gear;msg.textContent=gear?"🛬 Fahrwerk ausgefahren":"🛫 Fahrwerk eingefahren"};extras.querySelector('[data-x="flaps"]').onclick=()=>{flaps=!flaps;msg.textContent=flaps?"🪽 Klappen ausgefahren":"🪽 Klappen eingefahren"};extras.querySelector('[data-x="ap"]').onclick=()=>{autopilot=!autopilot;if(autopilot){apHeading=heading;apAltitude=alt;msg.textContent="🧭 Autopilot EIN – Kurs "+Math.round(apHeading)+"° / Höhe "+Math.round(apAltitude)+" m"}else msg.textContent="🧭 Autopilot AUS"};extras.querySelector('[data-x="trimUp"]').onclick=()=>{trim=Math.min(6,trim+.5);msg.textContent="⬆️ Trimm "+trim.toFixed(1)+"°"};extras.querySelector('[data-x="trimDown"]').onclick=()=>{trim=Math.max(-6,trim-.5);msg.textContent="⬇️ Trimm "+trim.toFixed(1)+"°"};extras.querySelector('[data-x="brake"]').onclick=()=>{brake=true;setTimeout(()=>brake=false,900)};extras.querySelector('[data-x="pause"]').onclick=()=>{paused=!paused;msg.textContent=paused?"⏸️ Pause":"▶️ Flug fortgesetzt"};extras.querySelector('[data-x="reset"]').onclick=()=>{alive=false;setTimeout(()=>flightSimReal(),0)};
 function loop(now){if(!alive)return;const dt=Math.min((now-last)/16,2);last=now;if(paused){activeAnimation=requestAnimationFrame(loop);return}const power=+throttle.value;
 const ground=alt<=0.5;
 const rotationSpeed=145,stallSpeed=105,landingSpeed=145;
 if(autopilot&&!ground&&mission<4){
   const hdgError=((apHeading-heading+540)%360)-180;
   px+=Math.max(-.28,Math.min(.28,hdgError*.006));
   const altError=apAltitude-alt;
   pitch+=Math.max(-.22,Math.min(.22,altError*.0025));
   pitch+=Math.max(-.08,Math.min(.08,-verticalSpeed*.018));
   pitch=Math.max(-10,Math.min(10,pitch+trim*.006));
 }
 const targetSpeed=power*5.2*(brake?.22:1)*(flaps?.88:1);
 speed+=(targetSpeed-speed)*.035*dt;
 const pitchRad=pitch*Math.PI/180;
 const liftFactor=Math.max(0,(speed-stallSpeed)/115)*(flaps?1.18:1);
 const aerodynamicLift=liftFactor*Math.cos(pitchRad);
 const pitchRate=(aerodynamicLift*8.5-2.2-(pitch*.055)-verticalSpeed*.32);
 verticalSpeed+=pitchRate*.035*dt;
 if(ground){
   verticalSpeed=Math.max(0,verticalSpeed);
   if(speed<rotationSpeed||pitch<2) verticalSpeed=0;
   else verticalSpeed=Math.min(verticalSpeed,.75);
   if(speed<rotationSpeed) pitch*=.985;
 }
 if(speed<stallSpeed&&alt>3) verticalSpeed-=.035*dt;
 alt=Math.max(0,alt+verticalSpeed*dt);
 const forward=.0025+speed*.000025;
 world.position.z+=forward*dt;
 bank+=(px*5-bank)*.08*dt;
 heading=(heading+(bank*.018+yawInput*.9)*dt+360)%360;
 px*=.985;
 pitch*=.992;
 yawInput*=.92;
 fuel=Math.max(0,fuel-power*.0007*dt);
 plane.position.x=px;
 plane.position.y=py;
 plane.rotation.z=-bank*.045;
 plane.rotation.x=pitchRad;
 plane.rotation.y=heading*Math.PI/180;
 traffic.forEach((t,i)=>{t.position.z+=(.018+i*.002)*dt;if(t.position.z>20)t.position.z=-300-i*22});
 if(alt<=0.1&&speed<55){verticalSpeed=0;pitch=Math.max(0,pitch*.95)}
 if(alt<=0.1&&speed>175){alive=false;msg.textContent="💥 Zu schnelle Bodenberührung – Neustart";return setTimeout(()=>flightSimReal(),900)}
 if(speed<75&&power>70&&alt>15){msg.textContent="⚠️ STALL – Nase senken und Leistung erhöhen"}
 if(ground&&speed>rotationSpeed&&pitch>=2&&mission===0)msg.textContent="🛫 Rotation – Nase anheben";
 if(mission===0&&alt>3&&speed>rotationSpeed){mission=1;msg.textContent="☁️ Abgehoben – fliege über Stadt, Küste und Inseln"}if(mission===1&&world.position.z>145){mission=2;msg.textContent="🌊 Küstenflug – kleiner Insel-Flugplatz voraus"}if(mission===2&&world.position.z>245){mission=3;msg.textContent="🛬 Missionsziel: lande am kleinen Insel-Flugplatz"}if(mission===3&&world.position.z>330){const landingReady=gear&&flaps&&power<42&&speed>45&&speed<230&&Math.abs(px)<3.5&&alt<260;if(landingReady)msg.textContent="🛬 Landeanflug – halte die Bahnmitte und reduziere weiter";else msg.textContent="⚠️ Landung: Fahrwerk + Klappen, 45–230 km/h, Bahnmitte, niedrige Höhe";if(landingReady&&alt<80&&Math.abs(verticalSpeed)<3&&Math.abs(px)<2.5&&speed<155){mission=4;msg.textContent="🏆 Sichere Landung! Insel-Flugplatz erreicht";}}
 const cpAlt=document.getElementById("cpAlt"),cpAlt2=document.getElementById("cpAlt2"),cpSpeed=document.getElementById("cpSpeed"),cpSpeed2=document.getElementById("cpSpeed2"),cpHdg=document.getElementById("cpHdg"),cpHdg2=document.getElementById("cpHdg2"),cpVs=document.getElementById("cpVs"),cpVs2=document.getElementById("cpVs2"),cpTrim=document.getElementById("cpTrim"),cpAp=document.getElementById("cpAp"),cpPitch=document.getElementById("cpPitch"),cpPitch2=document.getElementById("cpPitch2"),cpBank=document.getElementById("cpBank"),cpBank2=document.getElementById("cpBank2"),cpThr=document.getElementById("cpThr"),cpHorizon=document.getElementById("cpHorizon"),cpPitchLadder=document.getElementById("cpPitchLadder"),cpHorizonText=document.getElementById("cpHorizonText"),cpGearState=document.getElementById("cpGearState"),cpFlapsState=document.getElementById("cpFlapsState"),cpBrakeState=document.getElementById("cpBrakeState"),cpApState=document.getElementById("cpApState"),cpMode=document.getElementById("cpMode"),cpThrMode=document.getElementById("cpThrMode"),cpFmaGear=document.getElementById("cpFmaGear");if(cpAlt){const altText=Math.round(alt),speedText=Math.round(speed),hdgText=String(Math.round(heading)).padStart(3,"0"),vsText=(verticalSpeed>=0?"+":"")+verticalSpeed.toFixed(1),pitchText=Math.round(pitch),bankText=Math.round(bank);cpAlt.textContent=altText;cpSpeed.textContent=speedText;cpHdg.textContent=hdgText;cpVs.textContent=vsText;cpTrim.textContent=trim.toFixed(1);cpAp.textContent=autopilot?"AP • ALT/H DG HOLD":"MANUAL";if(cpAlt2)cpAlt2.textContent=altText;if(cpSpeed2)cpSpeed2.textContent=speedText;if(cpHdg2)cpHdg2.textContent=hdgText;if(cpVs2)cpVs2.textContent=vsText;if(cpPitch)cpPitch.textContent=pitchText;if(cpPitch2)cpPitch2.textContent=pitchText;if(cpBank)cpBank.textContent="BANK "+bankText+"°";if(cpBank2)cpBank2.textContent=bankText;if(cpThr)cpThr.textContent=power;if(cpGearState)cpGearState.textContent=gear?"DOWN":"UP";if(cpFlapsState)cpFlapsState.textContent=flaps?"EXT":"CLEAN";if(cpBrakeState)cpBrakeState.textContent=brake?"ON":"ARM";if(cpApState)cpApState.textContent=autopilot?"ON":"OFF";if(cpMode)cpMode.textContent=autopilot?"AP1":"MANUAL";if(cpThrMode)cpThrMode.textContent=power<8?"IDLE":power<42?"CLB":power>88?"TOGA":"THR";if(cpFmaGear)cpFmaGear.textContent=gear?"LDG":"UP";if(cockpitGroup?.userData?.controls){const c=cockpitGroup.userData.controls,t=Math.max(0,Math.min(100,power))/100;if(c.throttle0)c.throttle0.rotation.z=-t*.72;if(c.throttle1)c.throttle1.rotation.z=-t*.72;if(c.flaps)c.flaps.rotation.z=flaps?-.42:0;if(c.speedbrake)c.speedbrake.rotation.z=brake?-.45:0;if(c.gear)c.gear.rotation.z=gear?.28:-.28;if(c.sidestick){c.sidestick.rotation.z=bank*Math.PI/180*.9;c.sidestick.rotation.x=-pitch*Math.PI/180*.9}}if(cpHorizon)cpHorizon.style.transform="rotate("+(-bank)+"deg)";if(cpPitchLadder)cpPitchLadder.style.transform="translateY("+Math.max(-28,Math.min(28,pitch*2.1))+"%) rotate("+(-bank)+"deg)";if(cpHorizonText)cpHorizonText.textContent="PITCH "+pitchText+"°";}updateGLBVisibility(world,plane);hud.innerHTML="ALT "+Math.round(alt)+" m<br>SPEED "+Math.round(speed)+" km/h<br>VS "+(verticalSpeed>=0?"+":"")+Math.round(verticalSpeed*10)+" m/s<br>HDG "+String(Math.round(heading)).padStart(3,"0")+"°<br>THR "+power+"%<br>FUEL "+Math.round(fuel)+"%<br>"+(gear?"GEAR DOWN":"GEAR UP")+"<br>"+(flaps?"FLAPS":"CLEAN")+"<br>"+(mission===4?"LANDED":"MISSION "+(mission+1)+"/4")+"<br>PITCH "+Math.round(pitch)+"°<br>TRIM "+trim.toFixed(1)+"°<br>"+(autopilot?"AP ON ":"")+(speed<75&&power>70&&alt>15?"STALL":"");let target,look;if(viewMode==="cockpit"&&selected==="A320"){cameraDistance=6.2;}if(viewMode==="cockpit"){if(!cockpitGroup){cockpitGroup=makeA320Cockpit();plane.add(cockpitGroup);bindCockpitControls()}cockpitGroup.visible=selected==="A320";target=new THREE.Vector3(plane.position.x,plane.position.y+1.45,plane.position.z-1);look=new THREE.Vector3(plane.position.x,plane.position.y+1.45,plane.position.z-35)}else if(viewMode==="wing"){target=new THREE.Vector3(plane.position.x+5,plane.position.y+2,plane.position.z+4);look=new THREE.Vector3(plane.position.x,plane.position.y,plane.position.z-25)}else if(viewMode==="cabin"){target=new THREE.Vector3(plane.position.x,plane.position.y+1.3,plane.position.z+2);look=new THREE.Vector3(plane.position.x,plane.position.y+1.4,plane.position.z-25)}else{target=new THREE.Vector3(plane.position.x*.55,plane.position.y+3.1,plane.position.z+cameraDistance);look=new THREE.Vector3(plane.position.x,plane.position.y+.15,plane.position.z-6)}g.camera.position.lerp(target,.10);g.camera.lookAt(look);g.renderer.render(g.scene,g.camera);activeAnimation=requestAnimationFrame(loop)}
 loadAircraft();loop(performance.now());
}
;window.flightSim=flightSimReal;


let gltfLoaderPromise=null;

// GLB memory/performance manager.
// - Loads each URL only once and clones the already parsed scene for repeated objects.
// - Limits simultaneous downloads so mobile devices do not receive dozens of GLBs at once.
// - Disables expensive shadows on scenery objects.
// - Keeps distant scenery from being rendered.
// - Normalizes model size/center automatically.
const glbCache=new Map();
const glbQueue=[];
let glbBusy=0;
const GLB_MAX_CONCURRENT=2;
const GLB_MAX_RENDER_DISTANCE=155;

function optimizeGLBModel(model, options={}){
 model.traverse(o=>{
  if(o.isMesh){
   o.castShadow=!!options.castShadow;
   o.receiveShadow=false;
   o.frustumCulled=true;
   if(o.material){
    const mats=Array.isArray(o.material)?o.material:[o.material];
    mats.forEach(m=>{
     if(m){
      m.depthWrite=true;
      m.needsUpdate=false;
     }
    });
   }
  }
 });
 return model;
}
function disposeGLBModel(model){
 model.traverse(o=>{
  if(o.isMesh){
   if(o.geometry)o.geometry.dispose();
   const mats=Array.isArray(o.material)?o.material:[o.material];
   mats.forEach(m=>{if(m&&m.map)m.map.dispose();});
  }
 });
}
function processGLBQueue(){
 while(glbBusy<GLB_MAX_CONCURRENT&&glbQueue.length){
  const job=glbQueue.shift();glbBusy++;
  job().finally(()=>{glbBusy--;processGLBQueue();});
 }
}
function queueGLB(job){glbQueue.push(job);processGLBQueue();}

function getGLTFLoader(){
 if(THREE&&THREE.GLTFLoader)return Promise.resolve(THREE.GLTFLoader);
 if(gltfLoaderPromise)return gltfLoaderPromise;
 gltfLoaderPromise=new Promise((resolve,reject)=>{
  const urls=[
   "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js",
   "https://unpkg.com/three@0.128.0/examples/js/loaders/GLTFLoader.js"
  ];
  let i=0;
  function tryNext(){
   if(THREE&&THREE.GLTFLoader)return resolve(THREE.GLTFLoader);
   if(i>=urls.length)return reject(new Error("GLTFLoader konnte nicht geladen werden"));
   const tag=document.createElement("script");
   tag.src=urls[i++];
   tag.onload=()=>THREE&&THREE.GLTFLoader?resolve(THREE.GLTFLoader):tryNext();
   tag.onerror=tryNext;
   document.head.appendChild(tag);
  }
  tryNext();
 });
 return gltfLoaderPromise;
}

function loadRealGLB(url,group,done){
 if(!THREE){done(false);return}
 const fullUrl=url.startsWith("assets/")?new URL(url,window.location.href).href:new URL(url,window.location.href).href;
 const finish=model=>{
  // Clone the parsed model instead of parsing/downloading the same GLB again.
  const instance=model.clone(true);
  optimizeGLBModel(instance,{castShadow:false});
  group.add(instance);

  // Distance-based rendering: objects far behind the aircraft are skipped.
  instance.userData.glbOptimized=true;
  instance.userData.glbMaxDistance=GLB_MAX_RENDER_DISTANCE;
  const parent=group;
  const originalRenderUpdate=instance.userData;
  instance.userData.distanceCull=true;
  done(true);
 };

 if(glbCache.has(fullUrl)){
  const cached=glbCache.get(fullUrl);
  if(cached.status==="ready"){finish(cached.model);return;}
  cached.waiters.push(finish);return;
 }

 const entry={status:"loading",model:null,waiters:[]};
 glbCache.set(fullUrl,entry);
 entry.waiters.push(finish);

 queueGLB(()=>getGLTFLoader().then(GLTFLoader=>new Promise((resolve,reject)=>{
  const loader=new GLTFLoader();
  loader.setCrossOrigin("anonymous");
  loader.load(fullUrl,gltf=>{
   const model=gltf.scene;
   optimizeGLBModel(model,{castShadow:false});
   const box=new THREE.Box3().setFromObject(model);
   const size=box.getSize(new THREE.Vector3());
   const max=Math.max(size.x,size.y,size.z);
   if(max>0){const targetSize=/A320|A350|B737|A380|B787|EVTOL|drone/i.test(url)?5.5:3;model.scale.multiplyScalar(targetSize/max);}
   const box2=new THREE.Box3().setFromObject(model);
   const center=box2.getCenter(new THREE.Vector3());
   model.position.sub(center);
   entry.status="ready";
   entry.model=model;
   const waiters=entry.waiters.splice(0);
   waiters.forEach(fn=>fn(model));
   resolve();
  },undefined,error=>{
   glbCache.delete(fullUrl);
   entry.waiters.splice(0);
   console.warn("3D-Modell konnte nicht geladen werden:",fullUrl,error);
   reject(error);
  });
 })).catch(error=>{
  console.warn("GLB-Ladefehler:",error);
 }));
}

// Hide far scenery every frame without deleting the cached GLB from memory.
// This saves GPU time while keeping loading smooth on phones.
function updateGLBVisibility(root,aircraft){
 if(!root||!aircraft)return;
 const ap=aircraft.getWorldPosition(updateGLBVisibility._aircraftPos||(updateGLBVisibility._aircraftPos=new THREE.Vector3()));
 root.traverse(o=>{if(o.userData&&o.userData.distanceCull){const p=o.getWorldPosition(updateGLBVisibility._objPos||(updateGLBVisibility._objPos=new THREE.Vector3()));o.visible=p.distanceTo(ap)<GLB_MAX_RENDER_DISTANCE;}});
}

function addRealAirliners(world){
 const models=[
  ["A320","assets/A320_nologo.glb"],["A350","assets/A350_nologo.glb"],["B737","assets/B737_nologo.glb"],
  ["A380","assets/imported/A380_nologo.glb"],
  ["B787","assets/imported/B787_nologo.glb"],
  ["EVTOL","assets/imported/EVTOL_nologo.glb"],
  ["Drone","assets/imported/drone_nologo.glb"]
 ];
 models.forEach((m,i)=>{
  const g=new THREE.Group();g.position.set(-12+i*12,1.8,-35-i*25);g.rotation.y=Math.PI;g.scale.setScalar(1);world.add(g);
  loadRealGLB(m[1],g,ok=>{const label=addText(world,ok?("✓ "+m[0]):("✗ "+m[0]),g.position.x,g.position.y+2,g.position.z,.5);label.material.opacity=.9;label.material.color.set(ok?0x55ff88:0xff5555);});
 });
}




// EXTRA GLB SCENERY: airport vehicles, buildings and landmarks
function addExtraAirportScenery(world){
 // Local GLB scenery: these files are part of this repository and work
 // without external model hosts.
 const localModels=[
  ["A320","assets/A320_nologo.glb",-16,0,-18,1.0],
  ["A350","assets/A350_nologo.glb",16,0,-28,.95],
  ["B737","assets/B737_nologo.glb",-14,0,-42,.9],
  ["A320","assets/A320_nologo.glb",14,0,-55,.85],
  ["A350","assets/A350_nologo.glb",-22,0,-70,.8],
  ["B737","assets/B737_nologo.glb",22,0,-82,.8]
 ];
 localModels.forEach(a=>{
  const g=new THREE.Group();
  g.position.set(a[2],a[3],a[4]);
  g.scale.setScalar(a[5]);
  world.add(g);
  loadRealGLB(a[1],g,ok=>{
   if(!ok){
    const fallback=cube([2.8,.8,5],0x777777);
    fallback.position.y=1;
    g.add(fallback);
   }
  });
 });
}
function addRealAirport(world){
 const assets=[
  
 ];
 assets.forEach(a=>{
  const g=new THREE.Group();g.position.set(a[2],a[3],a[4]);g.scale.setScalar(a[5]);world.add(g);
  loadRealGLB(a[1],g,ok=>{if(ok){const label=addText(world,a[0],a[2],a[3]+4,a[4],.45);label.material.opacity=.7}});
 });
}
window.flightSim=flightSimReal;
