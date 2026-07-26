const tools=[
["youtube","YouTube Toolkit","smart_display","AI Video Title Generator","Generate clickable titles for any topic."],
["youtube","Description Generator","description","Description Generator","Create an SEO-friendly video description."],
["youtube","Tag Generator","sell","Tag Generator","Find relevant tags for your content."],
["youtube","Hashtag Generator","tag","Hashtag Generator","Generate discoverable hashtags."],
["youtube","Thumbnail Ideas","image","Thumbnail Idea Generator","Get scroll-stopping thumbnail concepts."],
["youtube","Video Ideas","lightbulb","Video Idea Generator","Never run out of content ideas."],
["youtube","Upload Checklist","checklist","Upload Checklist","Prepare your next upload with confidence."],
["youtube","SEO Score","analytics","SEO Score Calculator","Score your title and description."],
["music","BPM Tap Counter","speed","BPM Tap Counter","Tap along to find the tempo."],
["music","Random Melody","music_note","Random Melody Generator","Spark a new melodic idea."],
["music","Random Chord","piano","Random Chord Generator","Discover your next progression."],
["music","Beat Idea","graphic_eq","Beat Idea Generator","Generate a unique beat direction."],
["music","Song Names","album","Song Name Generator","Find a memorable name for your track."],
["music","Mood Generator","mood","Mood Generator","Set the mood for your next song."],
["gaming","Minecraft Seeds","public","Minecraft Seed Idea Generator","Create an unusual world concept."],
["gaming","Challenge Wheel","casino","Challenge Wheel","Spin up your next challenge."],
["gaming","Mob Battle","sports_mma","Random Mob Battle Generator","Create a random Minecraft battle."],
["gaming","Survival Challenge","explore","Survival Challenge Generator","Test your survival skills."],
["ai","Script Generator","article","Script Generator","Build a structured content script."],
["ai","Caption Generator","subtitles","Caption Generator","Write captions that get attention."],
["ai","Brainstorm","hub","Brainstorm Generator","Expand your best ideas."],
["ai","Prompt Generator","terminal","Prompt Generator","Create powerful AI prompts."],
["ai","Rewrite Tool","edit_note","Rewrite Tool","Give your writing a fresh voice."]
];

const quotes=["Great things are built one idea at a time.","Your next breakthrough is one experiment away.","Create what you wish existed.","Consistency turns small wins into momentum.","The world needs your unique perspective."];
let state=JSON.parse(localStorage.getItem("creatorHub")||"null")||{favorites:[],history:[],streak:0,lastVisit:"",theme:"dark",accent:"#00e5ff"};
let activeCategory="all",currentTool=null;

const $=s=>document.querySelector(s);
function save(){localStorage.setItem("creatorHub",JSON.stringify(state));updateStats()}
function updateStats(){$("#favoriteCount").textContent=state.favorites.length;$("#achievementCount").textContent=Math.min(12,Math.floor(state.history.length/2));$("#streakCount").textContent=state.streak}
function renderTools(){
 const query=$("#searchInput").value.toLowerCase();
 const filtered=tools.filter(t=>(activeCategory==="all"||t[0]===activeCategory)&&t[1].toLowerCase().includes(query));
 $("#toolCount").textContent=`${filtered.length} tools`;
 $("#toolsGrid").innerHTML=filtered.map((t,i)=>`<article class="tool-card" style="animation-delay:${i*25}ms" data-tool="${t[1]}">
  <button class="favorite ${state.favorites.includes(t[1])?"active":""}" aria-label="Favorite"><span class="material-icons">favorite</span></button>
  <div class="tool-icon"><span class="material-icons">${t[2]}</span></div><h3>${t[1]}</h3><p>${t[4]}</p>
 </article>`).join("")||`<p class="muted">No tools found. Try another search.</p>`;
 document.querySelectorAll(".tool-card").forEach(card=>card.onclick=e=>{if(e.target.closest(".favorite"))return;openTool(card.dataset.tool)});
 document.querySelectorAll(".favorite").forEach(btn=>btn.onclick=e=>{e.stopPropagation();let name=btn.closest(".tool-card").dataset.tool;state.favorites=state.favorites.includes(name)?state.favorites.filter(x=>x!==name):[...state.favorites,name];save();renderTools();showToast("Favorites updated")});
}
function openTool(name){
 currentTool=tools.find(t=>t[1]===name);$("#modalIcon").innerHTML=`<span class="material-icons">${currentTool[2]}</span>`;$("#modalCategory").textContent=currentTool[0]+" TOOLKIT";$("#modalTitle").textContent=currentTool[3];$("#modalDescription").textContent=currentTool[4];$("#resultBox").classList.add("hidden");
 $("#toolForm").innerHTML=`<label>Give your idea some context</label><input id="toolContext" class="tool-input" placeholder="e.g. cozy gaming setup, lo-fi music..." value="">`;
 if(name==="SEO Score")$("#toolForm").innerHTML=`<label>Video title</label><input id="toolContext" class="tool-input" placeholder="Enter a video title"><label>Description length</label><input id="seoLength" class="tool-input" type="number" value="300">`;
 $("#toolModal").classList.remove("hidden");
}
function generate(){
 const context=$("#toolContext")?.value||"your next project",name=currentTool[1];
 const outputs={
 "AI Video Title Generator":`🔥 ${context}: The Ultimate Guide You Need to See\n${context} Changed Everything (Here’s Why)\nI Tried ${context} So You Don’t Have To`,
 "Description Generator":`Welcome to our deep dive into ${context}!\n\nIn this video, we explore the best ideas, strategies and tips to help you level up. Subscribe for more creator content and let us know your thoughts below!`,
 "Tag Generator":`${context}, creator tips, tutorial, guide, inspiration, trending, content creator, how to, beginner guide`,
 "Hashtag Generator":`#${context.replace(/\s+/g,"")} #CreatorHub #ContentCreator #CreativeIdeas #Trending`,
 "Thumbnail Idea Generator":`Use a bold close-up subject, electric cyan rim lighting, a dark background and 3 words of high-contrast text: “${context}?”`,
 "Video Idea Generator":`Create a 3-part challenge around ${context}: setup, unexpected obstacle, and final reveal.`,
 "Upload Checklist":`☐ Title optimized\n☐ Thumbnail exported\n☐ Description added\n☐ Tags and hashtags ready\n☐ End screen configured\n☐ Captions checked`,
 "SEO Score":`SEO SCORE: ${Math.min(100,45+(context.length*2)+Number($("#seoLength")?.value||0)/20).toFixed(0)}/100\nTip: Use a clear keyword, emotional hook and specific promise.`,
 "Random Melody Generator":`C - E - G - B - G - E\nTry a 100 BPM synth lead in a minor scale.`,
 "Random Chord Generator":`Am7 → Fmaj7 → Cmaj7 → G6\nMood: dreamy and uplifting.`,
 "Beat Idea Generator":`92 BPM • punchy kick • swung hi-hats • warm bass • vinyl texture`,
 "Song Name Generator":`Neon ${context.split(" ")[0]} / After the Signal / Midnight Upload`,
 "Mood Generator":`Atmospheric • Energetic • Nostalgic\nPalette: cyan, violet and midnight blue`,
 "Minecraft Seed Idea Generator":`A frozen island surrounded by shipwrecks with a hidden lush cave beneath the spawn.`,
 "Challenge Wheel":`No crafting table for the first 3 Minecraft days!`,
 "Random Mob Battle Generator":`Iron Golem VS 12 Skeletons — arena: desert temple.`,
 "Survival Challenge Generator":`Survive 7 in-game days using only loot from villages.`,
 "Script Generator":`HOOK: “What if ${context} could change your entire workflow?”\n\nVALUE: Share three practical steps and one surprising insight.\n\nCTA: Ask viewers to comment their favorite idea.`,
 "Caption Generator":`POV: you finally turn ${context} into something real ✦\nSave this for your next creative session.`,
 "Brainstorm":`What if ${context} was collaborative? What would make it unexpected? How could you make it smaller, faster and more personal?`,
 "Prompt Generator":`Act as an expert creator. Develop ${context} with a bold angle, clear audience, practical examples and a memorable conclusion.`,
 "Rewrite Tool":`Fresh version: ${context.charAt(0).toUpperCase()+context.slice(1)} — sharper, clearer and made to keep people reading.`
 };
 let result=outputs[name]||`Try this direction for ${context}: make it specific, surprising and useful.`;
 $("#resultBox").textContent=result;$("#resultBox").classList.remove("hidden");
 state.history.unshift({name,result,date:new Date().toLocaleString()});state.history=state.history.slice(0,8);save();renderRecent();showToast("Idea generated");
}
function renderRecent(){let list=$("#recentList");list.innerHTML=state.history.map(x=>`<div class="recent-item"><b>${x.name}</b><br><small>${x.result.slice(0,100)}...</small></div>`).join("");$("#recentSection").classList.toggle("hidden",!state.history.length)}
function showToast(text){let t=$("#toast");t.textContent=text;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
function setSettings(open){$("#settingsPanel").classList.toggle("hidden",!open)}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelector(".tab.active").classList.remove("active");b.classList.add("active");activeCategory=b.dataset.category;renderTools()});
$("#searchInput").oninput=renderTools;$("#generateButton").onclick=generate;$("#closeModal").onclick=()=>$("#toolModal").classList.add("hidden");$("#settingsButton").onclick=()=>setSettings(true);$("#closeSettings").onclick=()=>setSettings(false);
document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>{document.querySelector(".nav-item.active").classList.remove("active");b.classList.add("active");if(b.dataset.view==="settings")setSettings(true);else{setSettings(false);activeCategory=b.dataset.view==="ai"?"ai":"all";document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.category===activeCategory));renderTools()}});
$("#themeToggle").onchange=e=>{document.body.classList.toggle("light",e.target.checked);state.theme=e.target.checked?"light":"dark";save()};
$("#accentPicker").oninput=e=>{document.documentElement.style.setProperty("--cyan",e.target.value);state.accent=e.target.value;save()};
$("#exportButton").onclick=()=>{let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:"application/json"}));a.download="creatorhub-backup.json";a.click();showToast("Backup downloaded")};
$("#importFile").onchange=e=>{let r=new FileReader();r.onload=()=>{try{state=JSON.parse(r.result);save();location.reload()}catch{showToast("Invalid backup file")}};r.readAsText(e.target.files[0])};
window.onkeydown=e=>{if((e.metaKey||e.ctrlKey)&&e.key==="k"){e.preventDefault();$("#searchInput").focus()}};
const today=new Date().toDateString();if(state.lastVisit!==today){state.streak=(state.lastVisit===new Date(Date.now()-864e5).toDateString()?state.streak+1:1);state.lastVisit=today;save()}
$("#dailyQuote").textContent=quotes[new Date().getDate()%quotes.length];document.body.classList.toggle("light",state.theme==="light");document.documentElement.style.setProperty("--cyan",state.accent);$("#themeToggle").checked=state.theme==="light";$("#accentPicker").value=state.accent;updateStats();renderTools();renderRecent();
setTimeout(()=>$("#splash").classList.add("hide"),900);
if("serviceWorker"in navigator)navigator.serviceWorker.register("service-worker.js");
