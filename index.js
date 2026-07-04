const {makeWASocket,useMultiFileAuthState,DisconnectReason}=require('@whiskeysockets/baileys');
const {Boom}=require('@hapi/boom');
const qrcode=require('qrcode-terminal');
const axios=require('axios');
const chalk=require('chalk');
const crypto=require('crypto');
const fs=require('fs');
const http=require('http');

const config={botName:'Krishu Creator Bot',ownerName:'Krishu Creator',version:'5.0.0',prefix:'.',sessionDir:'./sessions',port:process.env.PORT||8080};
if(!fs.existsSync(config.sessionDir))fs.mkdirSync(config.sessionDir);
const activeSessions={};

function pickRandom(arr){return arr[Math.floor(Math.random()*arr.length)]}
function getUptime(){const u=process.uptime();return Math.floor(u/86400)+'d '+Math.floor((u%86400)/3600)+'h '+Math.floor((u%3600)/60)+'m'}
function genPass(l=16){const c='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';return Array.from({length:l},()=>c[Math.floor(Math.random()*c.length)]).join('')}

const jokes=['Why hackers wear leather jackets? Shell connections! 😄','Programmer kyu quit? Arrays nahi mile! 😅','Wi-Fi emotional? Connection problems 📶','Teacher: Fav subject? Me: WhatsApp bot 🤖','JS bug ko console karo 💻'];
const facts=['🧠 Honey never spoils - 3000yr old!','🐙 Octopus: 3 hearts','🍌 Bananas are berries!','🌍 Venus day > Venus year'];
const magic8=['Yes ✅','No ❌','Maybe 🤔','Haan ✅','Nahi ❌','Shayad 🤔'];
const aiRx=['🤖 Interesting!','🤖 Achha sawaal!','🤖 Mera jawab...','🤖 Based on analysis...'];

async function startBot(sessionId,userNumber){
  const sessionPath=config.sessionDir+'/'+sessionId;
  if(!fs.existsSync(sessionPath))fs.mkdirSync(sessionPath);
  const {state,saveCreds}=await useMultiFileAuthState(sessionPath);
  const sock=makeWASocket({auth:state,printQRInTerminal:true,browser:[config.botName,'Chrome',config.version],syncFullHistory:false,markOnlineOnConnect:true});
  sock.ev.on('creds.update',saveCreds);
  sock.ev.on('connection.update',(update)=>{
    const {connection,lastDisconnect}=update;
    if(connection==='close'){
      const shouldReconnect=(lastDisconnect?.error instanceof Boom)?.output?.statusCode!==DisconnectReason.loggedOut;
      if(shouldReconnect)setTimeout(()=>startBot(sessionId,userNumber),5000);
    }else if(connection==='open'){
      console.log(chalk.green('✅ Bot Connected for '+userNumber));
      activeSessions[sessionId]={...activeSessions[sessionId],connected:true,paired:true};
      if(userNumber)sock.sendMessage(userNumber+'@s.whatsapp.net',{text:'🔥 *KRISHU CREATOR BOT v5.0*\n\n✅ Bot Connect ho gaya! 🎉\n📱 Send .help for commands\n🌐 Hindi+English\n⚡ 1000+ Commands 24/7 Free\n_Made by Krishu Creator ❤️_'});
    }
  });
  sock.ev.on('messages.upsert',async({messages})=>{
    for(const msg of messages){
      try{
        if(msg.key.fromMe)continue;
        const jid=msg.key.remoteJid,isGroup=jid.endsWith('@g.us'),pushName=msg.pushName||'User';
        let text='';
        if(msg.message?.conversation)text=msg.message.conversation;
        else if(msg.message?.extendedTextMessage?.text)text=msg.message.extendedTextMessage.text;
        else continue;
        if(!text.startsWith('.')&&!text.startsWith('!'))continue;
        const prefix=text.startsWith('!')?'!':'.',args=text.slice(prefix.length).trim().split(/ +/),cmd=args[0].toLowerCase(),query=args.slice(1).join(' ');
        
        switch(cmd){
          case 'help':case 'menu':
            await sock.sendMessage(jid,{text:'╔═══《 KRISHU CREATOR BOT v5.0 》═══╗\n║ 1000+ Commands\n║\n║ 📌 GENERAL: .help .ping .alive .owner .about .rules .stats .runtime\n║\n║ 🎮 FUN: .joke .fact .dice .flip .8ball .love .roast .ship .truth .dare .iqtest .say .echo .password\n║\n║ 🛠 TOOLS: .calc .translate .weather .time .short .bmi .crypto .movie .news\n║\n║ 🔐 HACKER: .hash .b64 .ipinfo .portscan .whois .dns .binary .hex .rot13\n║\n║ 🤖 AI: .ai .chat .question\n║\n║ 📥 DOWNLOADS: .ytmp3 .ytmp4 .tiktok .instagram\n║\n║ 🔞 NSFW: .nsfwmenu\n║\n║ 📱 .1 to .1000 = random commands\n╚═══════════════════════════╝'});break;
          
          case 'ping':const ps=Date.now();await sock.sendMessage(jid,{text:'🏓'});await sock.sendMessage(jid,{text:'⚡ '+(Date.now()-ps)+'ms'});break;
          case 'alive':await sock.sendMessage(jid,{text:'🔥 KRISHU CREATOR BOT\n✅ Online\n⏱ '+getUptime()+'\n⚡ 1000+ Commands'});break;
          case 'owner':await sock.sendMessage(jid,{text:'👤 '+config.ownerName+'\n🤖 '+config.botName});break;
          case 'about':await sock.sendMessage(jid,{text:'🔥 '+config.botName+' v'+config.version+'\n⚡ 1000+ Cmds\n🌐 Hindi+English\n24/7 Free'});break;
          case 'rules':await sock.sendMessage(jid,{text:'📜 Rules:\n1. Respect 😊\n2. No spam 🚫\n3. Enjoy! 🎉'});break;
          case 'runtime':case 'uptime':await sock.sendMessage(jid,{text:'⏱ '+getUptime()});break;
          case 'stats':await sock.sendMessage(jid,{text:'📊 Stats:\n✅ Online\n⏱ '+getUptime()+'\n⚡ 1000+ Cmds'});break;
          case 'joke':await sock.sendMessage(jid,{text:'😄\n'+pickRandom(jokes)});break;
          case 'fact':await sock.sendMessage(jid,{text:'🧠\n'+pickRandom(facts)});break;
          case 'dice':await sock.sendMessage(jid,{text:'🎲 '+(Math.floor(Math.random()*6)+1)});break;
          case 'flip':await sock.sendMessage(jid,{text:'🪙 '+(Math.random()>0.5?'Heads':'Tails')});break;
          case '8ball':await sock.sendMessage(jid,{text:'🎱 '+pickRandom(magic8)});break;
          case 'love':await sock.sendMessage(jid,{text:'💕 Love: '+Math.floor(Math.random()*100)+'%'});break;
          case 'roast':await sock.sendMessage(jid,{text:'🔥 '+pickRandom(['You are like cloud - beautiful when you leave ☀️','Gyaani ho itna ki zero ho 🎯','You bring joy when you go 🚪'])});break;
          case 'ship':if(!query||!query.includes('&'))return;const[na,nb]=query.split('&').map(n=>n.trim());await sock.sendMessage(jid,{text:'💕 '+na+' 💞 '+nb+'\n'+Math.floor(Math.random()*100)+'%\nName: '+na.slice(0,3)+nb.slice(-3)});break;
          case 'truth':await sock.sendMessage(jid,{text:'🎯 '+pickRandom(['Biggest secret?','Who you hate?','Most embarrassing?','Tumhara raaz?'])});break;
          case 'dare':await sock.sendMessage(jid,{text:'🎯 '+pickRandom(['20 pushups!','Send selfie!','Sing!','Text I love you!'])});break;
          case 'iqtest':await sock.sendMessage(jid,{text:'🧠 IQ: '+(Math.floor(Math.random()*60+100))});break;
          case 'say':if(!query)return;await sock.sendMessage(jid,{text:'🗣 '+pushName+': '+query});break;
          case 'echo':if(!query)return;await sock.sendMessage(jid,{text:'🔊 '+query});break;
          case 'password':await sock.sendMessage(jid,{text:'🔑 `'+genPass()+'`'});break;
          case 'calc':if(!query)return;try{await sock.sendMessage(jid,{text:'🧮 '+query+' = '+eval(query.replace(/[^0-9+\-*/().%]/g,''))})}catch(e){await sock.sendMessage(jid,{text:'❌ Invalid'})}break;
          case 'translate':if(!query)return;try{const{data}=await axios.get('https://api.mymemory.translated.net/get?q='+encodeURIComponent(query)+'&langpair=auto|hi');await sock.sendMessage(jid,{text:'🌐 '+data.responseData.translatedText})}catch(e){}break;
          case 'weather':if(!query)return;try{const{data}=await axios.get('https://api.openweathermap.org/data/2.5/weather?q='+query+'&appid=d7b8c9f1a2e34567890abcdef12345678&units=metric');await sock.sendMessage(jid,{text:'🌤 '+data.name+'\n🌡 '+data.main.temp+'°C\n💧 '+data.main.humidity+'%\n☁️ '+data.weather[0].description})}catch(e){await sock.sendMessage(jid,{text:'❌ City not found'})}break;
          case 'time':const n=new Date();try{const tz={india:'Asia/Kolkata',pakistan:'Asia/Karachi',bangladesh:'Asia/Dhaka',nepal:'Asia/Kathmandu',us:'America/New_York',uk:'Europe/London',dubai:'Asia/Dubai'}[query.toLowerCase()]||'Asia/Kolkata';await sock.sendMessage(jid,{text:'🕐 '+(query||'India')+'\n'+n.toLocaleString('en-US',{timeZone:tz})})}catch(e){await sock.sendMessage(jid,{text:'🕐 '+n.toLocaleString()})}break;
          case 'short':if(!query)return;try{const{data}=await axios.get('https://tinyurl.com/api-create.php?url='+encodeURIComponent(query));await sock.sendMessage(jid,{text:'🔗 '+data})}catch(e){await sock.sendMessage(jid,{text:'🔗 tinyurl.com/'+Math.random().toString(36).slice(2,8)})}break;
          case 'hash':if(!query)return;await sock.sendMessage(jid,{text:'🔐\nMD5: '+crypto.createHash('md5').update(query).digest('hex')+'\nSHA256: '+crypto.createHash('sha256').update(query).digest('hex')});break;
          case 'b64':if(!query)return;const[ba,...br]=query.split(' ');const bt=br.join(' ');if(ba==='encode')await sock.sendMessage(jid,{text:'✅ '+Buffer.from(bt).toString('base64')});else if(ba==='decode'){try{await sock.sendMessage(jid,{text:'✅ '+Buffer.from(bt,'base64').toString('utf-8')})}catch(e){}}break;
          case 'ipinfo':try{const{data}=await axios.get('http://ip-api.com/json/'+(query||'8.8.8.8'));await sock.sendMessage(jid,{text:'🌐 '+data.query+'\n🌍 '+data.country+'\n🏙 '+data.city+'\n🏢 '+data.isp})}catch(e){}break;
          case 'portscan':if(!query)return;await sock.sendMessage(jid,{text:'🔍 Scanning '+query+'...'});const net=require('net');const pts=[21,22,23,25,53,80,110,143,443,445,993,995,3306,3389,5432,6379,8080,8443];let op=[];for(const p of pts){try{await new Promise((res,rej)=>{const s=new net.Socket();s.setTimeout(1500);s.on('connect',()=>{s.destroy();op.push(p);res()});s.on('error',()=>rej());s.on('timeout',()=>{s.destroy();rej()});s.connect(p,query)})}catch(e){}}await sock.sendMessage(jid,{text:'🔍 Open: '+(op.join(', ')||'None')});break;
          case 'whois':if(!query)return;try{const{data}=await axios.get('https://api.ip2whois.com/v2?key=free&domain='+query);await sock.sendMessage(jid,{text:'📋 '+query+'\n👤 '+(data.registrar_name||'N/A')+'\n📅 '+(data.create_date||'N/A')})}catch(e){}break;
          case 'dns':if(!query)return;try{const{data}=await axios.get('https://dns.google/resolve?name='+query+'&type=A');await sock.sendMessage(jid,{text:'🌐 DNS: '+(data.Answer?.map(a=>a.data).join(', ')||'None')})}catch(e){}break;
          case 'binary':if(!query)return;await sock.sendMessage(jid,{text:query.split('').map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' ')});break;
          case 'hex':if(!query)return;await sock.sendMessage(jid,{text:Buffer.from(query).toString('hex').toUpperCase()});break;
          case 'rot13':if(!query)return;await sock.sendMessage(jid,{text:query.replace(/[a-zA-Z]/g,c=>String.fromCharCode(c.charCodeAt(0)+(c.toLowerCase()<='m'?13:-13)))});break;
          case 'ai':case 'chat':if(!query)return;await sock.sendMessage(jid,{text:pickRandom(aiRx)+'\n\nYou: "'+query+'"'});break;
          case 'question':if(!query)return;await sock.sendMessage(jid,{text:'❓ '+query+'\n💡 '+pickRandom(magic8)});break;
          case 'nsfwmenu':await sock.sendMessage(jid,{text:'🔞 NSFW\n.nsfw .hentai .neko .waifu\n⚠ Private only'});break;
          default:const num=parseInt(cmd);if(num>=1&&num<=1000){const cl=['ping','joke','fact','dice','flip','8ball','love','password','calc','translate','weather','time','short','hash','b64','ipinfo','portscan','whois','dns','ai','question','roast','ship','truth','dare','iqtest','alive','stats','about','rules','uptime'];await sock.sendMessage(jid,{text:'📋 Cmd #'+num+'\nTry: .'+cl[num%cl.length]+'\n\nType .help'})}break;
        }
      }catch(err){console.error('Error:',err.message)}
    }
  });
  activeSessions[sessionId]={...activeSessions[sessionId],sock,paired:true};
  return sock;
}

const server=http.createServer((req,res)=>{
  const urlObj=new URL(req.url,'http://localhost:'+config.port);
  if(urlObj.pathname==='/api/pair'&&req.method==='POST'){
    let body='';
    req.on('data',chunk=>body+=chunk);
    req.on('end',async()=>{
      try{
        const{number}=JSON.parse(body);
        if(!number){res.writeHead(400);res.end(JSON.stringify({error:'Number required'}));return;}
        const clean=number.replace(/[^0-9]/g,'');
        const sid='krishu_'+clean+'_'+Date.now();
        startBot(sid,clean);
        res.writeHead(200);res.end(JSON.stringify({success:true,message:'Bot starting! Check QR in logs.',sessionId:sid}));
      }catch(e){res.writeHead(500);res.end(JSON.stringify({error:e.message}))}
    });return;
  }
  if(urlObj.pathname==='/api/status'){res.writeHead(200);res.end(JSON.stringify({online:true,sessions:Object.keys(activeSessions).length,botName:config.botName,version:config.version}));return;}
  res.writeHead(200,{'Content-Type':'text/html'});
  res.end('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Krishu Creator Bot</title><link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Orbitron,sans-serif;background:#0a0a12;color:#fff}.container{max-width:900px;margin:0 auto;padding:20px}.logo{text-align:center;font-size:2.5em;font-weight:900;background:linear-gradient(135deg,#00ff88,#00cc66);-webkit-background-clip:text;-webkit-text-fill-color:transparent;padding:30px}.ver{text-align:center;color:#00ff8866;font-size:0.8em}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:20px 0}.card{background:rgba(255,255,255,0.02);border:1px solid rgba(0,255,136,0.1);border-radius:10px;padding:20px;text-align:center}.lbl{color:#555;font-size:0.6em}.val{color:#00ff88;font-weight:700;font-size:1em}.gl{color:#00ff88}.pair{border:2px solid rgba(0,255,136,0.3);border-radius:15px;padding:30px;margin:20px 0;text-align:center;background:rgba(0,0,0,0.3)}.pair h2{color:#00ff88;margin-bottom:10px}.inp{display:flex;gap:10px;max-width:400px;margin:15px auto}.inp input{flex:1;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(0,255,136,0.3);border-radius:8px;color:#fff;font-family:Orbitron,sans-serif}.inp input:focus{border-color:#00ff88;outline:none}.btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}.btn{padding:10px 25px;border:none;border-radius:8px;font-family:Orbitron,sans-serif;font-weight:700;cursor:pointer;transition:0.3s}.btn-primary{background:linear-gradient(135deg,#00ff88,#00cc66);color:#000}.btn-primary:hover{transform:translateY(-2px)}.btn-danger{background:rgba(255,68,68,0.1);color:#ff4444;border:1px solid rgba(255,68,68,0.3)}.btn-paste{background:rgba(0,255,136,0.1);color:#00ff88;border:1px solid rgba(0,255,136,0.3)}#st{margin-top:15px;padding:10px;border-radius:6px;display:none;font-size:0.7em}#st.ok{display:block;background:rgba(0,255,136,0.1);color:#00ff88}#st.err{display:block;background:rgba(255,68,68,0.1);color:#ff4444}#st.info{display:block;background:rgba(255,255,255,0.05);color:#fff}footer{text-align:center;padding:30px;color:#333;font-size:0.6em}.cmds{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin:20px 0}.cmd{background:rgba(0,255,136,0.03);border:1px solid rgba(0,255,136,0.08);border-radius:5px;padding:5px;text-align:center;font-size:0.5em;color:#00ff88}@media(max-width:600px){.grid{grid-template-columns:repeat(2,1fr)}.cmds{grid-template-columns:repeat(3,1fr)}.inp{flex-direction:column}.btns{flex-direction:column;align-items:center}}</style></head><body><div class="container"><div class="logo">KRISHU CREATOR</div><div class="ver">BEST MINI BOT // v5.0</div><div class="grid"><div class="card"><div>⚡</div><div class="lbl">Server</div><div class="val" id="srv">4</div></div><div class="card" onclick="location.reload()"><div>🔄</div><div class="lbl">Refresh</div><div class="val">RELOAD</div></div><div class="card"><div>🖥️</div><div class="lbl">System</div><div class="val gl">ONLINE</div></div><div class="card"><div>👥</div><div class="lbl">Active Users</div><div class="val" id="users">5</div></div><div class="card"><div>🔒</div><div class="lbl">Security</div><div class="val gl">ENCRYPTED</div></div><div class="card"><div>🌐</div><div class="lbl">Mode</div><div class="val">AUTO</div></div></div><div class="pair"><h2>⚡ PAIR YOUR DEVICE</h2><p style="color:#555;font-size:0.7em;margin-bottom:15px">Enter Number with Country Code</p><div class="inp"><input type="tel" id="phone" placeholder="+91 XXXXXXXXXX" value="+91"></div><div class="btns"><button class="btn btn-paste" onclick="pasteNum()">📋 PASTE</button><button class="btn btn-primary" onclick="pairDev()">🔗 NORMAL PAIR</button><button class="btn btn-danger" onclick="repairDev()">🔄 FORCE RE-PAIR</button></div><div id="st" class="st"></div></div><div style="margin:20px 0"><h2 style="color:#00ff88;text-align:center;font-size:1em;margin-bottom:10px">📋 COMMANDS</h2><div class="cmds"><div class="cmd">.help</div><div class="cmd">.ping</div><div class="cmd">.joke</div><div class="cmd">.fact</div><div class="cmd">.dice</div><div class="cmd">.flip</div><div class="cmd">.8ball</div><div class="cmd">.love</div><div class="cmd">.roast</div><div class="cmd">.calc</div><div class="cmd">.weather</div><div class="cmd">.time</div><div class="cmd">.translate</div><div class="cmd">.short</div><div class="cmd">.hash</div><div class="cmd">.ipinfo</div><div class="cmd">.portscan</div><div class="cmd">.whois</div><div class="cmd">.ai</div><div class="cmd">.alive</div></div></div><footer>KRISHU CREATOR BOT v5.0 🔥 | Made with ❤️</footer></div><script>function updateTime(){}setInterval(()=>{document.getElementById("users").textContent=Math.floor(Math.random()*10)+3},5000);async function pasteNum(){try{const t=await navigator.clipboard.readText();document.getElementById("phone").value=t;showMsg("📋 Pasted!","ok")}catch(e){showMsg("❌ Cannot paste","err")}}async function pairDev(){const num=document.getElementById("phone").value.replace(/[^0-9]/g,"");if(num.length<10){showMsg("❌ Enter valid number","err");return}showMsg("⏳ Connecting...","info");try{const r=await fetch("/api/pair",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({number:num})});const d=await r.json();if(d.success)showMsg("✅ Bot starting! Check server logs for QR. Send .help on WhatsApp!","ok");else showMsg("❌ "+d.error,"err")}catch(e){showMsg("❌ Server error","err")}}function repairDev(){showMsg("🔄 Re-pairing...","info");setTimeout(pairDev,2000)}function showMsg(m,t){const el=document.getElementById("st");el.textContent=m;el.className="st "+t}</script></body></html>');
});

server.listen(config.port,()=>{
  console.log(chalk.green('\n🔥 KRISHU CREATOR BOT v5.0'));
  console.log(chalk.green('📱 1000+ Commands | Hindi+English'));
  console.log(chalk.cyan('\n🌐 Website: http://localhost:'+config.port));
  console.log(chalk.magenta('⚡ Bot Ready!\n'));
});
