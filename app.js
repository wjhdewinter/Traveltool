const $=id=>document.getElementById(id);
const STORE="travel-v10";
let trips=JSON.parse(localStorage.getItem(STORE)||"[]");
let editId=null, activeTrip=null;

function saveTrips(){localStorage.setItem(STORE,JSON.stringify(trips))}
function dt(trip){return new Date(`${trip.date}T${trip.time||"12:00"}`)}
function countdown(trip){let ms=Math.max(0,dt(trip)-Date.now());let d=Math.floor(ms/864e5);ms%=864e5;let h=Math.floor(ms/36e5);ms%=36e5;let m=Math.floor(ms/6e4);return `${d} dagen ${h} uur ${m} min`}
function render(){
 const list=$("list"); list.innerHTML="";
 if(!trips.length) list.innerHTML='<div class="card"><h2>Nog geen reizen</h2><p class="muted">Maak je eerste travel countdown.</p></div>';
 trips.sort((a,b)=>dt(a)-dt(b)).forEach(t=>{
  let div=document.createElement("article"); div.className="card";
  div.innerHTML=`<h2>✈️ ${t.title}</h2><p>📍 ${t.location}</p><p>🏨 ${t.hotel}</p><div class="count">${countdown(t)}</div><div class="row"><button onclick="openDetail('${t.id}')">Open reis</button><button onclick="shareTrip('${t.id}')">WhatsApp</button><button onclick="deleteTrip('${t.id}')" class="danger">Verwijder</button></div>`;
  list.appendChild(div);
 })
}
function openForm(trip=null){
 editId=trip?.id||null;
 $("formTitle").textContent=trip?"Reis bewerken":"Nieuwe reis";
 ["title","location","hotel","date","time","mood"].forEach(id=>$(id).value=trip?.[id]||($(id).type==="time"?"12:00":""));
 if(!trip){$("date").value=new Date(Date.now()+864e5*30).toISOString().slice(0,10);$("mood").value="relaxed"}
 $("formDialog").showModal();
}
$("addBtn").onclick=()=>openForm();
$("cancelForm").onclick=()=>$("formDialog").close();
$("travelForm").onsubmit=e=>{
 e.preventDefault();
 const data={id:editId||crypto.randomUUID(),title:title.value,location:location.value,hotel:hotel.value,date:date.value,time:time.value,mood:mood.value};
 trips=editId?trips.map(t=>t.id===editId?data:t):[...trips,data];
 saveTrips(); $("formDialog").close(); render();
}
function deleteTrip(id){if(confirm("Reis verwijderen?")){trips=trips.filter(t=>t.id!==id);saveTrips();render()}}
function shareTrip(id){
 const t=trips.find(x=>x.id===id);
 const msg=`✈️ Travel Countdown\n\nNog ${countdown(t)} tot:\n${t.title}\n\n📍 ${t.location}\n🏨 ${t.hotel}\n\n${location.origin+location.pathname}`;
 location.href="https://wa.me/?text="+encodeURIComponent(msg);
}

async function geocode(place){
 const url=`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=nl&format=json`;
 const r=await fetch(url); const j=await r.json();
 if(!j.results?.length) throw new Error("Locatie niet gevonden");
 return j.results[0];
}
async function weather(place){
 const g=await geocode(place);
 const url=`https://api.open-meteo.com/v1/forecast?latitude=${g.latitude}&longitude=${g.longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=5`;
 const r=await fetch(url); const j=await r.json();
 return {geo:g, daily:j.daily};
}
function googleMapsLink(place,hotel){return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel+" "+place)}`}
function mapEmbed(place,hotel){return `https://maps.google.com/maps?q=${encodeURIComponent(hotel+" "+place)}&output=embed`}

function fallbackAI(t){
 return `🌍 BESTEMMING
${t.location} is jouw reisbestemming. Gebruik deze planner om praktische info, weer en kaart snel bij elkaar te houden.

🏨 HOTEL
${t.hotel}
Check voor vertrek: inchecktijd, borg/toeristenbelasting, ontbijt, transfer en afstand tot centrum/strand.

🧳 PAKLIJST
Paspoort/ID, tickets, oplader, zonnebril, medicatie, pinpas/contant geld, reisverzekering.

💡 TIPS
• Sla het hotel op in Google Maps
• Check 24 uur voor vertrek het weer
• Maak een WhatsApp bericht met deze app
• Zet de reis in je agenda

🍽️ TER PLEKKE
Zoek lokale gerechten, cafés in de buurt van het hotel en bezienswaardigheden op loopafstand.`;
}
async function realAI(t){
 const key=localStorage.getItem("openai-key");
 if(!key) return fallbackAI(t);
 const prompt=`Geef in het Nederlands compact reisadvies voor locatie ${t.location} en hotel ${t.hotel}. Inclusief highlights, eten, veiligheid, hoteltips, paklijst en 1 dagplanning. Geen verzonnen exacte reviewcijfers.`;
 const res=await fetch("https://api.openai.com/v1/responses",{
  method:"POST",
  headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},
  body:JSON.stringify({model:"gpt-4.1-mini",input:prompt})
 });
 if(!res.ok) throw new Error("AI fout: "+res.status);
 const data=await res.json();
 return data.output_text || fallbackAI(t);
}
window.openDetail=async id=>{
 activeTrip=trips.find(t=>t.id===id);
 $("detailContent").innerHTML=`<h2>✈️ ${activeTrip.title}</h2>
 <p>📍 ${activeTrip.location}</p><p>🏨 ${activeTrip.hotel}</p>
 <div class="count">${countdown(activeTrip)}</div>
 <div class="row"><button onclick="shareTrip('${id}')">📲 WhatsApp</button><button onclick="calendarTrip('${id}')">📅 Agenda</button><button onclick="openForm(activeTrip)">✎ Bewerk</button></div>
 <div class="hotel"><h3>🗺️ Kaart</h3><a href="${googleMapsLink(activeTrip.location,activeTrip.hotel)}" target="_blank"><button>Open in Google Maps</button></a><iframe class="map" src="${mapEmbed(activeTrip.location,activeTrip.hotel)}"></iframe></div>
 <div class="hotel"><h3>☀️ Weer</h3><div id="weatherBox">Weer laden...</div></div>
 <div class="hotel"><h3>🧠 AI reisinfo</h3><button onclick="loadAI()">AI info verversen</button><div id="aiBox" class="ai-box">AI info laden...</div></div>`;
 $("detailDialog").showModal();
 try{const w=await weather(activeTrip.location);$("weatherBox").innerHTML=w.daily.time.map((day,i)=>`<div class="weather-day"><strong>${day.slice(5)}</strong><br>🌡️ ${Math.round(w.daily.temperature_2m_min[i])}° / ${Math.round(w.daily.temperature_2m_max[i])}°<br>☔ ${w.daily.precipitation_probability_max[i]}%</div>`).join("");$("weatherBox").className="weather-grid"}catch(e){$("weatherBox").textContent="Weer kon niet geladen worden: "+e.message}
 loadAI();
}
window.loadAI=async()=>{try{$("aiBox").textContent=await realAI(activeTrip)}catch(e){$("aiBox").textContent=fallbackAI(activeTrip)+"\n\nAI melding: "+e.message}}
function calendarTrip(id){
 const t=trips.find(x=>x.id===id), start=dt(t), end=new Date(start.getTime()+3600000);
 const f=d=>d.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";
 const ics=`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${t.title}\nDESCRIPTION:${t.location} - ${t.hotel}\nDTSTART:${f(start)}\nDTEND:${f(end)}\nEND:VEVENT\nEND:VCALENDAR`;
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([ics],{type:"text/calendar"}));a.download=t.title.replace(/[^a-z0-9]/gi,"-")+".ics";a.click();
}
$("closeDetail").onclick=()=>$("detailDialog").close();
$("settingsBtn").onclick=()=>{$("apiKey").value=localStorage.getItem("openai-key")||"";$("settingsDialog").showModal()}
$("saveKey").onclick=()=>{localStorage.setItem("openai-key",$("apiKey").value.trim());alert("API key lokaal opgeslagen");}
$("clearKey").onclick=()=>{localStorage.removeItem("openai-key");$("apiKey").value="";alert("API key verwijderd")}
$("closeSettings").onclick=()=>$("settingsDialog").close();

if("serviceWorker" in navigator){navigator.serviceWorker.register("./sw.js").catch(()=>{})}
render(); setInterval(render,60000);
