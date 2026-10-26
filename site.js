
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
   ARKWAY CREATIVE — NOAH CHATBOT
   Targeted refinement; other site features preserved.
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
 vocal:"If you already have your beat, bring it along and record your vocals with us. This session is for recording your song over your existing instrumental. Check the service details or contact us to confirm any additional editing, mixing, or mastering included.",
 mixmaster:"Already recorded your song? Send us your existing vocal recording and instrumental, and we’ll mix and master them. This option is for an existing recording, not a new vocal-recording session.",
 single:"This is a bundled option for a single. Check the service card for the exact inclusions so you know what is covered before booking.",
 custom:"This is for a song that needs custom production, rather than simply recording over a beat you already have. Contact us with your idea so we can confirm the scope and deliverables.",
 guitar:"A recorded acoustic or lead-guitar part can add live, organic detail to your track. The service card has the current details.",
 bass:"Live bass recorded for your music production, with the part shaped to fit the groove and arrangement of your track.",
 full:"A broader instrumentation option for projects that need more than one instrument part. Check the service card or contact us to confirm the exact instrumentation included.",
 ads:"Audio for promotional campaigns, including radio or social-media ads and jingles. Contact us with the purpose and length of your ad to confirm the project scope.",
 film:"Original music scoring for film, series, or video projects. Pricing starts at the listed rate, and the final scope depends on the project.",
 voice:"Audio cleaning for voiceovers, podcasts, and other spoken-word recordings. Check the service card for the exact scope."
};
var NOAH_MAIN=[["Explore Services","what services do you offer"],["Find a Product","where can i buy your products"],["Get Pricing","how much do your services cost"],["Help With My Project","i dont know which service i need"],["Contact ArkWay","how do i contact you"]];
var noahQuickRow=null;

function noahLink(url,label,color){var safe=String(url).replace(/&/g,"&amp;").replace(/"/g,"&quot;");var external=/^https?:/.test(url);return '<a href="'+safe+'"'+(external?' target="_blank" rel="noopener noreferrer"':'')+' style="color:'+(color||"#D4AF37")+';font-weight:bold;">'+label+'</a>';}
function noahContactLink(){return noahLink(NOAH_LINK,"Talk to ArkWay on WhatsApp →","#E2C66B")}
function noahServicesLink(){return noahLink("/services","Explore Services →")}
function noahProductsLink(){return noahLink("/products","Browse the Sound Vault →")}
function noahCommunityLink(){return noahLink("/community","Explore the Community →")}
function noahResetState(){noahState.lastTopic="";noahState.lastQuestion="";noahState.lastKeys=[];noahState.service="";noahState.need="";noahState.hasBeat=null;noahState.hasVocals=null;noahState.pending="";noahState.fallbacks=0;noahState.turns=0;}
function noahDefaultChips(topic){if(topic==="audio")return [["Get pricing","how much"],["Book a session","how do i book"]];if(topic==="film")return [["Get pricing","how much"],["Request a quote","how do i contact you"]];if(topic==="products")return [["Browse products","where can i buy your products"],["Ask about licensing","what are the licensing terms"]];return [["Explore services","what services do you offer"],["Get pricing","how much do your services cost"]];}
function noahAnswer(html,topic,opts){opts=opts||{};if(topic)noahState.lastTopic=topic;if(!opts.keep){noahState.lastKeys=opts.keys||[];noahState.service=noahState.lastKeys.length===1?noahState.lastKeys[0]:noahState.service;noahState.pending=opts.pending||"";if(!opts.fallback)noahState.fallbacks=0;}window.appendNoahMessage(html,false);var chips=opts.chips;if(chips===undefined)chips=noahDefaultChips(noahState.lastTopic);noahAddQuick(chips,opts.noRestart);}
function noahClearQuick(){if(noahQuickRow&&noahQuickRow.parentNode)noahQuickRow.parentNode.removeChild(noahQuickRow);noahQuickRow=null;}
function noahAddQuick(chips,noRestart){noahClearQuick();var box=document.getElementById("noah-messages");if(!box||!chips||!chips.length)return;var list=chips.slice(0,noRestart?5:4);if(!noRestart)list.push(["↺ Start over","__restart"]);var row=document.createElement("div");row.setAttribute("data-noah-quick","1");row.style.cssText="display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 10px;";list.forEach(function(c){var b=document.createElement("button");b.type="button";b.textContent=c[0];b.style.cssText="border:1px solid #D4AF37;background:transparent;color:#E2C66B;border-radius:999px;padding:8px 12px;font-size:13px;line-height:1.2;min-height:36px;cursor:pointer;font-family:inherit;";b.addEventListener("click",function(){window.handleNoahQuick(c[0],c[1])});row.appendChild(b)});box.appendChild(row);box.scrollTop=box.scrollHeight;noahQuickRow=row;}
window.handleNoahQuick=function(label,text){noahClearQuick();window.appendNoahMessage(label,true);if(text==="__restart"){setTimeout(noahRestart,150);return;}setTimeout(function(){noahRespond(text)},150)};
function noahRestart(){noahResetState();noahClearQuick();noahAnswer("Fresh start — what would you like help with?","",{chips:NOAH_MAIN,noRestart:true});}

// Keep the visible launcher wording correct if a suitable text label already exists in the page.
function noahFixLauncherLabel(){
 var candidates=$("#noah-chatbot-container button, #noah-chatbot-container a, #noah-chatbot-container [role='button'], button, a, [role='button']");
 candidates.forEach(function(el){var txt=(el.textContent||"").trim();if(/need guidance|ask noah/i.test(txt)&&txt.length<100){var label=el.querySelector("span");if(label)label.textContent="Need guidance? Ask Noah";else if(el.children.length===0)el.textContent="Need guidance? Ask Noah";}});
}
window.toggleNoahChat=function(){var container=document.getElementById("noah-chatbot-container"),win=document.getElementById("noah-chat-window"),openIcon=document.getElementById("noah-icon-open"),closeIcon=document.getElementById("noah-icon-close");if(!win)return;var isHidden=win.classList.contains("noah-hidden");if(isHidden){win.classList.remove("noah-hidden");if(container)container.classList.add("active");if(openIcon)openIcon.style.display="none";if(closeIcon)closeIcon.style.display="inline";if(!noahState.greeted)noahState.greeted=true;var msgs=document.getElementById("noah-messages");if(msgs&&!msgs.firstChild){window.appendNoahMessage("Hi! I’m Noah, your ArkWay guide. I can help you understand our services, compare options, find products, and check prices. What are you working on?",false);noahAddQuick(NOAH_MAIN,true);}noahRefreshLivePrices();}else{win.classList.add("noah-hidden");if(container)container.classList.remove("active");if(openIcon)openIcon.style.display="block";if(closeIcon)closeIcon.style.display="none";}};
window.appendNoahMessage=function(text,isUser){var container=document.getElementById("noah-messages");if(!container)return;if(!container.getAttribute("aria-live")){container.setAttribute("aria-live","polite");container.style.overscrollBehavior="contain";}var msgDiv=document.createElement("div");msgDiv.className="noah-msg "+(isUser?"noah-msg-user":"noah-msg-bot");if(isUser)msgDiv.textContent=text;else msgDiv.innerHTML=text;container.appendChild(msgDiv);container.scrollTop=container.scrollHeight;};

/* Live service-price lookup: first inspect the current page, then the site's Services page.
   If no matching published price is found, keep the supplied fallback rather than guessing. */
function noahNorm(text){var t=String(text||"").toLowerCase().replace(/[’‘`']/g,"");t=t.replace(/&/g," and ").replace(/(\d),(?=\d{3}\b)/g,"$1");t=t.replace(/(ksh|kshs|kes)\s*/g,"ksh ");t=t.replace(/(\d+(?:\.\d+)?)\s*k\b/g,function(m,n){return String(Math.round(parseFloat(n)*1000))});t=t.replace(/[^a-z0-9\s]/g," ");return t.replace(/\s+/g," ").trim();}
function noahPriceFromText(text){var m=String(text||"").match(/\b(from\s*)?(?:KSh|Kshs?|KES)\s*([\d,]+(?:\.\d{1,2})?)/i);if(!m)return null;var amount=Number(m[2].replace(/,/g,""));if(!isFinite(amount))return null;return {price:(m[1]?"from ":"")+"KSh "+amount.toLocaleString("en-KE"),amount:amount};}
function noahReadPricesFromDoc(doc){var changed=0;NOAH_ORDER.forEach(function(key){var svc=NOAH_SERVICES[key],needle=noahNorm(svc.name),best=null,bestLen=Infinity;var all=doc.querySelectorAll("body *");for(var i=0;i<all.length;i++){var el=all[i];if(el.children.length>8)continue;var txt=(el.innerText||el.textContent||"").trim();if(!txt||txt.length>650)continue;var norm=noahNorm(txt);if(norm.indexOf(needle)===-1)continue;var parsed=noahPriceFromText(txt);if(parsed&&txt.length<bestLen){best=parsed;bestLen=txt.length;}}if(best){svc.price=best.price;svc.amount=best.amount;changed++;}});return changed;}
var noahPriceLoad=null;
function noahRefreshLivePrices(){if(noahPriceLoad)return noahPriceLoad;noahPriceLoad=new Promise(function(resolve){try{noahReadPricesFromDoc(document);if(!window.fetch||!window.DOMParser){resolve();return;}var url=new URL("/services",location.origin).href;window.fetch(url,{credentials:"same-origin",headers:{"Accept":"text/html"}}).then(function(res){if(!res.ok)throw new Error("Services page unavailable");return res.text();}).then(function(html){var doc=new DOMParser().parseFromString(html,"text/html");noahReadPricesFromDoc(doc);resolve();}).catch(function(){resolve();});}catch(e){resolve();}});return noahPriceLoad;}
function noahPrices(){var out="<strong>Current ArkWay service rates (KSh)</strong><br/>";NOAH_ORDER.forEach(function(k){out+="• "+NOAH_SERVICES[k].name+" — "+NOAH_SERVICES[k].price+"<br/>";});return out+"<br/>Prices shown are the rates available on the website. For project-specific details, contact us.<br/>"+noahServicesLink()+"<br/>"+noahContactLink();}
function noahAudio(){return "<strong>Audio production and services</strong><br/>We can help with recording, mixing and mastering, custom production, and live instruments. Tell me what you already have and what you want to finish, and I’ll point you to the best fit.<br/><br/>"+noahServicesLink();}
function noahProducts(){return "<strong>The ArkWay Sound Vault</strong><br/>Browse beats, sample packs, loop kits, and other digital products. Click Buy on the product you want to open its Hustlesasa storefront page and see the product details.<br/><br/>"+noahProductsLink();}
function noahLicensingAnswer(){return "Licensing terms can differ by product. Click Buy on the product you’re interested in to open its Hustlesasa page, then read the product description before purchasing. That is where the applicable usage and licensing details are provided.";}
function noahFreeSampleAnswer(){return "Yes, designated free samples are free. Follow the instructions on the product page to access them. If you get stuck, tell me which step you’re on and I’ll help you find the next step.";}
function noahPaymentAnswer(){return "Purchases are handled through the Hustlesasa storefront, which supports card payments for international customers. Click Buy on the product page to see the available payment options for your purchase.";}
function noahHuman(){return "You can contact the ArkWay team directly:<br/><br/>• <strong>WhatsApp:</strong> +254 118 618 199<br/>• <strong>Email:</strong> arkwaycreative@gmail.com<br/><br/>"+noahContactLink()+"<br/>"+noahLink(NOAH_EMAIL,"Send an email →");}
function noahFallback(){return "I can help you explore services, understand prices, find products, or explain how to buy. What are you working on — recording a song, finishing an existing recording, making a beat, or something else?";}

var NOAH_PATTERNS={
 mixmaster:/\b(mix|mixing|mixed|master|mastering|mastered|polish|external mix|external vocal|already recorded|recorded vocals)\b/,
 single:/\b(complete single|single package|full single)\b/,
 custom:/\b(custom beat|custom production|full custom|song production|full production|make me a beat|produce a song|need a beat|want a beat|beat from scratch)\b/,
 guitar:/\b(guitar|guitarist)\b/,
 bass:/\b(bass|bassist)\b/,
 full:/\b(instrumentation|live band|full band|all instruments|multiple instruments)\b/,
 ads:/\b(advert|advertisement|ads|jingle|radio|commercial|promo|promotional audio)\b/,
 film:/\b(film|movie|series|score|scoring|soundtrack|short film)\b/,
 voice:/\b(voiceover|voice over|podcast|audio cleaning|clean audio|spoken word)\b/
};
function noahDetect(q){var d={keys:[],licensing:false,freeSample:false,payment:false,product:false,price:false,book:false,contact:false,human:false,services:false,projectHelp:false,recording:false,hasBeatMention:false,hasVocalsMention:false};var found={};Object.keys(NOAH_PATTERNS).forEach(function(k){if(NOAH_PATTERNS[k].test(q))found[k]=true;});if(found.mixmaster)found.mixmaster=true;
if(/\b(record|recording|vocal session|quick vocal|sing|rapping|record my vocals|record vocals)\b/.test(q)&&!found.mixmaster)found.vocal=true;
NOAH_ORDER.forEach(function(k){if(found[k])d.keys.push(k);});
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

function noahRespondCore(raw){
var S=noahState,q=noahNorm(raw);S.lastQuestion=q;S.turns++;
if(!q){noahAnswer(noahFallback(),"",{keep:true,chips:NOAH_MAIN,noRestart:true});return;}
if(/\b(start over|restart|reset|main menu|start again)\b/.test(q)){noahRestart();return;}
var d=noahDetect(q);
if(/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(q)&&q.split(" ").length<6){noahAnswer("Hey! I’m Noah, your ArkWay guide. What can I help you with today?","",{keep:true,chips:NOAH_MAIN,noRestart:true});return;}
if(/\b(thanks|thank you|cheers)\b/.test(q)){noahAnswer("You’re welcome! Want help choosing a service or finding a product?","",{keep:true,chips:[["Explore Services","what services do you offer"],["Find a Product","where can i buy your products"]]});return;}
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
 if(S.hasVocals===true||/\b(already recorded|recorded my song|recorded vocals|have a recording)\b/.test(q)){
  noahAnswer("If your vocals are already recorded, <strong>External Vocal Mix &amp; Master — "+NOAH_SERVICES.mixmaster.price+"</strong> may be the right option. You provide the existing recording and instrumental; ArkWay mixes and masters them. If you also need new vocals recorded, tell me.","audio",{keys:["mixmaster"],chips:[["External Mix & Master","external mix and master"],["See all services","what services do you offer"]]});return;
 }
 if(S.hasBeat===true){
  noahAnswer("Since you already have a beat, the <strong>Quick Vocal Session — "+NOAH_SERVICES.vocal.price+"</strong> is a good place to start: bring your instrumental and record your vocals. If your vocals are already recorded, the External Vocal Mix &amp; Master option may fit better.","audio",{keys:["vocal"],chips:[["Quick Vocal Session","quick vocal session"],["External Mix & Master","external mix and master"]]});return;
 }
 if(S.hasBeat===false){
  noahAnswer("If you don’t have a beat yet, look at <strong>Full Custom Beat &amp; Song Production — "+NOAH_SERVICES.custom.price+"</strong>. It is the more relevant option to ask about for custom production. The team can confirm the exact scope for your song.","audio",{keys:["custom"],chips:[["Custom Production","custom beat production"],["See all services","what services do you offer"]]});return;
 }
 noahAnswer("I can help you choose. Have you already got a beat or instrumental, and have you recorded your vocals yet?","audio",{keep:true,pending:"project",chips:[["I have a beat","i already have a beat"],["I need a beat","i dont have a beat"],["I've recorded vocals","i have already recorded my vocals"]]});return;
}

if(d.price){
 var relevant=d.keys.length===1?d.keys[0]:(S.service||(S.lastKeys.length===1?S.lastKeys[0]:""));
 var mentionedAmount=(q.match(/\b(\d{3,})\b/)||[])[1];
 if(!relevant&&mentionedAmount){var matches=NOAH_ORDER.filter(function(k){return String(NOAH_SERVICES[k].amount)===mentionedAmount;});if(matches.length===1)relevant=matches[0];}
 if(relevant&&NOAH_SERVICES[relevant]){noahAnswer(noahServiceAnswer(relevant),"audio",{keys:[relevant]});return;}
 if(S.pending==="project"||S.lastTopic==="audio"){noahAnswer("Which option do you mean — recording vocals over your own beat, mixing and mastering an existing recording, or custom production?","audio",{keep:true,chips:[["Quick Vocal Session","quick vocal session"],["External Mix & Master","external mix and master"],["Custom Production","custom beat production"]]});return;}
 noahAnswer(noahPrices(),"services",{chips:[["Help me choose","i dont know which service i need"],["Explore services","what services do you offer"]]});return;
}
if(d.keys.length===1){var key=d.keys[0];noahAnswer(noahServiceAnswer(key),key==="film"?"film":"audio",{keys:[key]});return;}
if(d.keys.length>1){noahAnswer("These options may fit what you described. Here are the current listed prices:<br/><br/>"+d.keys.map(function(k){return "• "+NOAH_SERVICES[k].name+" — "+NOAH_SERVICES[k].price;}).join("<br/>")+"<br/><br/>Tell me what you already have, and I can help narrow it down.","audio",{keys:[],chips:[["Help me choose","i dont know which service i need"],["Contact ArkWay","how do i contact you"]]});return;}
if(d.product){noahAnswer(noahProducts(),"products",{chips:[["Ask about licensing","what are the licensing terms"],["Ask about free samples","are the free samples really free"]]});return;}
if(d.services){noahAnswer(noahAudio(),"audio",{chips:[["Compare recording options","which recording service do i need"],["Get pricing","how much do your services cost"],["Browse products","where can i buy your products"]]});return;}
if(d.book){noahAnswer("To get started, open the relevant service card and use its booking or inquiry option. You can also contact ArkWay directly and explain which service you need.<br/><br/>"+noahServicesLink()+"<br/>"+noahContactLink(),"audio",{keep:true,chips:[["View services","what services do you offer"],["Contact ArkWay","how do i contact you"]]});return;}
if(/\b(what is arkway|about arkway|who are you|what do you do)\b/.test(q)){noahAnswer("ArkWay Creative is a creative media company offering audio production, digital sound products, and related creative services. I can help you explore the services or find the right product for your project.","",{keep:true,chips:NOAH_MAIN,noRestart:true});return;}
noahAnswer(noahFallback(),"",{keep:true,chips:NOAH_MAIN,noRestart:true});
}
function noahRespond(raw){noahRefreshLivePrices().then(function(){noahRespondCore(raw)});}
window.sendNoahMessage=function(){var input=document.getElementById("noah-input");if(!input)return;var original=input.value.trim();if(!original)return;noahClearQuick();window.appendNoahMessage(original,true);input.value="";noahRespond(original);};
window.handleNoahKeyPress=function(event){if(event.isComposing)return;if(event.key==="Enter"&&!event.shiftKey){event.preventDefault();window.sendNoahMessage();}};

// Best-effort label correction when the launcher already contains a text label.
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",noahFixLauncherLabel);else noahFixLauncherLabel();
})();
