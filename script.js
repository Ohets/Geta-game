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
 for(let x=-35;x<=35;x+=7){for(let z=15;z>-120;z-=12){const t=cube([.25,.9,.25],0x70452b);const crown=sphere(.75,0x237a3a);const tree=new THREE.Group();t.position.y=-1.65;crown.position.y=-.8;tree.add(t,crown);tree.position.set(x+(Math.random()-.5)*2,0,z+(Math.random()-.5)*4);tree.scale.setScalar(.7+Math.random()*.7);world.add(tree)}}
 for(let x=-28;x<=28;x+=14){const hill=sphere(5,0x507c4b);hill.scale.y=.5;hill.position.set(x,-.2,-80-Math.random()*25);world.add(hill)}
 const clouds=new THREE.Group();for(let i=0;i<18;i++){const cl=new THREE.Group();for(let j=0;j<4;j++){const p=sphere(.7,0xffffff);p.position.set((Math.random()-.5)*1.6,Math.random()*.8,(Math.random()-.5)*1.4);cl.add(p)}cl.position.set((Math.random()-.5)*30,5+Math.random()*5,-15-Math.random()*90);cl.scale.setScalar(1+Math.random());clouds.add(cl)}world.add(clouds);
 const plane=new THREE.Group();const fus=cube([1.05,.34,2.4],0xf4f4f4);const wings=cube([3.4,.1,.65],0x3267b1);const tail=cube([.65,.55,.3],0xf4f4f4);tail.position.z=1;plane.add(fus,wings,tail);plane.position.set(0,.2,5);plane.castShadow=true;g.scene.add(plane);
 const cockpit=cube([.72,.28,.5],0x172b50);cockpit.position.set(0,.2,-.25);plane.add(cockpit);
 const hud=document.createElement("div");hud.className="flightHud";b.appendChild(hud);
 const controls=document.createElement("div");controls.className="flightSimControls";controls.innerHTML='<button data-fs="left">◀</button><button data-fs="up">▲</button><button data-fs="down">▼</button><button data-fs="right">▶</button>';b.appendChild(controls);
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
 if(!THREE)return ensureThree(()=>flightSimReal()); stop3D();
 const b=document.getElementById("flightSimBox"),g=make3D(b,{bg:0x72b8e8,fog:0x72b8e8});g.camera.position.set(0,2.2,8);
 const world=new THREE.Group();g.scene.add(world);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(100,220),mat(0x3f8f45));ground.rotation.x=-Math.PI/2;ground.position.set(0,-2.25,-70);world.add(ground);
 const runway=cube([7,.06,65],0x4a4a4a);runway.position.set(0,-2.18,-8);world.add(runway);
 for(let z=20;z>-55;z-=6){const q=cube([.25,.04,2.5],0xffffff);q.position.set(0,-2.1,z);world.add(q)}
 for(let x=-35;x<=35;x+=7)for(let z=15;z>-120;z-=12){const t=cube([.25,.9,.25],0x70452b),c=sphere(.75,0x237a3a),tree=new THREE.Group();t.position.y=-1.65;c.position.y=-.8;tree.add(t,c);tree.position.set(x+(Math.random()-.5)*2,0,z+(Math.random()-.5)*4);tree.scale.setScalar(.8+Math.random()*.5);world.add(tree)}
 addRealAirliners(world);
 addRealAirport(world);
 const plane=new THREE.Group();plane.position.set(0,.2,5);g.scene.add(plane);const fallback=cube([1.05,.34,2.4],0xf4f4f4);plane.add(fallback);
 const hud=document.createElement("div");hud.className="flightHud";b.appendChild(hud);
 const controls=document.createElement("div");controls.className="flightSimControls";controls.innerHTML='<button data-fs="left">◀</button><button data-fs="up">▲</button><button data-fs="down">▼</button><button data-fs="right">▶</button>';b.appendChild(controls);
 const throttle=document.createElement("input");throttle.type="range";throttle.min="0";throttle.max="100";throttle.value="55";throttle.className="flightThrottle";b.appendChild(throttle);
 const msg=document.createElement("div");msg.className="flightMessage";msg.textContent="🛫 Echtes 3D-Flugzeug wird geladen …";b.appendChild(msg);
 const credit=document.createElement("div");credit.className="flightCredit";credit.textContent="3D aircraft: Poly by Google via Poly Pizza (CC BY)";b.appendChild(credit);
 let px=0,py=.2,heading=0,alt=500,distance=0,alive=true,last=performance.now(),takeoff=false,landing=false;
 function steer(dx,dy){px=Math.max(-4.5,Math.min(4.5,px+dx));py=Math.max(-1.8,Math.min(3.2,py+dy))}
 controls.querySelector("[data-fs=left]").onpointerdown=()=>steer(-.45,0);controls.querySelector("[data-fs=right]").onpointerdown=()=>steer(.45,0);controls.querySelector("[data-fs=up]").onpointerdown=()=>steer(0,.28);controls.querySelector("[data-fs=down]").onpointerdown=()=>steer(0,-.28);
 document.onkeydown=e=>{if(e.key==="ArrowLeft")steer(-.35,0);if(e.key==="ArrowRight")steer(.35,0);if(e.key==="ArrowUp")steer(0,.22);if(e.key==="ArrowDown")steer(0,-.22);if(e.key==="w"||e.key==="W")throttle.value=Math.min(100,+throttle.value+5);if(e.key==="s"||e.key==="S")throttle.value=Math.max(0,+throttle.value-5)};
 function end(t){alive=false;stop3D();b.innerHTML="<strong>"+t+"</strong><br><button onclick=\"flightSim()\">Nochmal</button>"}
 ensureOBJLoader(ok=>{if(ok)new THREE.OBJLoader().load("https://assets.codepen.io/127738/Airplane_model2.obj",obj=>{plane.remove(fallback);obj.scale.setScalar(.013);obj.rotation.y=Math.PI;obj.position.y=-1.3;obj.traverse(o=>{if(o.isMesh){o.material=mat(0xe8edf2,.35,.15);o.castShadow=true}});plane.add(obj);msg.textContent="🛫 Echtes 3D-Flugzeug geladen!"},undefined,()=>msg.textContent="🛫 Modell nicht erreichbar – Ersatzmodell aktiv.");else msg.textContent="🛫 Modell-Loader nicht erreichbar – Ersatzmodell aktiv."});
 function loop(now){if(!alive)return;const dt=Math.min((now-last)/16,2);last=now;const power=+throttle.value,speed=.025+power*.00075;world.position.z+=speed*dt;distance+=speed*dt*.2;const targetAlt=takeoff?1800:Math.max(500,1800+py*650);alt+=(targetAlt-alt)*.015*dt;heading=(heading+px*.12*dt+360)%360;plane.position.x=px;plane.position.y=py;plane.rotation.z=-px*.07;plane.rotation.x=-py*.035;
 if(!takeoff&&distance>1.2){takeoff=true;msg.textContent="🛫 Abgehoben!"}if(takeoff&&distance>16){landing=true;msg.textContent="🛬 Landeanflug: zurück zur Landebahn!"}if(landing&&distance>25){if(Math.abs(px)<1.1&&py>-1.7&&py<-.8&&power<35)end("🛬 Perfekte Landung!");else end("💥 Landung verpasst")}if(py<-1.75||py>3.15)return end("⚠️ Flugzeug außer Kontrolle");
 hud.innerHTML="ALT "+Math.round(alt)+" m<br>SPEED "+Math.round(140+power*2.2)+" km/h<br>HDG "+String(Math.round(heading)).padStart(3,"0")+"°<br>THR "+power+"%";g.renderer.render(g.scene,g.camera);activeAnimation=requestAnimationFrame(loop)}
 loop(performance.now());
}
window.flightSim=flightSimReal;


// REAL GLB AIRLINER MODELS
function loadRealGLB(url,group,done){
 if(!THREE)return done(false);
 if(!THREE.GLTFLoader){
  const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/loaders/GLTFLoader.js";
  s.onload=()=>loadRealGLB(url,group,done);s.onerror=()=>done(false);document.head.appendChild(s);return;
 }
 const loader=new THREE.GLTFLoader();loader.setCrossOrigin("anonymous");loader.load(url,gltf=>{group.add(gltf.scene);gltf.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});done(true)},undefined,()=>done(false));
}
function addRealAirliners(world){
 const models=[
  ["A320","https://cdn.jsdelivr.net/gh/amvlab/aircraft-models@main/models/A320_nologo.glb"],
  ["A350","https://cdn.jsdelivr.net/gh/amvlab/aircraft-models@main/models/A350_nologo.glb"],
  ["B737","https://cdn.jsdelivr.net/gh/amvlab/aircraft-models@main/models/B737_nologo.glb"]
 ];
 models.forEach((m,i)=>{
  const g=new THREE.Group();g.position.set(-12+i*12,1.8,-35-i*25);g.rotation.y=Math.PI;g.scale.setScalar(.035);world.add(g);
  loadRealGLB(m[1],g,ok=>{if(ok){const label=addText(world,m[0],g.position.x,g.position.y+2,g.position.z,.5);label.material.opacity=.75}});
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
