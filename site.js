(function(){
var $=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var nav=document.getElementById("navlinks"),mb=document.getElementById("menuBtn");
if(mb)mb.addEventListener("click",function(){nav.classList.toggle("open")});

// Product filters
function applyFilter(f){var shown=0;$(".product-card").forEach(function(c){var ok=f==="ALL PRODUCTS"||c.dataset.cat===f;c.hidden=!ok;if(ok)shown++});
$("[data-filter]").forEach(function(b){b.classList.toggle("active",b.dataset.filter===f)});
var e=document.getElementById("productEmpty");if(e)e.hidden=shown>0}
$("[data-filter]").forEach(function(b){b.addEventListener("click",function(){applyFilter(b.dataset.filter);history.replaceState(null,"",b.dataset.filter==="ALL PRODUCTS"?location.pathname:"?filter="+encodeURIComponent(b.dataset.filter))})});
var q=new URLSearchParams(location.search).get("filter");if(q&&$("[data-filter]").length)applyFilter(q);

// Demo play toggle
$("[data-play]").forEach(function(b){b.addEventListener("click",function(){var w=b.closest(".product-preview").querySelector(".waveform");w.classList.toggle("playing");b.textContent=w.classList.contains("playing")?"Ⅱ Pause Demo":"▶ Play Demo"})});

// Share link
$("[data-share]").forEach(function(b){b.addEventListener("click",function(){var u=location.origin+"/products#product-"+b.dataset.share;
var done=function(){b.textContent="Link Copied";setTimeout(function(){b.textContent="Share Link →"},1800)};
if(navigator.clipboard)navigator.clipboard.writeText(u).then(done,function(){window.prompt("Copy this ArkWay product link:",u)});else window.prompt("Copy this ArkWay product link:",u)})});

// Discography toggle
$("[data-mode]").forEach(function(b){b.addEventListener("click",function(){$("[data-mode]").forEach(function(x){x.classList.toggle("active",x===b)});
document.getElementById("stream").hidden=b.dataset.mode!=="stream";document.getElementById("download").hidden=b.dataset.mode!=="download"})});

// Booking modal with history/back-button support
var modalActiveState = false;

function closeBookingModal() {
  var w = document.querySelector(".modal-backdrop");
  if (w) {
    w.remove();
    document.body.classList.remove("locked");
  }
  modalActiveState = false;
}

$(".book-service").forEach(function(b){b.addEventListener("click",function(){
  document.body.classList.add("locked");
  var w=document.createElement("div");
  w.className="modal-backdrop";
  var s=b.dataset.service.replace(/</g,"&lt;");
  w.innerHTML='<div class="modal" role="dialog" aria-modal="true"><button class="modal-close" aria-label="Close">×</button><p class="eyebrow">INSTANT INQUIRY</p><h2>Book <em>'+s+'</em></h2><p>Choose how you want to start the conversation. Your service details will be pre-filled.</p><div class="modal-actions"><a class="primary large" target="_blank" rel="noopener" href="'+b.dataset.wa+'">Open WhatsApp →</a><a class="secondary large" href="'+b.dataset.em+'">Send Email ✉</a></div><span class="modal-note">0118618199 · arkwaycreative@gmail.com</span></div>';
  document.body.appendChild(w);

  if (!modalActiveState) {
    modalActiveState = true;
    history.pushState({ bookingModalOpen: true }, "");
  }

  var close=function(){
    if (modalActiveState) {
      history.back();
    } else {
      closeBookingModal();
    }
  };

  w.addEventListener("mousedown",function(e){if(e.target===w)close()});
  w.querySelector(".modal-close").addEventListener("click",close);
  
  document.addEventListener("keydown",function k(e){if(e.key==="Escape"){close();document.removeEventListener("keydown",k)}});
})});

window.addEventListener("popstate", function(e) {
  if (modalActiveState) {
    closeBookingModal();
  }
});

/* ==========================================
   ARKWAY CREATIVE — NOAH AI CHATBOT LOGIC
   ========================================== */
window.toggleNoahChat = function() {
  var container = document.getElementById('noah-chatbot-container');
  var win = document.getElementById('noah-chat-window');
  var openIcon = document.getElementById('noah-icon-open');
  var closeIcon = document.getElementById('noah-icon-close');
  if (!win) return;

  var isHidden = win.classList.contains('noah-hidden');
  if (isHidden) {
    win.classList.remove('noah-hidden');
    if (container) container.classList.add('active');
    if (openIcon) openIcon.style.display = 'none';
    if (closeIcon) closeIcon.style.display = 'inline';
  } else {
    win.classList.add('noah-hidden');
    if (container) container.classList.remove('active');
    if (openIcon) openIcon.style.display = 'block';
    if (closeIcon) closeIcon.style.display = 'none';
  }
};

window.appendNoahMessage = function(text, isUser) {
  var container = document.getElementById('noah-messages');
  if (!container) return;
  var msgDiv = document.createElement('div');
  msgDiv.className = 'noah-msg ' + (isUser ? 'noah-msg-user' : 'noah-msg-bot');
  msgDiv.innerHTML = text;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
};

window.handleNoahOption = function(key) {
  if (key === 'artist') {
    window.appendNoahMessage("Looking for Beats & Studio Services", true);
    setTimeout(function() {
      window.appendNoahMessage(
        "Got you covered! Explore our growing collection of beat packs and guitar loops, or lock in studio recording, mixing & mastering.<br/><br/>👉 <a href='/products' style='color:#D4AF37; font-weight:bold;'>Browse Sound Vault</a><br/>👉 <a href='/services' style='color:#D4AF37; font-weight:bold;'>View Studio Services</a>"
      );
    }, 400);
  } else if (key === 'brand') {
    window.appendNoahMessage("Brand Architecture & Positioning", true);
    setTimeout(function() {
      window.appendNoahMessage(
        "ArkWay builds undeniable identity and media systems for brands, startups, and artists. From creative direction to campaign strategy.<br/><br/>👉 <a href='/services' style='color:#D4AF37; font-weight:bold;'>Explore Brand Services</a><br/>👉 <a href='https://wa.me/254118618199' target='_blank' style='color:#E2C66B; font-weight:bold;'>Talk to Founder (WhatsApp)</a>"
      );
    }, 400);
  } else if (key === 'film') {
    window.appendNoahMessage("Film Scoring & Audio Design", true);
    setTimeout(function() {
      window.appendNoahMessage(
        "Need original film scoring, atmospheric textures, or custom sound design for your film, commercial, or visual project?<br/><br/>👉 <a href='/services' style='color:#D4AF37; font-weight:bold;'>Film Scoring Services</a><br/>👉 <a href='mailto:arkwaycreative@gmail.com' style='color:#D4AF37; font-weight:bold;'>Request Project Quote</a>"
      );
    }, 400);
  } else if (key === 'fan') {
    window.appendNoahMessage("Yovan's Music & Catalog", true);
    setTimeout(function() {
      window.appendNoahMessage(
        "Explore Yovan's official music releases, discography, and film writing!<br/><br/>👉 <a href='/community' style='color:#D4AF37; font-weight:bold;'>Listen to Music Catalog</a><br/>👉 <a href='https://substack.com/@betweenframesbyovan' target='_blank' style='color:#D4AF37; font-weight:bold;'>Read Between Frames</a>"
      );
    }, 400);
  }
};

window.sendNoahMessage = function() {
  var input = document.getElementById('noah-input');
  if (!input) return;
  var query = input.value.trim().toLowerCase();
  if (!query) return;

  window.appendNoahMessage(input.value, true);
  input.value = '';

  setTimeout(function() {
    // 1. Data & Analytics / Intelligence Layer
    if (query.indexOf('data') !== -1 || query.indexOf('analytic') !== -1 || query.indexOf('research') !== -1 || query.indexOf('metric') !== -1 || query.indexOf('report') !== -1 || query.indexOf('dashboard') !== -1 || query.indexOf('insight') !== -1) {
      window.appendNoahMessage(
        "<strong>Data & Analytics</strong> is ArkWay's intelligence layer. We power creative and business decisions with real evidence:<br/>" +
        "• <strong>Market Research & Analytics:</strong> Industry trends & commercial gap analysis.<br/>" +
        "• <strong>Audience & Stream Metrics:</strong> Deep dives into listener behavior & performance.<br/>" +
        "• <strong>Dashboards & Reporting:</strong> Real-time tracking for media projects & campaigns.<br/><br/>" +
        "👉 <a href='/services' style='color:#D4AF37; font-weight:bold;'>Explore Data & Analytics Services →</a>"
      );
    }
    // 2. Location / Studio Presence / Remote & Physical
    else if (query.indexOf('based') !== -1 || query.indexOf('where') !== -1 || query.indexOf('location') !== -1 || query.indexOf('city') !== -1 || query.indexOf('country') !== -1 || query.indexOf('town') !== -1 || query.indexOf('kitale') !== -1 || query.indexOf('kenya') !== -1) {
      window.appendNoahMessage(
        "ArkWay Creative is based in <strong>Kenya</strong>, operating globally for digital releases, film scoring, mixing, and strategy.<br/><br/>" +
        "• <strong>Physical Recording:</strong> Available for in-person studio sessions in the <strong>Kitale region</strong>.<br/>" +
        "• <strong>Global Remote Work:</strong> Digital audio production, mixing/mastering & data analytics worldwide.<br/><br/>" +
        "👉 <a href='https://wa.me/254118618199' target='_blank' style='color:#E2C66B; font-weight:bold;'>Inquire / Book Session →</a>"
      );
    }
    // 3. Registration / Legitimacy
    else if (query.indexOf('register') !== -1 || query.indexOf('legit') !== -1 || query.indexOf('official') !== -1 || query.indexOf('legal') !== -1 || query.indexOf('license') !== -1) {
      window.appendNoahMessage(
        "Yes, <strong>ArkWay Creative</strong> is a fully registered business entity operating in Kenya, working with global artists, filmmakers, and brands.<br/><br/>" +
        "👉 <a href='/services' style='color:#D4AF37; font-weight:bold;'>View Our Services & Packages →</a>"
      );
    }
    // 4. Founded / History / Est. 2026
    else if (query.indexOf('start') !== -1 || query.indexOf('found') !== -1 || query.indexOf('est') !== -1 || query.indexOf('begin') !== -1 || query.indexOf('history') !== -1 || query.indexOf('when') !== -1) {
      window.appendNoahMessage(
        "<strong>ArkWay Creative</strong> was established in <strong>2026</strong> as a modern, data-driven media company merging audio production, visual storytelling, brand architecture, and data analytics.<br/><br/>" +
        "👉 <a href='/services' style='color:#D4AF37; font-weight:bold;'>Explore Our Work & Services →</a>"
      );
    }
    // 5. Founder / Yovan
    else if (query.indexOf('owner') !== -1 || query.indexOf('founder') !== -1 || query.indexOf('who runs') !== -1 || query.indexOf('ceo') !== -1 || query.indexOf('yovan') !== -1) {
      window.appendNoahMessage(
        "ArkWay Creative was founded by <strong>Yovan</strong> — hip-hop artist, music producer, multi-instrumentalist, and film critic.<br/><br/>" +
        "👉 <a href='/community' style='color:#D4AF37; font-weight:bold;'>Explore Yovan's Catalog & Writing →</a>"
      );
    }
    // 6. What does ArkWay Creative do / About
    else if (query.indexOf('do') !== -1 || query.indexOf('about') !== -1 || query.indexOf('what is') !== -1 || query.indexOf('who') !== -1) {
      window.appendNoahMessage(
        "<strong>ArkWay Creative</strong> is a data-driven media company built across 4 core pillars:<br/>" +
        "• <strong>01 / Audio Production:</strong> Beats, recording, live tracking, mixing & mastering.<br/>" +
        "• <strong>02 / Film & Media Sound:</strong> Custom film scoring, jingles & podcast cleaning.<br/>" +
        "• <strong>03 / Brand Architecture:</strong> Creative direction, campaign design & media strategy.<br/>" +
        "• <strong>04 / Data & Analytics:</strong> Audience intelligence, market research & reporting.<br/><br/>" +
        "👉 <a href='/services' style='color:#D4AF37; font-weight:bold;'>Explore Services</a> | " +
        "<a href='/products' style='color:#D4AF37; font-weight:bold;'>Shop Sound Vault</a>"
      );
    } 
    // 7. Beats, Loops, Sound Vault (Dynamic Statement)
    else if (query.indexOf('beat') !== -1 || query.indexOf('pack') !== -1 || query.indexOf('loop') !== -1 || query.indexOf('sample') !== -1 || query.indexOf('kit') !== -1 || query.indexOf('product') !== -1 || query.indexOf('vault') !== -1) {
      window.appendNoahMessage(
        "Our <strong>Sound Vault</strong> features curated digital toolkits engineered for producers and filmmakers, with new signature drops released regularly:<br/>" +
        "• <strong>Live Acoustic Guitar Loops:</strong> Multi-volume 24-bit WAV loops & stems.<br/>" +
        "• <strong>Beat Packs:</strong> Boombap, Trap, R&B, Atmospheric & Soulful editions.<br/>" +
        "• <strong>Drum Vaults, FX & Foley:</strong> Sound design libraries.<br/><br/>" +
        "👉 <a href='/products' style='color:#D4AF37; font-weight:bold;'>Open Sound Vault / Browse Latest Drops →</a>"
      );
    } 
    // 8. Studio Rates / Mixing & Mastering
    else if (query.indexOf('mix') !== -1 || query.indexOf('master') !== -1 || query.indexOf('studio') !== -1 || query.indexOf('record') !== -1 || query.indexOf('vocal') !== -1 || query.indexOf('price') !== -1 || query.indexOf('rate') !== -1 || query.indexOf('cost') !== -1) {
      window.appendNoahMessage(
        "We offer transparent standard studio packages alongside custom quotes:<br/>" +
        "• <strong>Quick Vocal Session:</strong> KSh 3,000<br/>" +
        "• <strong>External Mix & Master:</strong> KSh 2,500<br/>" +
        "• <strong>Complete Single Package:</strong> KSh 5,500<br/>" +
        "• <strong>Full Custom Track Production:</strong> KSh 8,500<br/><br/>" +
        "👉 <a href='/services' style='color:#D4AF37; font-weight:bold;'>See Full Rate Sheet & Inquiry →</a>"
      );
    } 
    // 9. Film Scoring & Media Audio
    else if (query.indexOf('film') !== -1 || query.indexOf('score') !== -1 || query.indexOf('jingle') !== -1 || query.indexOf('movie') !== -1 || query.indexOf('video') !== -1) {
      window.appendNoahMessage(
        "We compose custom sound engineered directly to picture:<br/>" +
        "• <strong>Commercial Jingles & Ads:</strong> KSh 12,000<br/>" +
        "• <strong>Film & Series Scoring:</strong> From KSh 15,000<br/>" +
        "• <strong>Voiceover & Audio Cleaning:</strong> KSh 5,000<br/><br/>" +
        "👉 <a href='/services' style='color:#D4AF37; font-weight:bold;'>View Film Scoring Details →</a>"
      );
    } 
    // 10. Contact / Booking / Inquiry
    else if (query.indexOf('contact') !== -1 || query.indexOf('whatsapp') !== -1 || query.indexOf('call') !== -1 || query.indexOf('email') !== -1 || query.indexOf('phone') !== -1 || query.indexOf('number') !== -1 || query.indexOf('book') !== -1) {
      window.appendNoahMessage(
        "You can connect with the ArkWay team directly anytime:<br/>" +
        "• <strong>WhatsApp / Call:</strong> +254 118 618 199<br/>" +
        "• <strong>Email:</strong> arkwaycreative@gmail.com<br/><br/>" +
        "👉 <a href='https://wa.me/254118618199' target='_blank' style='color:#E2C66B; font-weight:bold;'>Open Direct WhatsApp Chat →</a>"
      );
    } 
    // 11. General fallback
    else {
      window.appendNoahMessage(
        "I'm Noah, ArkWay's AI guide! I can assist with:<br/>" +
        "1. 🎵 <strong>Audio Production:</strong> Beats, Recording, Mixing & Mastering<br/>" +
        "2. 📦 <strong>Products:</strong> Guitar Loops, Beat Packs & Sound Vault<br/>" +
        "3. 🎬 <strong>Film Sound:</strong> Scores, Jingles & Sound Design<br/>" +
        "4. 📊 <strong>Data & Analytics:</strong> Market Research & Stream Performance<br/><br/>" +
        "What area are you looking to explore today?"
      );
    }
  }, 400);
};

window.handleNoahKeyPress = function(event) {
  if (event.key === 'Enter') {
    window.sendNoahMessage();
  }
};

})();
