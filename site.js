(function(){
var $=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var nav=document.getElementById("navlinks"),mb=document.getElementById("menuBtn");
if(mb&&nav)mb.addEventListener("click",function(){nav.classList.toggle("open")});

// Product filters
function applyFilter(f){var shown=0;$(".product-card").forEach(function(c){var ok=f==="ALL PRODUCTS"||c.dataset.cat===f;c.hidden=!ok;if(ok)shown++});
$("[data-filter]").forEach(function(b){b.classList.toggle("active",b.dataset.filter===f)});
var e=document.getElementById("productEmpty");if(e)e.hidden=shown>0}
$("[data-filter]").forEach(function(b){b.addEventListener("click",function(){applyFilter(b.dataset.filter);history.replaceState(null,"",b.dataset.filter==="ALL PRODUCTS"?location.pathname:"?filter="+encodeURIComponent(b.dataset.filter))})});
var q=new URLSearchParams(location.search).get("filter");if(q&&$("[data-filter]").length)applyFilter(q);

// Demo play toggle
$("[data-play]").forEach(function(b){b.addEventListener("click",function(){var p=b.closest(".product-preview"),w=p&&p.querySelector(".waveform");if(!w)return;w.classList.toggle("playing");b.textContent=w.classList.contains("playing")?"Ⅱ Pause Demo":"▶ Play Demo"})});

// Share link
$("[data-share]").forEach(function(b){b.addEventListener("click",function(){var u=location.origin+"/products#product-"+b.dataset.share;
var done=function(){var old=b.textContent;b.textContent="Link Copied";setTimeout(function(){b.textContent=old||"Link Copied →"},1800)};
if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(u).then(done,function(){window.prompt("Copy this ArkWay product link:",u)});else window.prompt("Copy this ArkWay product link:",u)})});

// Discography toggle
$("[data-mode]").forEach(function(b){b.addEventListener("click",function(){$("[data-mode]").forEach(function(x){x.classList.toggle("active",x===b)});
var stream=document.getElementById("stream"),download=document.getElementById("download");if(stream)stream.hidden=b.dataset.mode!=="stream";if(download)download.hidden=b.dataset.mode!=="download"})});

// Booking modal with history/back-button support
var modalActiveState = false;
function closeBookingModal() {var w=document.querySelector(".modal-backdrop");if(w){w.remove();document.body.classList.remove("locked")}modalActiveState=false;}
$(".book-service").forEach(function(b){b.addEventListener("click",function(){
  document.body.classList.add("locked");
  var w=document.createElement("div");w.className="modal-backdrop";
  var s=String(b.dataset.service||"Service").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  var wa=String(b.dataset.wa||"https://wa.me/254118618199").replace(/"/g,"&quot;");
  var em=String(b.dataset.em||"mailto:arkwaycreative@gmail.com").replace(/"/g,"&quot;");
  w.innerHTML='<div class="modal" role="dialog" aria-modal="true"><button class="modal-close" aria-label="Close">×</button><p class="eyebrow">INSTANT INQUIRY</p><h2>Book <em>'+s+'</em></h2><p>Choose how you want to start the conversation. Your service details will be pre-filled.</p><div class="modal-actions"><a class="primary large" target="_blank" rel="noopener" href="'+wa+'">Open WhatsApp →</a><a class="secondary large" href="'+em+'">Send Email ✉</a></div><span class="modal-note">0118618199 · arkwaycreative@gmail.com</span></div>';
  document.body.appendChild(w);
  if(!modalActiveState){modalActiveState=true;history.pushState({bookingModalOpen:true},"");}
  var close=function(){if(modalActiveState)history.back();else closeBookingModal();};
  w.addEventListener("mousedown",function(e){if(e.target===w)close()});
  w.querySelector(".modal-close").addEventListener("click",close);
  document.addEventListener("keydown",function k(e){if(e.key==="Escape"){close();document.removeEventListener("keydown",k)}});
})});
window.addEventListener("popstate",function(){if(modalActiveState)closeBookingModal()});

/* ==========================================
   ARKWAY CREATIVE — NOAH CHATBOT (Polished)
   ========================================== */

var noahState={lastTopic:"",lastQuestion:"",greeted:false,lastKeys:[],service:"",need:"",hasBeat:null,hasVocals:null,pending:"",fallbacks:0,turns:0};
var NOAH_LINK="https://wa.me/254118618199";
var NOAH_EMAIL="mailto:arkwaycreative@gmail.com";
var NOAH_SERVICES={
 vocal:{name:"Quick Vocal Session",price:"KSh 3,000",amount:3000},
 mixmaster:{name:"External Vocal Mix & Master",price:"KSh 2,500",amount:2500},
 single:{name:"Complete Single Package",price:"KSh 5,500",amount:5500},
 custom:{name:"Full Custom Beat & Song Production",price:"KSh 8,500",amount:8500},
 guitar:{name:"Acoustic/Lead Guitar Session",price:"KSh 2,500",amount:2500},
 bass:{name:"Live Bass Tracking",price:"KSh 2,500",amount:2500},
 full:{name:"Full Instrumentation Package",price:"KSh 12,000",amount:12000},
 ads:{name:"Radio/Social Ads & Jingles",price:"KSh 12,000",amount:12000},
 film:{name:"Film/Series Scoring",price:"from KSh 15,000",amount:15000},
 voice:{name:"Voiceover/Podcast Audio Cleaning",price:"KSh 5,000",amount:5000}
};
var NOAH_ORDER=["vocal","mixmaster","single","custom","guitar","bass","full","ads","film","voice"];
var NOAH_NOTES={
 vocal:"If you already have your beat, bring it along and record your vocals with us. This session is for recording your song over your existing instrumental.",
 mixmaster:"Already recorded your song? Send us your existing vocal recording and instrumental, and we’ll mix and master them.",
 single:"This is a bundled option for finishing a single track. Check the service card for exact inclusions.",
 custom:"Full beat-and-song production built from scratch for your vision.",
 guitar:"Professional acoustic or lead guitar tracking to add live, organic detail.",
 bass:"Live bass tracking tailored to groove tightly with your low-end arrangement.",
 full:"Full live instrumentation package providing comprehensive musical depth.",
 ads:"Professional ad scoring and jingles tailored for commercial broadcast, social media, and business campaigns.",
 film:"Original scoring tailored for films, series, or video projects. Final scope depends on requirements.",
 voice:"Dedicated audio cleaning, restoration, and enhancement for podcasts, corporate voiceovers, and spoken-word media."
};
var NOAH_MAIN=[["Explore Services","what services do you offer"],["Find a Product","where can i buy your products"],["Get Pricing","how much do your services cost"],["Help With My Project","i dont know which service i need"],["Contact ArkWay","how do i contact you"]];
var noahQuickRow=null;

function noahLink(url,label,color){var safe=String(url).replace(/&/g,"&amp;").replace(/"/g,"&quot;");var external=/^https?:/.test(url);return '<a href="'+safe+'"'+(external?' target="_blank" rel="noopener noreferrer"':'')+' style="color:'+(color||"#D4AF37")+';font-weight:bold;">'+label+'</a>';}
function noahContactLink(){return noahLink(NOAH_LINK,"Talk to ArkWay on WhatsApp →","#E2C66B")}
function noahServicesLink(){return noahLink("/services","Explore Services →")}
function noahProductsLink(){return noahLink("/products","Browse the Sound Vault →")}
function noahCommunityLink(){return noahLink("/community","Explore Yovan's Music & Writing →")}

function noahResetState(){noahState.lastTopic="";noahState.lastQuestion="";noahState.lastKeys=[];noahState.service="";noahState.need="";noahState.hasBeat=null;noahState.hasVocals=null;noahState.pending="";noahState.fallbacks=0;noahState.turns=0;}
function noahDefaultChips(topic){
  if(topic==="business")return [["Radio & Social Ads", "radio and social ads"], ["Brand Architecture", "brand architecture"], ["Voiceover Cleaning", "voiceover audio cleaning"], ["Contact ArkWay", "how do i contact you"]];
  if(topic==="audio")return [["Get pricing","how much"],["Book a session","how do i book"]];
  if(topic==="film")return [["Get pricing","how much"],["Request a quote","how do i contact you"]];
  if(topic==="products")return [["Browse products","where can i buy your products"],["Ask about licensing","what are the licensing terms"]];
  return [["Explore services","what services do you offer"],["Get pricing","how much do your services cost"]];
}
function noahAnswer(html,topic,opts){opts=opts||{};if(topic)noahState.lastTopic=topic;if(!opts.keep){noahState.lastKeys=opts.keys||[];noahState.service=noahState.lastKeys.length===1?noahState.lastKeys[0]:noahState.service;noahState.pending=opts.pending||"";if(!opts.fallback)noahState.fallbacks=0;}window.appendNoahMessage(html,false);var chips=opts.chips;if(chips===undefined)chips=noahDefaultChips(noahState.lastTopic);noahAddQuick(chips,opts.noRestart);}
function noahClearQuick(){if(noahQuickRow&&noahQuickRow.parentNode)noahQuickRow.parentNode.removeChild(noahQuickRow);noahQuickRow=null;}
function noahAddQuick(chips,noRestart){noahClearQuick();var box=document.getElementById("noah-messages");if(!box||!chips||!chips.length)return;var list=chips.slice(0,noRestart?5:4);if(!noRestart)list.push(["↺ Start over","__restart"]);var row=document.createElement("div");row.setAttribute("data-noah-quick","1");row.style.cssText="display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 10px;";list.forEach(function(c){var b=document.createElement("button");b.type="button";b.textContent=c[0];b.style.cssText="border:1px solid #D4AF37;background:transparent;color:#E2C66B;border-radius:999px;padding:8px 12px;font-size:13px;line-height:1.2;min-height:36px;cursor:pointer;font-family:inherit;";b.addEventListener("click",function(){window.handleNoahQuick(c[0],c[1])});row.appendChild(b)});box.appendChild(row);box.scrollTop=box.scrollHeight;noahQuickRow=row;}
window.handleNoahQuick=function(label,text){noahClearQuick();window.appendNoahMessage(label,true);if(text==="__restart"){setTimeout(noahRestart,150);return;}setTimeout(function(){noahRespond(text)},150)};
function noahRestart(){noahResetState();noahClearQuick();noahAnswer("Fresh start — what would you like help with?","",{chips:NOAH_MAIN,noRestart:true});}

// Hook up the 4 category pills shown in the chat UI
window.handleNoahOption = function(key) {
  noahClearQuick();
  if(key === 'artist') {
    window.appendNoahMessage("Beats & Studio", true);
    setTimeout(function(){
      noahAnswer("<strong>Beats & Studio Services</strong><br/>ArkWay provides professional recording, mixing, mastering, custom beat production, and instrumentation packages for artists.<br/><br/>" + noahServicesLink() + "<br/>" + noahProductsLink(), "audio", {keys: ["vocal", "mixmaster", "custom"]});
    }, 150);
  } else if(key === 'brand') {
    window.appendNoahMessage("Brand Architecture", true);
    setTimeout(function(){
      noahAnswer("<strong>Brand Architecture & Business Solutions</strong><br/>ArkWay helps companies and startups shape their brand identity, creative direction, and media strategy. We also produce radio/social ads, jingles, and clean promotional audio tailored to business needs.<br/><br/>" + noahServicesLink() + "<br/>" + noahContactLink(), "business", {keys: ["ads", "voice"]});
    }, 150);
  } else if(key === 'film') {
    window.appendNoahMessage("Film Scoring & Audio", true);
    setTimeout(function(){
      noahAnswer("<strong>Film Scoring & Media Audio</strong><br/>Need original music or professional sound for visual media? ArkWay offers film/series scoring (from KSh 15,000), radio/social ads & jingles (KSh 12,000), and podcast/voiceover audio cleaning (KSh 5,000).<br/><br/>" + noahServicesLink() + "<br/>" + noahLink(NOAH_EMAIL, "Request a project quote →"), "film", {keys: ["film", "ads", "voice"]});
    }, 150);
  } else if(key === 'fan') {
    window.appendNoahMessage("Yovan's Music & Catalog", true);
    setTimeout(function(){
      noahAnswer("Yovan is ArkWay's founder, an independent hip-hop artist, producer, and multi-instrumentalist. Explore his music projects and writing through the community page.<br/><br/>" + noahCommunityLink() + "<br/>" + noahLink("https://substack.com/@betweenframesbyovan", "Read Between Frames →"), "artist");
    }, 150);
  }
};

function noahFixLauncherLabel(){
 var candidates=$("#noah-chatbot-container button, #noah-chatbot-container a, #noah-chatbot-container [role='button'], button, a, [role='button']");
 candidates.forEach(function(el){var txt=(el.textContent||"").trim();if(/need guidance|ask noah/i.test(txt)&&txt.length<100){var label=el.querySelector("span");if(label)label.textContent="Need guidance? Ask Noah";else if(el.children.length===0)el.textContent="Need guidance? Ask Noah";}});
}
window.toggleNoahChat=function(){var container=document.getElementById("noah-chatbot-container"),win=document.getElementById("noah-chat-window"),openIcon=document.getElementById("noah-icon-open"),closeIcon=document.getElementById("noah-icon-close");if(!win)return;var isHidden=win.classList.contains("noah-hidden");if(isHidden){win.classList.remove("noah-hidden");if(container)container.classList.add("active");if(openIcon)openIcon.style.display="none";if(closeIcon)closeIcon.style.display="inline";if(!noahState.greeted)noahState.greeted=true;var msgs=document.getElementById("noah-messages");if(msgs&&!msgs.firstChild){window.appendNoahMessage("Your ArkWay creative assistant can help you explore services, find products, understand prices, and choose the right option for your project. What are you working on?",false);noahAddQuick(NOAH_MAIN,true);}noahRefreshLivePrices();}else{win.classList.add("noah-hidden");if(container)container.classList.remove("active");if(openIcon)openIcon.style.display="block";if(closeIcon)closeIcon.style.display="none";}};
window.appendNoahMessage=function(text,isUser){var container=document.getElementById("noah-messages");if(!container)return;if(!container.getAttribute("aria-live")){container.setAttribute("aria-live","polite");container.style.overscrollBehavior="contain";}var msgDiv=document.createElement("div");msgDiv.className="noah-msg "+(isUser?"noah-msg-user":"noah-msg-bot");if(isUser)msgDiv.textContent=text;else msgDiv.innerHTML=text;container.appendChild(msgDiv);container.scrollTop=container.scrollHeight;};

function noahNorm(text){var t=String(text||"").toLowerCase().replace(/[’‘`']/g,"");t=t.replace(/&/g," and ").replace(/(\d),(?=\d{3}\b)/g,"$1");t=t.replace(/(ksh|kshs|kes)\s*/g,"ksh ");t=t.replace(/(\d+(?:\.\d+)?)\s*k\b/g,function(m,n){return String(Math.round(parseFloat(n)*1000))});t=t.replace(/[^a-z0-9\s]/g," ");return t.replace(/\s+/g," ").trim();}
function noahPriceFromText(text){var m=String(text||"").match(/\b(from\s*)?(?:KSh|Kshs?|KES)\s*([\d,]+(?:\.\d{1,2})?)/i);if(!m)return null;var amount=Number(m[2].replace(/,/g,""));if(!isFinite(amount))return null;return {price:(m[1]?"from ":"")+"KSh "+amount.toLocaleString("en-KE"),amount:amount};}
function noahReadPricesFromDoc(doc){var changed=0;NOAH_ORDER.forEach(function(key){var svc=NOAH_SERVICES[key],needle=noahNorm(svc.name),best=null,bestLen=Infinity;var all=doc.querySelectorAll("body *");for(var i=0;i<all.length;i++){var el=all[i];if(el.children.length>8)continue;var txt=(el.innerText||el.textContent||"").trim();if(!txt||txt.length>650)continue;var norm=noahNorm(txt);if(norm.indexOf(needle)===-1)continue;var parsed=noahPriceFromText(txt);if(parsed&&txt.length<bestLen){best=parsed;bestLen=txt.length;}}if(best){svc.price=best.price;svc.amount=best.amount;changed++;}});return changed;}
var noahPriceLoad=null;
function noahRefreshLivePrices(){if(noahPriceLoad)return noahPriceLoad;noahPriceLoad=new Promise(function(resolve){try{noahReadPricesFromDoc(document);if(!window.fetch||!window.DOMParser){resolve();return;}var url=new URL("/services",location.origin).href;window.fetch(url,{credentials:"same-origin",headers:{"Accept":"text/html"}}).then(function(res){if(!res.ok)throw new Error("Services page unavailable");return res.text();}).then(function(html){var doc=new DOMParser().parseFromString(html,"text/html");noahReadPricesFromDoc(doc);resolve();}).catch(function(){resolve();});}catch(e){resolve();}});return noahPriceLoad;}
function noahPrices(){var out="<strong>Current ArkWay service rates (KSh)</strong><br/>";NOAH_ORDER.forEach(function(k){out+="• "+NOAH_SERVICES[k].name+" — "+NOAH_SERVICES[k].price+"<br/>";});return out+"<br/>Prices shown are the rates available on the website. For project-specific details, contact us.<br/>"+noahServicesLink()+"<br/>"+noahContactLink();}
function noahAudio(){return "<strong>Audio production and services</strong><br/>We can help with recording, mixing and mastering, custom production, and live instruments. Tell me what you already have and what you want to finish, and I’ll point you to the best fit.<br/><br/>"+noahServicesLink();}
function noahProducts(){return "<strong>The ArkWay Sound Vault</strong><br/>Browse beats, sample packs, loop kits, and other digital products. Click Buy on the product you want to open its Hustlesasa storefront page and see the product details.<br/><br/>"+noahProductsLink();}
function noahCompanyAnswer(){return "<strong>ArkWay Creative — Media, Data &amp; Culture</strong><br/>ArkWay Creative helps businesses, brands, and creators build clearer identity, creative direction, and professional media.<br/><br/><strong>What we offer for business owners &amp; brands:</strong><br/>• <strong>Radio/Social Ads &amp; Jingles (KSh 12,000):</strong> Promotional audio for marketing campaigns.<br/>• <strong>Brand Architecture &amp; Strategy:</strong> Custom brand positioning and identity development tailored to your business goals.<br/>• <strong>Film/Series Scoring (from KSh 15,000):</strong> Original soundtracks and audio for commercial or video projects.<br/>• <strong>Voiceover &amp; Podcast Cleaning (KSh 5,000):</strong> Professional audio restoration for corporate podcasts, ads, or spoken content.<br/><br/>" + noahServicesLink() + "<br/>" + noahContactLink();}
function noahLicensingAnswer(){return "Each product has its own licensing details. Click Buy to open its Hustlesasa page, then read the product description before purchasing. It explains the applicable terms.";}
function noahFreeSampleAnswer(){return "Yes, the designated free samples are free. Just follow the instructions provided to access them.";}
function noahPaymentAnswer(){return "Purchases are handled securely through our Hustlesasa storefront, which supports card payments and international purchases.";}
function noahHuman(){return "You can reach the ArkWay team directly:<br/><br/>• <strong>WhatsApp:</strong> +254 118 618 199<br/>• <strong>Email:</strong> arkwaycreative@gmail.com<br/><br/>"+noahContactLink()+"<br/>"+noahLink(NOAH_EMAIL,"Send an email →");}
function noahFallback(){return "Your ArkWay creative assistant can help you explore services, find products, understand prices, and choose the right option for your project. What are you working on?";}

var NOAH_PATTERNS={
 mixmaster:/\b(mix|mixing|mixed|master|mastering|mastered|polish|external mix|external vocal|already recorded|recorded vocals)\b/,
 single:/\b(complete single|single package|full single)\b/,
 custom:/\b(custom beat|custom production|full custom|song production|full production|make me a beat|produce a song|need a beat|want a beat|beat from scratch)\b/,
 guitar:/\b(guitar|guitarist)\b/,
 bass:/\b(bass|bassist)\b/,
 full:/\b(instrumentation|live band|full band|all instruments|multiple instruments)\b/,
 ads:/\b(advert|advertisement|ads|jingle|radio|commercial|promo|promotional audio)\b/,
 film:/\b(film|movie|series|score|scoring|soundtrack|short film)\b/,
 voice:/\b(voiceover|voice over|podcast|audio cleaning|clean audio|spoken word)\b/,
 brand:/\b(brand|branding|brand architecture|strategy|campaign|business|corporate|startup)\b/
};

function noahDetect(q){var d={keys:[],licensing:false,freeSample:false,payment:false,product:false,price:false,book:false,contact:false,human:false,services:false,projectHelp:false,recording:false,hasBeatMention:false,hasVocalsMention:false,brand:false};var found={};Object.keys(NOAH_PATTERNS).forEach(function(k){if(NOAH_PATTERNS[k].test(q))found[k]=true;});if(found.mixmaster)found.mixmaster=true;
if(/\b(record|recording|vocal session|quick vocal|sing|rapping|record my vocals|record vocals)\b/.test(q)&&!found.mixmaster)found.vocal=true;
NOAH_ORDER.forEach(function(k){if(found[k])d.keys.push(k);});
d.brand=found.brand;
var free=/\b(free|no cost|without paying)\b/.test(q),sample=/\b(samples?|sample packs?|loop packs?|loops?)\b/.test(q);
d.licensing=/\b(rights|licensing|license|licence|royalt(y|ies)|redistribution|usage rights|exclusive rights|can i use|commercial use|streaming rights)\b/.test(q);
d.freeSample=free&&sample;
d.payment=/\b(pay|payment|outside kenya|international|card|visa|mastercard|foreign|abroad|from another country|dollar)\b/.test(q);
d.product=/\b(products?|shop|store|buy|purchase|vault|packs?|loops?|beats?|sample)\b/.test(q);
d.price=/\b(price|prices|pricing|cost|costs|how much|ksh|kes|budget|rate|rates|charge|charges)\b/.test(q)||/\b\d{3,}\b/.test(q);
d.book=/\b(book|booking|reserve|schedule|session)\b/.test(q);
d.contact=/\b(contact|whatsapp|email|phone|reach|talk to|speak to)\b/.test(q);
d.human=/\b(human|real person|real people|team|yovan|someone|person)\b/.test(q);
d.services=/\b(services?|what do you offer|what can you do)\b/.test(q);
d.projectHelp=/\b(which service|what do i need|help me choose|not sure|dont know|don't know|recommend|my project|my song|release a song|finish my song)\b/.test(q);
d.recording=/\b(record|recording|vocals?|sing|rapping|quick vocal)\b/.test(q);
d.hasBeatMention=/\b(have|got|already have|already got|i made)\b.{0,20}\b(beat|instrumental)\b|\b(beat|instrumental)\b.{0,20}\b(already|ready|got|have)\b/.test(q);
d.hasVocalsMention=/\b(already recorded|have recorded|recorded my vocals|recorded the song|have a recording|my vocals are recorded)\b/.test(q);
return d;}

function noahServiceAnswer(key){var s=NOAH_SERVICES[key];return "<strong>"+s.name+" — "+s.price+"</strong><br/>"+NOAH_NOTES[key]+"<br/><br/>"+noahServicesLink()+"<br/>"+noahContactLink();}

function noahRespondCore(raw){var S=noahState,q=noahNorm(raw);S.lastQuestion=q;S.turns++;if(!q){noahAnswer(noahFallback(),"",{keep:true,chips:NOAH_MAIN,noRestart:true});return;}
if(/\b(start over|restart|reset|main menu|start again)\b/.test(q)){noahRestart();return;}
var d=noahDetect(q);
if(/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(q)&&q.split(" ").length<6){noahAnswer("Hey! I’m Noah, your ArkWay guide. What can I help you with today?","",{keep:true,chips:NOAH_MAIN,noRestart:true});return;}
if(/\b(thanks|thank you|cheers)\b/.test(q)){noahAnswer("You’re welcome! Want help choosing a service or finding a product?","",{keep:true,chips:[["Explore Services","what services do you offer"],["Find a Product","where can i buy your products"]]});return;}

if(/\b(what does arkway( creative)? do( for (a |my |our )?(business|businesses|brand|company|organisation|organization|artist|artists|client|clients))?|what can arkway( creative)? do( for (a |my |our )?(business|businesses|brand|company|organisation|organization|artist|artists|client|clients))?|how can arkway( creative)? help( me| us| (my |our )?(business|businesses|brand|company|organisation|organization|artist|artists))?|what does (the )?company do|what kind of company is arkway|what is arkway( creative)?|about arkway|tell me about arkway|who are you|what do you do|what services do you offer for businesses|what does arkway offer|what is your company about|what is your business about|tell me what arkway does|explain arkway|company overview|business services)\b/.test(q)||d.brand){
noahAnswer(noahCompanyAnswer(),"business",{keep:true,chips:[["Radio & Social Ads","radio and social ads"],["Voiceover Cleaning","voiceover audio cleaning"],["Film Scoring","film scoring"],["Contact ArkWay","how do i contact you"]]});return;
}

if(d.hasBeatMention)S.hasBeat=true;
if(d.hasVocalsMention)S.hasVocals=true;
if(/\b(i dont have a beat|i do not have a beat|no beat|need a beat|make a beat)\b/.test(q))S.hasBeat=false;
if(/\b(not recorded|havent recorded|have not recorded|need to record)\b/.test(q))S.hasVocals=false;
if(d.licensing){noahAnswer(noahLicensingAnswer(),"products",{chips:[["Browse products","where can i buy your products"],["Contact ArkWay","how do i contact you"]]});return;}
if(d.freeSample){noahAnswer(noahFreeSampleAnswer(),"products",{chips:[["Browse products","where can i buy your products"]]});return;}
if(d.payment){noahAnswer(noahPaymentAnswer(),"products",{chips:[["Browse products","where can i buy your products"],["Contact ArkWay","how do i contact you"]]});return;}
if(d.human||d.contact){noahAnswer(noahHuman(),"contact",{keep:true,chips:[]});return;}
if(/\b(what does external|external mix|what is mixing|what is mastering|what does mix and master)\b/.test(q)){noahAnswer(noahServiceAnswer("mixmaster"),"audio",{keys:["mixmaster"]});return;}

if(d.projectHelp){
if(S.hasVocals===true||/\b(already recorded|recorded my song|recorded vocals|have a recording)\b/.test(q)){noahAnswer("If your vocals are already recorded, <strong>External Vocal Mix &amp; Master — "+NOAH_SERVICES.mixmaster.price+"</strong> may be the right option. You provide the existing recording and instrumental; ArkWay mixes and masters them.","audio",{keys:["mixmaster"],chips:[["External Mix & Master","external mix and master"],["See all services","what services do you offer"]]});return;}
if(S.hasBeat===true){noahAnswer("Since you already have a beat, the <strong>Quick Vocal Session — "+NOAH_SERVICES.vocal.price+"</strong> is a good place to start: bring your instrumental and record your vocals.","audio",{keys:["vocal"],chips:[["Quick Vocal Session","quick vocal session"],["External Mix & Master","external mix and master"]]});return;}
if(S.hasBeat===false){noahAnswer("If you don’t have a beat yet, look at <strong>Full Custom Beat &amp; Song Production — "+NOAH_SERVICES.custom.price+"</strong> for custom production tailored to your vision.","audio",{keys:["custom"],chips:[["Custom Production","custom beat production"],["See all services","what services do you offer"]]});return;}
noahAnswer("I can help you choose. Are you working on music as an artist, or looking for business branding, advertising, or media audio?","",{keep:true,chips:[["Music Recording","quick vocal session"],["Business Advertising","radio and social ads"],["Brand Architecture","brand architecture"]]);return;
}

if(d.price){var relevant=d.keys.length===1?d.keys[0]:(S.service||(S.lastKeys.length===1?S.lastKeys[0]:""));var mentionedAmount=(q.match(/\b(\d{3,})\b/)||[])[1];if(!relevant&&mentionedAmount){var matches=NOAH_ORDER.filter(function(k){return String(NOAH_SERVICES[k].amount)===mentionedAmount;});if(matches.length===1)relevant=matches[0];}if(relevant&&NOAH_SERVICES[relevant]){noahAnswer(noahServiceAnswer(relevant),"audio",{keys:[relevant]});return;}noahAnswer(noahPrices(),"services",{chips:[["Business Services","what can arkway do for my business"],["Explore services","what services do you offer"]]});return;}
if(d.keys.length===1){var key=d.keys[0];noahAnswer(noahServiceAnswer(key),key==="film"||key==="ads"?"film":"audio",{keys:[key]});return;}
if(d.keys.length>1){noahAnswer("Here are the current listed rates matching your request:<br/><br/>"+d.keys.map(function(k){return "• "+NOAH_SERVICES[k].name+" — "+NOAH_SERVICES[k].price;}).join("<br/>")+"<br/><br/>Tell me a bit more about your project so we can help.","audio",{keys:[],chips:[["Contact ArkWay","how do i contact you"]]});return;}
if(d.product){noahAnswer(noahProducts(),"products",{chips:[["Ask about licensing","what are the licensing terms"],["Ask about free samples","are the free samples really free"]]});return;}
if(d.services){noahAnswer("ArkWay offers creative services for both artists (recording, mixing, custom beats) and businesses (brand architecture, ads & jingles, film scoring, and podcast cleaning).<br/><br/>"+noahServicesLink(), "services",{chips:[["Business Solutions","what can arkway do for my business"],["Artist Services","what services do you offer"]]});return;}
if(d.book){noahAnswer("To get started, open the relevant service card and use its booking or inquiry option, or contact the team directly.<br/><br/>"+noahServicesLink()+"<br/>"+noahContactLink(),"audio",{keep:true,chips:[["Contact ArkWay","how do i contact you"]]});return;}

noahAnswer(noahFallback(),"",{keep:true,chips:NOAH_MAIN,noRestart:true});
}
function noahRespond(raw){noahRefreshLivePrices().then(function(){noahRespondCore(raw)});}
window.sendNoahMessage=function(){var input=document.getElementById("noah-input");if(!input)return;var original=input.value.trim();if(!original)return;noahClearQuick();window.appendNoahMessage(original,true);input.value="";noahRespond(original);};
window.handleNoahKeyPress=function(event){if(event.isComposing)return;if(event.key==="Enter"&&!event.shiftKey){event.preventDefault();window.sendNoahMessage();}};

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",noahFixLauncherLabel);else noahFixLauncherLabel();
})();
