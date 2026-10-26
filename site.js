(function () {
  var $ = function (s, r) {
    return Array.prototype.slice.call(
      (r || document).querySelectorAll(s)
    );
  };

  var nav = document.getElementById("navlinks");
  var mb = document.getElementById("menuBtn");

  if (mb && nav) {
    mb.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  // Update badge text dynamically if present on page load
  document.addEventListener("DOMContentLoaded", function () {
    var badge = document.getElementById("noah-badge");
    if (badge) {
      badge.innerHTML = "<span>Need guidance? Ask Noah</span>";
    }
  });

  // Product filters
  function applyFilter(f) {
    var shown = 0;

    $(".product-card").forEach(function (c) {
      var ok = f === "ALL PRODUCTS" || c.dataset.cat === f;
      c.hidden = !ok;
      if (ok) shown++;
    });

    $("[data-filter]").forEach(function (b) {
      b.classList.toggle("active", b.dataset.filter === f);
    });

    var e = document.getElementById("productEmpty");
    if (e) e.hidden = shown > 0;
  }

  $("[data-filter]").forEach(function (b) {
    b.addEventListener("click", function () {
      applyFilter(b.dataset.filter);

      history.replaceState(
        null,
        "",
        b.dataset.filter === "ALL PRODUCTS"
          ? location.pathname
          : "?filter=" + encodeURIComponent(b.dataset.filter)
      );
    });
  });

  var q = new URLSearchParams(location.search).get("filter");

  if (q && $("[data-filter]").length) {
    applyFilter(q);
  }

  // Demo play toggle
  $("[data-play]").forEach(function (b) {
    b.addEventListener("click", function () {
      var preview = b.closest(".product-preview");
      if (!preview) return;

      var w = preview.querySelector(".waveform");
      if (!w) return;

      w.classList.toggle("playing");

      b.textContent = w.classList.contains("playing")
        ? "Ⅱ Pause Demo"
        : "▶ Play Demo";
    });
  });

  // Share link
  $("[data-share]").forEach(function (b) {
    b.addEventListener("click", function () {
      var u =
        location.origin + "/products#product-" + b.dataset.share;

      var done = function () {
        b.textContent = "Link Copied";

        setTimeout(function () {
          b.textContent = "Share Link →";
        }, 1800);
      };

      if (navigator.clipboard) {
        navigator.clipboard.writeText(u).then(
          done,
          function () {
            window.prompt("Copy this ArkWay product link:", u);
          }
        );
      } else {
        window.prompt("Copy this ArkWay product link:", u);
      }
    });
  });

  // Discography toggle
  $("[data-mode]").forEach(function (b) {
    b.addEventListener("click", function () {
      $("[data-mode]").forEach(function (x) {
        x.classList.toggle("active", x === b);
      });

      var stream = document.getElementById("stream");
      var download = document.getElementById("download");

      if (stream) stream.hidden = b.dataset.mode !== "stream";
      if (download) download.hidden = b.dataset.mode !== "download";
    });
  });

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

  $(".book-service").forEach(function (b) {
    b.addEventListener("click", function () {
      document.body.classList.add("locked");

      var w = document.createElement("div");
      w.className = "modal-backdrop";

      var s = (b.dataset.service || "Service")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

      w.innerHTML =
        '<div class="modal" role="dialog" aria-modal="true">' +
          '<button class="modal-close" aria-label="Close">×</button>' +
          '<p class="eyebrow">INSTANT INQUIRY</p>' +
          '<h2>Book <em>' + s + "</em></h2>" +
          "<p>Choose how you want to start the conversation. Your service details will be pre-filled.</p>" +
          '<div class="modal-actions">' +
            '<a class="primary large" target="_blank" rel="noopener" href="' +
              (b.dataset.wa || "#") +
              '">Open WhatsApp →</a>' +
            '<a class="secondary large" href="' +
              (b.dataset.em || "mailto:arkwaycreative@gmail.com") +
              '">Send Email ✉</a>' +
          "</div>" +
          '<span class="modal-note">0118618199 · arkwaycreative@gmail.com</span>' +
        "</div>";

      document.body.appendChild(w);

      if (!modalActiveState) {
        modalActiveState = true;
        history.pushState({ bookingModalOpen: true }, "");
      }

      var close = function () {
        if (modalActiveState) {
          history.back();
        } else {
          closeBookingModal();
        }
      };

      w.addEventListener("mousedown", function (e) {
        if (e.target === w) close();
      });

      w.querySelector(".modal-close").addEventListener("click", close);

      document.addEventListener("keydown", function k(e) {
        if (e.key === "Escape") {
          close();
          document.removeEventListener("keydown", k);
        }
      });
    });
  });

  window.addEventListener("popstate", function () {
    if (modalActiveState) {
      closeBookingModal();
    }
  });

  /* ==========================================
     ARKWAY CREATIVE — NOAH CHATBOT
     Customer guidance and enquiry routing.
     Local JavaScript; no external API required.
     ========================================== */

  var noahState = {
    lastTopic: "",
    lastQuestion: "",
    greeted: false
  };

  var NOAH_LINK = "https://wa.me/254118618199";
  var NOAH_EMAIL = "mailto:arkwaycreative@gmail.com";

  /*
   * Phrase matching is case-insensitive because queries are
   * normalized before being passed to this function.
   *
   * Longer phrases use substring matching. Single words use
   * word boundaries to reduce accidental matches.
   */
  function noahHas(text, words) {
    return words.some(function (word) {
      var phrase = word.toLowerCase().trim();

      if (!phrase) return false;

      if (phrase.indexOf(" ") !== -1) {
        return text.indexOf(phrase) !== -1;
      }

      var escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      var pattern = new RegExp("(^|[^a-z0-9])" + escaped + "([^a-z0-9]|$)");

      return pattern.test(text);
    });
  }

  function noahLink(url, label, color) {
    return '<a href="' + url + '" style="color:' +
      (color || "#D4AF37") +
      ';font-weight:bold;">' + label + "</a>";
  }

  function noahContactLink() {
    return noahLink(
      NOAH_LINK,
      "Talk to ArkWay on WhatsApp →",
      "#E2C66B"
    );
  }

  function noahEmailLink() {
    return noahLink(NOAH_EMAIL, "Send ArkWay an email →");
  }

  function noahServicesLink() {
    return noahLink("/services", "Explore Services →");
  }

  function noahProductsLink() {
    return noahLink("/products", "Browse the Sound Vault →");
  }

  function noahCommunityLink() {
    return noahLink(
      "/community",
      "Explore Yovan's Music & Writing →"
    );
  }

  function noahAnswer(html, topic) {
    if (topic) noahState.lastTopic = topic;
    window.appendNoahMessage(html, false);
  }

  function noahSafeText(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /*
   * Open or close the chatbot.
   */
  window.toggleNoahChat = function () {
    var container = document.getElementById("noah-chatbot-container");
    var win = document.getElementById("noah-chat-window");
    var openIcon = document.getElementById("noah-icon-open");
    var closeIcon = document.getElementById("noah-icon-close");

    if (!win) return;

    var isHidden = win.classList.contains("noah-hidden");

    if (isHidden) {
      win.classList.remove("noah-hidden");

      if (container) container.classList.add("active");
      if (openIcon) openIcon.style.display = "none";
      if (closeIcon) closeIcon.style.display = "inline";

      if (!noahState.greeted) {
        noahState.greeted = true;
      }

      var input = document.getElementById("noah-input");
      if (input) {
        setTimeout(function () {
          input.focus();
        }, 100);
      }
    } else {
      win.classList.add("noah-hidden");

      if (container) container.classList.remove("active");
      if (openIcon) openIcon.style.display = "block";
      if (closeIcon) closeIcon.style.display = "none";
    }
  };

  /*
   * Messages typed by visitors are always inserted as plain text.
   * Only trusted chatbot response HTML is rendered as markup.
   */
  window.appendNoahMessage = function (text, isUser) {
    var container = document.getElementById("noah-messages");
    if (!container) return;

    var msgDiv = document.createElement("div");

    msgDiv.className = "noah-msg " +
      (isUser ? "noah-msg-user" : "noah-msg-bot");

    if (isUser) {
      msgDiv.textContent = text;
    } else {
      msgDiv.innerHTML = text;
    }

    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
  };

  /*
   * Welcome options.
   */
  window.handleNoahOption = function (key) {
    var options = {
      audio: {
        label: "Beats & Studio Services",
        topic: "audio",
        answer:
          "Got you. ArkWay offers recording, mixing, mastering, custom music production, guitar sessions and bass tracking. If you're not sure which service you need, tell us what you're trying to make and we'll point you in the right direction.<br/><br/>" +
          noahServicesLink() + "<br/>" +
          noahContactLink()
      },

      brand: {
        label: "Brand & Business Services",
        topic: "brand",
        answer:
          "ArkWay helps artists, startups and businesses clarify their identity, creative direction and media strategy. Market research and analytics support is also available. These projects are scoped to your needs.<br/><br/>" +
          noahServicesLink() + "<br/>" +
          noahContactLink()
      },

      film: {
        label: "Film Scoring & Audio",
        topic: "film",
        answer:
          "Need original music or audio for a film, series, advert or spoken-word project? ArkWay offers film scoring, jingles and voiceover or podcast audio cleaning.<br/><br/>" +
          noahFilm() + "<br/>" +
          noahContactLink()
      },

      products: {
        label: "Products & Downloads",
        topic: "products",
        answer:
          "Looking for beats or guitar loops? Browse the Sound Vault to see the available products, previews, prices and purchase options.<br/><br/>" +
          noahProductsLink()
      },

      fan: {
        label: "Yovan's Music & Catalog",
        topic: "artist",
        answer:
          "Yovan is ArkWay's founder and an independent artist and producer. Explore his music and creative writing through the community page.<br/><br/>" +
          noahCommunityLink() + "<br/>" +
          noahLink(
            "https://substack.com/@betweenframesbyovan",
            "Read Between Frames →"
          )
      },

      contact: {
        label: "Contact ArkWay",
        topic: "contact",
        answer: noahContact()
      }
    };

    var item = options[key];
    if (!item) return;

    window.appendNoahMessage(item.label, true);

    setTimeout(function () {
      noahAnswer(item.answer, item.topic);
    }, 200);
  };

  function noahAbout() {
    return "<strong>ArkWay Creative</strong> is a data-driven media company combining audio production, visual storytelling, brand architecture and analytics.<br/><br/>" +
      "We can help with:<br/>" +
      "• Audio production and studio services<br/>" +
      "• Beats, loops and digital sound products<br/>" +
      "• Film scoring and media audio<br/>" +
      "• Brand architecture and creative strategy<br/>" +
      "• Market research and analytics<br/><br/>" +
      "If you're unsure which service fits your project, tell us what you want to achieve and we can help you identify the next step.<br/><br/>" +
      noahServicesLink() + "<br/>" +
      noahProductsLink() + "<br/>" +
      noahContactLink();
  }

  function noahPrices() {
    return "<strong>ArkWay service rates</strong><br/>" +
      "• Quick Vocal Session — KSh 3,000<br/>" +
      "• External Vocal Mix & Master — KSh 2,500<br/>" +
      "• Complete Single Package — KSh 5,500<br/>" +
      "• Full Custom Beat & Song Production — KSh 8,500<br/>" +
      "• Acoustic/Lead Guitar Session — KSh 2,500<br/>" +
      "• Live Bass Tracking — KSh 2,500<br/>" +
      "• Full Instrumentation Package — KSh 12,000<br/>" +
      "• Radio/Social Ads & Jingles — KSh 12,000<br/>" +
      "• Film/Series Scoring — from KSh 15,000<br/>" +
      "• Voiceover/Podcast Audio Cleaning — KSh 5,000<br/><br/>" +
      "Brand architecture and analytics projects are quoted according to scope. Prices and availability should be confirmed with the team before booking.<br/><br/>" +
      noahServicesLink() + "<br/>" +
      noahContactLink();
  }

  function noahAudio() {
    return "<strong>Audio production at ArkWay</strong><br/>" +
      "We can help with recording, custom production, mixing and mastering, guitar sessions, bass tracking and full instrumentation.<br/><br/>" +
      "• Quick Vocal Session — KSh 3,000<br/>" +
      "• External Vocal Mix & Master — KSh 2,500<br/>" +
      "• Complete Single Package — KSh 5,500<br/>" +
      "• Full Custom Beat & Song Production — KSh 8,500<br/>" +
      "• Acoustic/Lead Guitar Session — KSh 2,500<br/>" +
      "• Live Bass Tracking — KSh 2,500<br/>" +
      "• Full Instrumentation Package — KSh 12,000<br/><br/>" +
      "<strong>Not sure what you need?</strong> Tell us whether you're recording vocals, finishing a song, looking for a beat or adding instruments to an existing track.<br/><br/>" +
      noahServicesLink() + "<br/>" +
      noahContactLink();
  }

  function noahProducts() {
    return "<strong>The ArkWay Sound Vault</strong><br/>" +
      "Browse the current digital products, which may include:<br/>" +
      "• Acoustic guitar loop packs<br/>" +
      "• Boom-bap and boom-trap beat packs<br/>" +
      "• Atmospheric trap beats<br/>" +
      "• Chilled/R&B trap beats<br/>" +
      "• Hard trap beats<br/><br/>" +
      "Open the store to check each item's current price, preview and purchase options. Product availability and usage rights can vary by listing.<br/><br/>" +
      noahProductsLink() + "<br/>" +
      "Need help choosing? " +
      noahContactLink();
  }

  function noahFilm() {
    return "<strong>Film & media audio</strong><br/>" +
      "ArkWay creates original music and audio for visual projects, advertisements and spoken-word content.<br/><br/>" +
      "• Radio/Social Ads & Jingles — KSh 12,000<br/>" +
      "• Film/Series Scoring — from KSh 15,000<br/>" +
      "• Voiceover/Podcast Audio Cleaning — KSh 5,000<br/><br/>" +
      "Final quotes may depend on project length, deliverables, revisions and deadlines.<br/><br/>" +
      noahServicesLink() + "<br/>" +
      noahEmailLink() + "<br/>" +
      noahContactLink();
  }

  function noahBrand() {
    return "<strong>Brand Architecture & Strategy</strong><br/>" +
      "ArkWay helps shape brand identity, positioning, creative direction and media strategy. The aim is to help a business or creative project communicate more clearly and consistently.<br/><br/>" +
      "Brand and analytics projects are quoted individually because the right scope depends on your needs.<br/><br/>" +
      "To get started, tell us what your business does, what you want to improve and what kind of help you're looking for.<br/><br/>" +
      noahServicesLink() + "<br/>" +
      noahContactLink();
  }

  function noahData() {
    return "<strong>Data & Analytics</strong><br/>" +
      "ArkWay can support evidence-led decisions through market research, audience and performance analysis, dashboards and reporting.<br/><br/>" +
      "Project scope and pricing depend on the data available, the questions you need answered and the deliverables required.<br/><br/>" +
      "Tell us what decision you're trying to make or what information you need to understand.<br/><br/>" +
      noahServicesLink() + "<br/>" +
      noahContactLink();
  }

  function noahArtist() {
    return "<strong>Yovan</strong> is ArkWay Creative's founder, an independent hip-hop artist, producer and multi-instrumentalist. Explore his music and creative writing through the community section.<br/><br/>" +
      noahCommunityLink() + "<br/>" +
      noahLink(
        "https://substack.com/@betweenframesbyovan",
        "Read Between Frames →"
      );
  }

  function noahContact() {
    return "<strong>Let's talk about your project.</strong><br/><br/>" +
      "Choose whichever contact method is easiest for you:<br/><br/>" +
      "• <strong>WhatsApp / Call:</strong> +254 118 618 199<br/>" +
      "• <strong>Email:</strong> arkwaycreative@gmail.com<br/><br/>" +
      "When you message us, include what you need, your deadline and any budget you have in mind. If you're not sure about the service name, just explain what you're trying to achieve.<br/><br/>" +
      noahContactLink() + "<br/>" +
      noahEmailLink();
  }

  function noahLocation() {
    return "ArkWay Creative is based in Kenya. In-person recording sessions may be available in the Kitale region, while suitable digital production and creative projects can be handled remotely.<br/><br/>" +
      "Contact the team to confirm the current session location, availability and arrangements before travelling.<br/><br/>" +
      noahContactLink();
  }

  function noahRegistration() {
    return "ArkWay Creative is a registered business in Kenya. For specific business, partnership or service questions, contact the team directly for further details.<br/><br/>" +
      noahContactLink();
  }

  function noahBudget() {
    return "<strong>Let's work with your budget.</strong><br/><br/>" +
      "The best option depends on what you need done. For example, mixing an existing vocal recording is different from producing a complete song from scratch.<br/><br/>" +
      "Tell ArkWay three things:<br/>" +
      "• What you want to create<br/>" +
      "• What you already have (for example, a beat or recorded vocals)<br/>" +
      "• Your approximate budget<br/><br/>" +
      "The team can then help you understand the most suitable available option. A lower budget does not guarantee that every service can be provided at that price.<br/><br/>" +
      noahContactLink();
  }

  function noahBooking() {
    return "<strong>Ready to get started?</strong><br/><br/>" +
      "The simplest next step is to message ArkWay directly. You don't need to know all the technical terms first.<br/><br/>" +
      "Tell us what you want to make, what you already have, and when you need it. We'll help clarify the service and confirm the next step.<br/><br/>" +
      noahContactLink() + "<br/>" +
      noahEmailLink();
  }

  function noahPurchase() {
    return "<strong>Buying a product?</strong><br/><br/>" +
      "Open the Sound Vault, choose the product you want and check