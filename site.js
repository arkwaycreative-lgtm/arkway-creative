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
  var win = document.getElementById('noah-chat-window');
  var openIcon = document.getElementById('noah-icon-open');
  var closeIcon = document.getElementById('noah-icon-close');
  if (!win) return;

  var isHidden = win.classList.contains('noah-hidden');
  if (isHidden) {
    win.classList.remove('noah-hidden');
    if (openIcon) openIcon.style.display = 'none';
    if (closeIcon) closeIcon.style.display = 'inline';
  } else {
    win.classList.add('noah-hidden');
    if (openIcon) openIcon.style.display = 'inline';
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
        "Got you covered! Explore our high-quality beat packs, acoustic guitar loops, or lock in studio mixing & mastering.<br/><br/>👉 <a href='/products' style='color:#D4AF37; font-weight:bold;'>Browse Beat Packs & Loops</a><br/>👉 <a href='/services' style='color:#D4AF37; font-weight:bold;'>View Studio Services</a>"
      );
    }, 400);
  } else if (key === 'brand') {
    window.appendNoahMessage("Brand Architecture & Positioning", true);
    setTimeout(function() {
      window.appendNoahMessage(
        "ArkWay helps startups and companies build undeniable identity. From story & positioning and social media campaigns to custom jingles.<br/><br/>👉 <a href='/services' style='color:#D4AF37; font-weight:bold;'>Explore Brand Services</a><br/>👉 <a href='https://wa.me/254118618199' target='_blank' style='color:#E2C66B; font-weight:bold;'>Talk to Founder (WhatsApp)</a>"
      );
    }, 400);
  } else if (key === 'film') {
    window.appendNoahMessage("Film Scoring & Audio Design", true);
    setTimeout(function() {
      window.appendNoahMessage(
        "Need original film scoring, atmospheric textures, or custom sound design for your movie or visual project?<br/><br/>👉 <a href='/services' style='color:#D4AF37; font-weight:bold;'>Film Scoring Services</a><br/>👉 <a href='mailto:arkwaycreative@gmail.com' style='color:#D4AF37; font-weight:bold;'>Request Project Quote</a>"
      );
    }, 400);
  } else if (key === 'fan') {
    window.appendNoahMessage("Yovan's Music & Catalog", true);
    setTimeout(function() {
      window.appendNoahMessage(
        "Explore Yovan's official music releases, discography, and film writing!<br/><br/>👉 <a href='/community' style='color:#D4AF37; font-weight:bold;'>Listen to Music Catalog</a><br/>👉 <a href='https://yovan.substack.com' target='_blank' style='color:#D4AF37; font-weight:bold;'>Read Substack Reviews</a>"
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
    if (query.indexOf('beat') !== -1 || query.indexOf('pack') !== -1 || query.indexOf('loop') !== -1 || query.indexOf('song') !== -1) {
      window.appendNoahMessage("Check out our full collection of production tools, beat packs, and guitar loops here:<br/><a href='/products' style='color:#D4AF37; font-weight:bold;'>Browse Product Catalog →</a>");
    } else if (query.indexOf('mix') !== -1 || query.indexOf('master') !== -1 || query.indexOf('studio') !== -1 || query.indexOf('record') !== -1) {
      window.appendNoahMessage("Need mixing, mastering, or custom production? Check rates and book here:<br/><a href='/services' style='color:#D4AF37; font-weight:bold;'>View Rates & Services →</a>");
    } else if (query.indexOf('brand') !== -1 || query.indexOf('logo') !== -1 || query.indexOf('jingle') !== -1 || query.indexOf('marketing') !== -1) {
      window.appendNoahMessage("We handle end-to-end brand architecture and sonic branding:<br/><a href='/services' style='color:#D4AF37; font-weight:bold;'>Brand Strategy Services →</a>");
    } else if (query.indexOf('film') !== -1 || query.indexOf('score') !== -1 || query.indexOf('sound') !== -1 || query.indexOf('director') !== -1) {
      window.appendNoahMessage("Looking for original film scoring or sound design?<br/><a href='/services' style='color:#D4AF37; font-weight:bold;'>Film Scoring & Sound Design →</a>");
    } else if (query.indexOf('yovan') !== -1 || query.indexOf('music') !== -1 || query.indexOf('album') !== -1 || query.indexOf('single') !== -1) {
      window.appendNoahMessage("Explore Yovan's official releases and writing:<br/><a href='/community' style='color:#D4AF37; font-weight:bold;'>Community & Catalog →</a>");
    } else {
      window.appendNoahMessage("Noah's on it! Feel free to click one of the quick options below, or contact us directly on WhatsApp for custom projects:<br/><a href='https://wa.me/254118618199' target='_blank' style='color:#E2C66B; font-weight:bold;'>Chat on WhatsApp →</a>");
    }
  }, 500);
};

window.handleNoahKeyPress = function(event) {
  if (event.key === 'Enter') {
    window.sendNoahMessage();
  }
};

})();
