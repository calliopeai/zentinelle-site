/* site.js -- vanilla JS interactivity for zentinelle.ai
   Replaces the React components from the Next.js source.
   No build step required. */

(function () {
  "use strict";

  /* ================================================================
     A) ParticleField  -- canvas "Z" animation
     ================================================================ */
  function initParticleField() {
    var canvas = document.querySelector('canvas[aria-hidden="true"]');
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    var W = 560;
    var H = 540;
    canvas.width = W;
    canvas.height = H;

    /* --- constants --- */
    var COUNT = 85;
    var CONNECT_DIST = 140;
    var TR = 55, TG = 239, TB = 237;
    var ANCHOR_N = 13;

    /* --- Z anchors --- */
    function buildZAnchors(n) {
      var pts = [];
      var margin = 120;
      var top = 120;
      var bot = H - 120;
      var left = margin;
      var right = W - margin;
      var i;

      /* top horizontal */
      for (i = 0; i < n; i++) {
        pts.push({ x: left + (right - left) * (i / (n - 1)), y: top });
      }
      /* diagonal */
      for (i = 0; i < n; i++) {
        pts.push({
          x: right - (right - left) * (i / (n - 1)),
          y: top + (bot - top) * (i / (n - 1)),
        });
      }
      /* bottom horizontal */
      for (i = 0; i < n; i++) {
        pts.push({ x: left + (right - left) * (i / (n - 1)), y: bot });
      }
      return pts;
    }

    var anchors = buildZAnchors(ANCHOR_N);

    /* --- particles --- */
    function makeParticle(isZ, anchorIdx) {
      var ax = isZ ? anchors[anchorIdx].x : 0;
      var ay = isZ ? anchors[anchorIdx].y : 0;
      return {
        x: isZ ? ax + (Math.random() - 0.5) * 60 : Math.random() * W,
        y: isZ ? ay + (Math.random() - 0.5) * 60 : Math.random() * H,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: isZ ? 2.2 + Math.random() * 1.2 : 1.2 + Math.random() * 1.0,
        alpha: 0.25 + Math.random() * 0.5,
        alphaDir: (Math.random() < 0.5 ? 1 : -1) * (0.003 + Math.random() * 0.004),
        isZ: isZ,
        anchorIdx: isZ ? anchorIdx : -1,
        ax: ax,
        ay: ay,
        isNode: !isZ && Math.random() < 0.18,
      };
    }

    var particles = [];
    var bgCount = COUNT;
    var i;
    for (i = 0; i < bgCount; i++) {
      particles.push(makeParticle(false, -1));
    }
    for (i = 0; i < anchors.length; i++) {
      particles.push(makeParticle(true, i));
    }

    /* --- sparks --- */
    var sparks = [];
    var MAX_SPARKS = 12;

    function spawnSpark() {
      if (sparks.length >= MAX_SPARKS) return;
      /* pick two connected Z particles */
      var zParts = particles.filter(function (p) { return p.isZ; });
      if (zParts.length < 2) return;
      var a = zParts[Math.floor(Math.random() * zParts.length)];
      var b;
      var tries = 0;
      do {
        b = zParts[Math.floor(Math.random() * zParts.length)];
        tries++;
      } while (b === a && tries < 10);
      if (b === a) return;
      var dx = b.x - a.x;
      var dy = b.y - a.y;
      if (Math.sqrt(dx * dx + dy * dy) > CONNECT_DIST * 1.2) return;
      sparks.push({ from: a, to: b, t: 0, speed: 0.012 + Math.random() * 0.018 });
    }

    /* --- mouse --- */
    var mouse = { x: -1000, y: -1000, inside: false, firstHover: true };
    var burst = null;

    canvas.addEventListener("mouseenter", function () {
      mouse.inside = true;
      if (mouse.firstHover) {
        mouse.firstHover = false;
        burst = { x: mouse.x, y: mouse.y, t: 0 };
      }
    });
    canvas.addEventListener("mouseleave", function () {
      mouse.inside = false;
    });
    canvas.addEventListener("mousemove", function (e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * W;
      mouse.y = ((e.clientY - rect.top) / rect.height) * H;
      if (!mouse.inside) {
        mouse.inside = true;
        if (mouse.firstHover) {
          mouse.firstHover = false;
          burst = { x: mouse.x, y: mouse.y, t: 0 };
        }
      }
    });

    /* --- animation loop --- */
    var sparkTimer = 0;

    function tick() {
      ctx.clearRect(0, 0, W, H);

      /* update particles */
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        /* flicker alpha */
        p.alpha += p.alphaDir;
        if (p.alpha > 0.8 || p.alpha < 0.15) p.alphaDir *= -1;
        p.alpha = Math.max(0.1, Math.min(0.85, p.alpha));

        if (p.isZ) {
          /* attract to anchor */
          var dx = p.ax - p.x;
          var dy = p.ay - p.y;
          p.vx += dx * 0.008;
          p.vy += dy * 0.008;

          /* mouse repulsion */
          if (mouse.inside) {
            var mdx = p.x - mouse.x;
            var mdy = p.y - mouse.y;
            var md = Math.sqrt(mdx * mdx + mdy * mdy);
            if (md < 100 && md > 0) {
              var force = (100 - md) / 100 * 3;
              p.vx += (mdx / md) * force;
              p.vy += (mdy / md) * force;
            }
          }

          p.vx *= 0.92;
          p.vy *= 0.92;
        } else {
          /* background drift */
          p.vx *= 0.99;
          p.vy *= 0.99;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
        }

        p.x += p.vx;
        p.y += p.vy;

        /* wrap bg particles */
        if (!p.isZ) {
          if (p.x < -10) p.x = W + 10;
          if (p.x > W + 10) p.x = -10;
          if (p.y < -10) p.y = H + 10;
          if (p.y > H + 10) p.y = -10;
        }
      }

      /* burst effect */
      if (burst) {
        burst.t += 0.03;
        if (burst.t < 1) {
          var burstR = burst.t * 120;
          ctx.beginPath();
          ctx.arc(burst.x, burst.y, burstR, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(" + TR + "," + TG + "," + TB + "," + (0.4 * (1 - burst.t)) + ")";
          ctx.lineWidth = 2 * (1 - burst.t);
          ctx.stroke();
          /* push nearby particles */
          for (i = 0; i < particles.length; i++) {
            var pp = particles[i];
            var bx = pp.x - burst.x;
            var by = pp.y - burst.y;
            var bd = Math.sqrt(bx * bx + by * by);
            if (bd < burstR + 20 && bd > burstR - 20 && bd > 0) {
              pp.vx += (bx / bd) * 2.5 * (1 - burst.t);
              pp.vy += (by / bd) * 2.5 * (1 - burst.t);
            }
          }
        } else {
          burst = null;
        }
      }

      /* draw connections */
      for (i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var a = particles[i];
          var b = particles[j];
          /* only connect: Z-Z, Z-bg(node), or bg(node)-bg(node) */
          if (!a.isZ && !a.isNode && !b.isZ && !b.isNode) continue;
          var cdx = a.x - b.x;
          var cdy = a.y - b.y;
          var cd = Math.sqrt(cdx * cdx + cdy * cdy);
          if (cd < CONNECT_DIST) {
            var lineAlpha = (1 - cd / CONNECT_DIST) * 0.3;
            if (a.isZ && b.isZ) lineAlpha *= 1.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = "rgba(" + TR + "," + TG + "," + TB + "," + lineAlpha + ")";
            ctx.lineWidth = a.isZ && b.isZ ? 1.0 : 0.5;
            ctx.stroke();
          }
        }
      }

      /* draw sparks */
      sparkTimer++;
      if (sparkTimer % 20 === 0) spawnSpark();
      for (i = sparks.length - 1; i >= 0; i--) {
        var s = sparks[i];
        s.t += s.speed;
        if (s.t >= 1) { sparks.splice(i, 1); continue; }
        var sx = s.from.x + (s.to.x - s.from.x) * s.t;
        var sy = s.from.y + (s.to.y - s.from.y) * s.t;
        var sa = Math.sin(s.t * Math.PI);
        ctx.beginPath();
        ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255," + (sa * 0.9) + ")";
        ctx.fill();
        /* glow */
        ctx.beginPath();
        ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + TR + "," + TG + "," + TB + "," + (sa * 0.25) + ")";
        ctx.fill();
      }

      /* draw particles */
      for (i = 0; i < particles.length; i++) {
        var p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        if (p.isZ) {
          ctx.fillStyle = "rgba(" + TR + "," + TG + "," + TB + "," + p.alpha + ")";
        } else if (p.isNode) {
          ctx.fillStyle = "rgba(" + TR + "," + TG + "," + TB + "," + (p.alpha * 0.6) + ")";
        } else {
          ctx.fillStyle = "rgba(255,255,255," + (p.alpha * 0.4) + ")";
        }
        ctx.fill();

        /* glow on Z particles */
        if (p.isZ) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(" + TR + "," + TG + "," + TB + "," + (p.alpha * 0.1) + ")";
          ctx.fill();
        }
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /* ================================================================
     B) CustomCursor -- dot + ring
     ================================================================ */
  function initCustomCursor() {
    /* skip on touch devices */
    if ("ontouchstart" in window) return;

    var dot = document.createElement("div");
    dot.style.cssText =
      "position:fixed;top:0;left:0;width:8px;height:8px;border-radius:50%;" +
      "background:#37efed;pointer-events:none;z-index:9999;transition:width 0.2s,height 0.2s," +
      "opacity 0.2s,background 0.2s;transform:translate(-50%,-50%);will-change:transform;";
    document.body.appendChild(dot);

    var ring = document.createElement("div");
    ring.style.cssText =
      "position:fixed;top:0;left:0;width:32px;height:32px;border-radius:50%;" +
      "border:1.5px solid #37efed;pointer-events:none;z-index:9998;opacity:0.5;" +
      "transition:width 0.25s,height 0.25s,border 0.25s,opacity 0.3s;transform:translate(-50%,-50%);" +
      "will-change:transform;";
    document.body.appendChild(ring);

    var mx = -100, my = -100;
    var rx = -100, ry = -100;
    var LERP = 0.12;
    var visible = false;

    document.addEventListener("mousemove", function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "0.5";
      }
    });

    document.addEventListener("mouseleave", function () {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    });

    document.addEventListener("mouseenter", function () {
      visible = true;
      dot.style.opacity = "1";
      ring.style.opacity = "0.5";
    });

    /* hover detection */
    var hoverTargets = "a, button, [role='button']";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(hoverTargets)) {
        dot.style.width = "36px";
        dot.style.height = "36px";
        dot.style.opacity = "0.15";
        ring.style.width = "42px";
        ring.style.height = "42px";
        ring.style.borderWidth = "2px";
      }
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(hoverTargets)) {
        dot.style.width = "8px";
        dot.style.height = "8px";
        dot.style.opacity = "1";
        ring.style.width = "32px";
        ring.style.height = "32px";
        ring.style.borderWidth = "1.5px";
      }
    });

    function animate() {
      rx += (mx - rx) * LERP;
      ry += (my - ry) * LERP;
      dot.style.transform = "translate(-50%,-50%) translate(" + mx + "px," + my + "px)";
      dot.style.top = "0";
      dot.style.left = "0";
      ring.style.transform = "translate(-50%,-50%) translate(" + rx + "px," + ry + "px)";
      ring.style.top = "0";
      ring.style.left = "0";
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  /* ================================================================
     C) SideTab -- "Contact us" fixed tab
     ================================================================ */
  function initSideTab() {
    var tab = document.createElement("a");
    tab.href = "#contact";
    tab.id = "side-tab";
    tab.className =
      "fixed right-0 top-1/2 z-[100] flex items-center gap-[8px] px-[14px] py-[10px] " +
      "rounded-l-[10px] bg-[#37efed] hover:bg-[#2dd9d7] transition-colors duration-200";
    tab.style.transform = "translateY(-50%)";

    var span = document.createElement("span");
    span.className =
      "text-[#0b0b19] text-[12px] leading-normal uppercase tracking-widest whitespace-nowrap";
    span.style.cssText =
      "font-family:var(--font-sora),sans-serif;font-weight:400;writing-mode:vertical-rl;" +
      "transform:rotate(180deg)";
    span.textContent = "Contact us";

    tab.appendChild(span);
    document.body.appendChild(tab);

    tab.addEventListener("click", function (e) {
      var target = document.getElementById("contact");
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  /* ================================================================
     D) ContactModal -- auto-show after 10s
     ================================================================ */
  function initContactModal() {
    var STORAGE_KEY = "zentinelle_modal_v2";
    if (localStorage.getItem(STORAGE_KEY)) return;

    /* -- build DOM -- */
    var backdrop = document.createElement("div");
    backdrop.style.cssText =
      "position:fixed;inset:0;z-index:200;display:flex;align-items:flex-end;justify-content:flex-end;" +
      "padding:16px;background:rgba(0,0,0,0.5);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);" +
      "opacity:0;pointer-events:none;transition:opacity 0.3s ease;";

    var card = document.createElement("div");
    card.style.cssText =
      "background:#13131f;border-radius:16px;padding:32px;max-width:440px;width:100%;" +
      "position:relative;transform:translateY(20px);transition:transform 0.3s ease;color:#fff;" +
      "font-family:var(--font-sora),sans-serif;";

    /* close button */
    var closeBtn = document.createElement("button");
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.style.cssText =
      "position:absolute;top:16px;right:16px;background:none;border:none;color:#fff;" +
      "opacity:0.5;cursor:pointer;font-size:20px;line-height:1;padding:4px;";
    closeBtn.innerHTML = "&#10005;";
    card.appendChild(closeBtn);

    /* badge */
    var badge = document.createElement("div");
    badge.style.cssText =
      "display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:200px;" +
      "background:rgba(55,239,237,0.12);margin-bottom:16px;";
    badge.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#37efed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
      '<span style="color:#37efed;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Let\'s talk</span>';
    card.appendChild(badge);

    /* headline */
    var h = document.createElement("p");
    h.textContent = "Have questions?";
    h.style.cssText =
      "font-family:var(--font-boldonse),sans-serif;font-size:28px;line-height:1.3;" +
      "margin:0 0 8px;font-weight:400;";
    card.appendChild(h);

    /* subtitle */
    var sub = document.createElement("p");
    sub.textContent = "Get in touch \u2014 we reply fast.";
    sub.style.cssText =
      "font-size:14px;color:rgba(255,255,255,0.55);margin:0 0 24px;font-weight:400;";
    card.appendChild(sub);

    /* form */
    var form = document.createElement("form");
    form.style.cssText = "display:flex;flex-direction:column;gap:14px;";

    /* name + email row */
    var row = document.createElement("div");
    row.style.cssText = "display:flex;gap:12px;";

    function makeInput(type, placeholder, name) {
      var inp = document.createElement("input");
      inp.type = type;
      inp.name = name;
      inp.placeholder = placeholder;
      inp.required = true;
      inp.style.cssText =
        "flex:1;padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);" +
        "background:rgba(255,255,255,0.05);color:#fff;font-size:14px;outline:none;" +
        "font-family:var(--font-sora),sans-serif;transition:border-color 0.2s;";
      inp.addEventListener("focus", function () { inp.style.borderColor = "rgba(55,239,237,0.5)"; });
      inp.addEventListener("blur", function () { inp.style.borderColor = "rgba(255,255,255,0.12)"; });
      return inp;
    }

    var nameInput = makeInput("text", "Name", "name");
    var emailInput = makeInput("email", "Email", "email");
    row.appendChild(nameInput);
    row.appendChild(emailInput);
    form.appendChild(row);

    var textarea = document.createElement("textarea");
    textarea.placeholder = "Message";
    textarea.name = "message";
    textarea.rows = 4;
    textarea.required = true;
    textarea.style.cssText =
      "padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);" +
      "background:rgba(255,255,255,0.05);color:#fff;font-size:14px;outline:none;resize:none;" +
      "font-family:var(--font-sora),sans-serif;transition:border-color 0.2s;";
    textarea.addEventListener("focus", function () { textarea.style.borderColor = "rgba(55,239,237,0.5)"; });
    textarea.addEventListener("blur", function () { textarea.style.borderColor = "rgba(255,255,255,0.12)"; });
    form.appendChild(textarea);

    var sendBtn = document.createElement("button");
    sendBtn.type = "submit";
    sendBtn.textContent = "Send";
    sendBtn.style.cssText =
      "align-self:flex-start;padding:10px 24px;border-radius:10px;border:none;" +
      "background:#37efed;color:#0b0b19;font-size:14px;font-weight:600;cursor:pointer;" +
      "font-family:var(--font-sora),sans-serif;transition:background 0.2s;";
    sendBtn.addEventListener("mouseenter", function () { sendBtn.style.background = "#2dd9d7"; });
    sendBtn.addEventListener("mouseleave", function () { sendBtn.style.background = "#37efed"; });
    form.appendChild(sendBtn);

    card.appendChild(form);

    /* email link */
    var emailLink = document.createElement("p");
    emailLink.style.cssText = "margin:16px 0 0;font-size:13px;color:rgba(255,255,255,0.4);";
    emailLink.innerHTML =
      'Or email us at <a href="mailto:hello@zentinelle.com" style="color:#37efed;text-decoration:underline;">hello@zentinelle.com</a>';
    card.appendChild(emailLink);

    /* sent confirmation (hidden) */
    var sentDiv = document.createElement("div");
    sentDiv.style.cssText =
      "display:none;flex-direction:column;align-items:center;gap:16px;padding:24px 0;text-align:center;";
    sentDiv.innerHTML =
      '<svg width="48" height="48" viewBox="0 0 48 48" fill="none">' +
      '<circle cx="24" cy="24" r="23" stroke="#37efed" stroke-width="2"/>' +
      '<path d="M14 24l7 7 13-13" stroke="#37efed" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<p style="font-family:var(--font-boldonse),sans-serif;font-size:22px;margin:0;font-weight:400;">Message sent!</p>' +
      '<p style="font-size:14px;color:rgba(255,255,255,0.55);margin:0;">We\'ll get back to you shortly.</p>';
    card.appendChild(sentDiv);

    backdrop.appendChild(card);
    document.body.appendChild(backdrop);

    /* -- behavior -- */
    function showModal() {
      backdrop.style.opacity = "1";
      backdrop.style.pointerEvents = "auto";
      card.style.transform = "translateY(0)";
    }

    function hideModal() {
      backdrop.style.opacity = "0";
      backdrop.style.pointerEvents = "none";
      card.style.transform = "translateY(20px)";
      localStorage.setItem(STORAGE_KEY, "1");
    }

    closeBtn.addEventListener("click", hideModal);
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) hideModal();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      sendBtn.disabled = true;
      sendBtn.textContent = "Sending...";
      setTimeout(function () {
        form.style.display = "none";
        sub.style.display = "none";
        emailLink.style.display = "none";
        sentDiv.style.display = "flex";
        setTimeout(hideModal, 3000);
      }, 900);
    });

    /* auto-show after 10 seconds */
    setTimeout(showModal, 10000);
  }

  /* ================================================================
     E) Navbar interactivity
     ================================================================ */
  function initNavbar() {
    /* --- mobile menu toggle --- */
    var burger = document.querySelector('header button[aria-label="Toggle menu"]');
    var drawer = document.querySelector("div.fixed.inset-0.z-40");
    if (!burger || !drawer) return;

    var drawerBackdrop = drawer.children[0]; /* first child: backdrop overlay */
    var drawerPanel = drawer.children[1]; /* second child: nav panel */
    var lines = burger.querySelectorAll("span");
    var menuOpen = false;

    function openMenu() {
      menuOpen = true;
      drawer.classList.remove("pointer-events-none");
      drawer.classList.add("pointer-events-auto");
      drawerBackdrop.classList.remove("opacity-0");
      drawerBackdrop.classList.add("opacity-100");
      drawerPanel.classList.remove("translate-x-full");
      drawerPanel.classList.add("translate-x-0");
      /* animate burger to X */
      if (lines.length >= 3) {
        lines[0].style.transform = "translateY(3.25px) rotate(45deg)";
        lines[1].style.opacity = "0";
        lines[2].style.transform = "translateY(-3.25px) rotate(-45deg)";
      }
    }

    function closeMenu() {
      menuOpen = false;
      drawer.classList.add("pointer-events-none");
      drawer.classList.remove("pointer-events-auto");
      drawerBackdrop.classList.add("opacity-0");
      drawerBackdrop.classList.remove("opacity-100");
      drawerPanel.classList.add("translate-x-full");
      drawerPanel.classList.remove("translate-x-0");
      if (lines.length >= 3) {
        lines[0].style.transform = "";
        lines[1].style.opacity = "";
        lines[2].style.transform = "";
      }
    }

    burger.addEventListener("click", function () {
      if (menuOpen) closeMenu(); else openMenu();
    });

    /* close on backdrop click */
    drawerBackdrop.addEventListener("click", closeMenu);

    /* close when clicking a link inside the drawer */
    drawerPanel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeMenu();
      });
    });

    /* --- smooth scroll for hash links (homepage only) --- */
    var isHomepage = window.location.pathname === "/" || window.location.pathname === "/index.html";

    if (isHomepage) {
      document.querySelectorAll('a[href^="/#"]').forEach(function (link) {
        link.addEventListener("click", function (e) {
          var hash = link.getAttribute("href").replace(/^\/?/, "");
          var target = document.querySelector(hash);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth" });
            history.replaceState(null, "", hash);
          }
        });
      });
    }

    /* --- active section tracking (homepage only) --- */
    if (isHomepage) {
      var sectionIds = ["how-it-works", "governance", "quick-start"];
      var navLinks = document.querySelectorAll("header nav a");

      /* map from section ID -> matching nav links (href contains the hash) */
      var sectionLinkMap = {};
      sectionIds.forEach(function (id) {
        sectionLinkMap[id] = [];
        navLinks.forEach(function (link) {
          if (link.getAttribute("href") === "/#" + id) {
            sectionLinkMap[id].push(link);
          }
        });
      });

      /* dot image src from the Start link */
      var dotSrc = "";
      var startLink = document.querySelector('header nav a[href="/"]');
      if (startLink) {
        var dotImg = startLink.querySelector("img");
        if (dotImg) dotSrc = dotImg.getAttribute("src");
      }

      function updateActiveSection() {
        var current = null;
        var scrollY = window.scrollY;
        var windowH = window.innerHeight;

        for (var i = 0; i < sectionIds.length; i++) {
          var el = document.getElementById(sectionIds[i]);
          if (!el) continue;
          var rect = el.getBoundingClientRect();
          /* section is "in view" when its top is in the upper 60% of viewport */
          if (rect.top < windowH * 0.6 && rect.bottom > 0) {
            current = sectionIds[i];
          }
        }

        /* update link styles */
        sectionIds.forEach(function (id) {
          var links = sectionLinkMap[id];
          if (!links) return;
          links.forEach(function (link) {
            var span = link.querySelector("span");
            var existingDot = link.querySelector("img.active-dot");
            if (id === current) {
              if (span) span.style.fontWeight = "700";
              link.style.background = "rgba(255,255,255,0.05)";
              /* add dot if not present */
              if (!existingDot && dotSrc) {
                var img = document.createElement("img");
                img.src = dotSrc;
                img.alt = "";
                img.width = 8;
                img.height = 8;
                img.className = "shrink-0 active-dot";
                img.style.color = "transparent";
                link.insertBefore(img, link.firstChild);
              }
            } else {
              if (span) span.style.fontWeight = "400";
              link.style.background = "";
              if (existingDot) existingDot.remove();
            }
          });
        });
      }

      var scrollTick = false;
      window.addEventListener("scroll", function () {
        if (!scrollTick) {
          scrollTick = true;
          requestAnimationFrame(function () {
            updateActiveSection();
            scrollTick = false;
          });
        }
      });
      /* initial check */
      updateActiveSection();
    }
  }

  /* ================================================================
     F) Back to top button
     ================================================================ */
  function initBackToTop() {
    var btn = document.querySelector('button[aria-label="Back to top"]');
    if (!btn) return;

    function updateVisibility() {
      if (window.scrollY > 400) {
        btn.style.opacity = "1";
        btn.style.pointerEvents = "auto";
        btn.style.transform = "translateY(0)";
      } else {
        btn.style.opacity = "0";
        btn.style.pointerEvents = "none";
        btn.style.transform = "translateY(12px)";
      }
    }

    var scrollTick = false;
    window.addEventListener("scroll", function () {
      if (!scrollTick) {
        scrollTick = true;
        requestAnimationFrame(function () {
          updateVisibility();
          scrollTick = false;
        });
      }
    });

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    /* initial state */
    updateVisibility();
  }

  /* ================================================================
     G) CardStack  -- scroll-driven section reveal/fade
     ================================================================ */
  function initCardStack() {
    var sections = document.querySelectorAll("[data-card]");
    if (!sections.length) return;

    function update() {
      var vh = window.innerHeight;
      sections.forEach(function (section, i) {
        var inner = section.querySelector("[data-card-inner]");
        if (!inner) return;

        var top = section.getBoundingClientRect().top;

        /* Fade-in: 0 when fully below viewport → 1 when top reaches 50% */
        var fadeIn = Math.max(0, Math.min(1, 1 - (top - vh * 0.5) / (vh * 0.5)));

        /* Scale + dim + fade-out as NEXT section overlaps */
        var next = sections[i + 1];
        var scale = 1;
        var brightness = 1;
        var stackOpacity = fadeIn;
        if (next) {
          var nextTop = next.getBoundingClientRect().top;
          var progress = Math.max(0, Math.min(1, 1 - nextTop / vh));
          scale = 1 - progress * 0.04;
          brightness = 1 - progress * 0.18;
          var fadeStart = 0.35;
          var fadeEnd = 0.75;
          var fadeOut = Math.max(0, Math.min(1, (progress - fadeStart) / (fadeEnd - fadeStart)));
          stackOpacity = fadeIn * (1 - fadeOut);
        }

        inner.style.opacity = stackOpacity.toFixed(4);
        inner.style.transform = "scale(" + scale.toFixed(4) + ")";
        inner.style.filter = "brightness(" + brightness.toFixed(4) + ")";
      });
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  }

  /* ================================================================
     INIT
     ================================================================ */
  document.addEventListener("DOMContentLoaded", function () {
    initParticleField();
    initCustomCursor();
    initSideTab();
    initContactModal();
    initNavbar();
    initBackToTop();
    initCardStack();
  });
})();
