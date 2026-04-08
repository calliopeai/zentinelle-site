/* site.js -- vanilla JS interactivity for zentinelle.ai
   Extracted from the React/Next.js TSX sources.
   No build step required. */

(function () {
  "use strict";

  /* ================================================================
     A) ParticleField  -- canvas "Z" animation
     Extracted from ParticleField.tsx
     ================================================================ */
  function initParticleField() {
    var canvas = document.querySelector('canvas[aria-hidden="true"]');
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var W = 560;
    var H = 540;
    var COUNT = 85;
    var CONNECT_DIST = 140;
    var TR = 55, TG = 239, TB = 237;

    // ── Generate Z anchor points ────────────────────────────────────────
    function buildZ(cx, cy, w, h, n) {
      var x0 = cx - w / 2, x1 = cx + w / 2;
      var y0 = cy - h / 2, y1 = cy + h / 2;
      var pts = [];

      // top line
      for (var i = 0; i <= n; i++) pts.push([x0 + (x1 - x0) * (i / n), y0]);
      // diagonal
      for (var i = 1; i < n; i++) {
        var t = i / n;
        pts.push([x1 - (x1 - x0) * t, y0 + (y1 - y0) * t]);
      }
      // bottom line
      for (var i = 0; i <= n; i++) pts.push([x0 + (x1 - x0) * (i / n), y1]);

      return pts;
    }

    var Z_ANCHORS = buildZ(W / 2, H / 2, 210, 210, 13);

    // ── Mouse state ─────────────────────────────────────────────────
    var mx = -999, my = -999;
    var hovered = false;
    var justExploded = false;

    function onMouseEnter() {
      hovered = true;
      justExploded = true;
    }
    function onMouseMove(e) {
      var rect = canvas.getBoundingClientRect();
      mx = (e.clientX - rect.left) * (W / rect.width);
      my = (e.clientY - rect.top) * (H / rect.height);
    }
    function onMouseLeave() {
      hovered = false;
      mx = -999; my = -999;
    }
    canvas.addEventListener("mouseenter", onMouseEnter);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    // ── Background particles ────────────────────────────────────────
    var pts = [];
    for (var _i = 0; _i < COUNT; _i++) {
      var isNode = Math.random() < 0.14;
      pts.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        size: isNode ? 2.5 + Math.random() * 2.5 : 0.8 + Math.random() * 1.4,
        baseAlpha: isNode ? 0.65 + Math.random() * 0.35 : 0.15 + Math.random() * 0.45,
        alpha: 0, isNode: isNode,
        flickerPhase: Math.random() * Math.PI * 2,
        flickerSpeed: isNode ? 0.8 + Math.random() * 1.4 : 0.3 + Math.random() * 0.8,
      });
    }

    // ── Z particles (one per anchor) ────────────────────────────────
    var zpts = [];
    for (var _i = 0; _i < Z_ANCHORS.length; _i++) {
      var tx = Z_ANCHORS[_i][0], ty = Z_ANCHORS[_i][1];
      zpts.push({
        x: tx + (Math.random() - 0.5) * 60,
        y: ty + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        tx: tx, ty: ty,
        size: 1.6 + Math.random() * 1.4,
        alpha: 0,
        flickerPhase: Math.random() * Math.PI * 2,
        flickerSpeed: 1.0 + Math.random() * 1.8,
      });
    }

    var sparks = [];
    var time = 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      time += 0.018;

      // ── Update background particles ───────────────────────────────
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) { p.vx *= -1; p.x = Math.max(0, Math.min(W, p.x)); }
        if (p.y < 0 || p.y > H) { p.vy *= -1; p.y = Math.max(0, Math.min(H, p.y)); }
        var flicker = Math.sin(time * p.flickerSpeed + p.flickerPhase);
        p.alpha = Math.max(0.04, Math.min(1, p.baseAlpha + flicker * (p.isNode ? 0.28 : 0.08)));
      }

      // ── Explosion burst on first hover frame ──────────────────────
      if (justExploded) {
        justExploded = false;
        for (var i = 0; i < zpts.length; i++) {
          var p = zpts[i];
          var dx = p.x - W / 2, dy = p.y - H / 2;
          var len = Math.sqrt(dx * dx + dy * dy) || 1;
          p.vx += (dx / len) * 10 + (Math.random() - 0.5) * 6;
          p.vy += (dy / len) * 10 + (Math.random() - 0.5) * 6;
        }
      }

      // ── Update Z particles (attracted to anchor) ──────────────────
      for (var i = 0; i < zpts.length; i++) {
        var p = zpts[i];
        // Attraction: weaker when hovered so particles stay scattered
        var pull = hovered ? 0.001 : 0.004;
        p.vx += (p.tx - p.x) * pull;
        p.vy += (p.ty - p.y) * pull;

        // Mouse repulsion
        if (hovered) {
          var dx = p.x - mx, dy = p.y - my;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110 && dist > 0) {
            var force = (1 - dist / 110) * 4.5;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        p.vx *= 0.92;
        p.vy *= 0.92;
        p.x += p.vx; p.y += p.vy;
        var flicker = 0.5 + 0.5 * Math.sin(time * p.flickerSpeed + p.flickerPhase);
        p.alpha = 0.55 + flicker * 0.45;
      }

      // ── Spawn sparks along Z edges ────────────────────────────────
      if (Math.random() < 0.08) {
        var i = Math.floor(Math.random() * zpts.length);
        var j = (i + 1) % zpts.length;
        var a = zpts[i], b = zpts[j];
        var dx = b.x - a.x, dy = b.y - a.y;
        if (Math.sqrt(dx * dx + dy * dy) < 60) {
          sparks.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, t: 0, speed: 0.022 + Math.random() * 0.03, alpha: 1, life: 55 });
        }
      }
      // Sparks between background nodes too
      if (Math.random() < 0.04) {
        var i = Math.floor(Math.random() * pts.length);
        var a = pts[i];
        if (a.isNode) {
          for (var j = 0; j < pts.length; j++) {
            if (j === i) continue;
            var b = pts[j];
            var dx = b.x - a.x, dy = b.y - a.y;
            if (Math.sqrt(dx * dx + dy * dy) < CONNECT_DIST) {
              sparks.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, t: 0, speed: 0.018 + Math.random() * 0.024, alpha: 0.85, life: 60 });
              break;
            }
          }
        }
      }

      // ── Draw background edges ─────────────────────────────────────
      for (var i = 0; i < pts.length; i++) {
        for (var j = i + 1; j < pts.length; j++) {
          var a = pts[i], b = pts[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist >= CONNECT_DIST) continue;
          var prox = 1 - dist / CONNECT_DIST;
          var boost = (a.isNode || b.isNode) ? 3.5 : 1;
          var la = Math.min(0.55, prox * prox * 0.28 * boost * Math.min(a.alpha, b.alpha) * 2.5);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = "rgba(" + TR + "," + TG + "," + TB + "," + la + ")";
          ctx.lineWidth = prox * 1.1; ctx.stroke();
        }
      }

      // ── Draw Z edges (connections between Z particles) ────────────
      for (var i = 0; i < zpts.length; i++) {
        for (var j = i + 1; j < zpts.length; j++) {
          var a = zpts[i], b = zpts[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist >= 55) continue;
          var prox = 1 - dist / 55;
          var la = Math.min(0.85, prox * prox * Math.min(a.alpha, b.alpha) * 1.2);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = "rgba(" + TR + "," + TG + "," + TB + "," + la + ")";
          ctx.lineWidth = prox * 1.6; ctx.stroke();
        }
      }

      // ── Draw sparks ───────────────────────────────────────────────
      for (var s = sparks.length - 1; s >= 0; s--) {
        var sp = sparks[s];
        sp.t += sp.speed; sp.life--;
        if (sp.t >= 1 || sp.life <= 0) { sparks.splice(s, 1); continue; }
        var sx = sp.ax + (sp.bx - sp.ax) * sp.t;
        var sy = sp.ay + (sp.by - sp.ay) * sp.t;
        var fa = sp.alpha * Math.sin(sp.t * Math.PI);
        var g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 14);
        g.addColorStop(0, "rgba(" + TR + "," + TG + "," + TB + "," + (fa * 0.45) + ")");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath(); ctx.arc(sx, sy, 14, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255," + fa + ")"; ctx.fill();
      }

      // ── Draw background particles ─────────────────────────────────
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (p.isNode) {
          var hr = p.size * 7 + Math.sin(time * p.flickerSpeed + p.flickerPhase) * p.size * 2;
          var h = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, hr);
          h.addColorStop(0, "rgba(" + TR + "," + TG + "," + TB + "," + (p.alpha * 0.25) + ")");
          h.addColorStop(0.4, "rgba(" + TR + "," + TG + "," + TB + "," + (p.alpha * 0.08) + ")");
          h.addColorStop(1, "rgba(0,0,0,0)");
          ctx.beginPath(); ctx.arc(p.x, p.y, hr, 0, Math.PI * 2); ctx.fillStyle = h; ctx.fill();
          var c = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
          c.addColorStop(0, "rgba(255,255,255," + (p.alpha * 0.9) + ")");
          c.addColorStop(0.4, "rgba(" + TR + "," + TG + "," + TB + "," + (p.alpha * 0.7) + ")");
          c.addColorStop(1, "rgba(0,0,0,0)");
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.isNode ? "rgba(255,255,255," + p.alpha + ")" : "rgba(" + TR + "," + TG + "," + TB + "," + p.alpha + ")";
        ctx.fill();
      }

      // ── Draw Z particles (on top, brightest) ─────────────────────
      for (var i = 0; i < zpts.length; i++) {
        var p = zpts[i];
        // Halo
        var hr = p.size * 5 + Math.sin(time * p.flickerSpeed + p.flickerPhase) * p.size;
        var h = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, hr);
        h.addColorStop(0, "rgba(" + TR + "," + TG + "," + TB + "," + (p.alpha * 0.35) + ")");
        h.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath(); ctx.arc(p.x, p.y, hr, 0, Math.PI * 2); ctx.fillStyle = h; ctx.fill();
        // Core
        var c = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        c.addColorStop(0, "rgba(255,255,255," + p.alpha + ")");
        c.addColorStop(0.5, "rgba(" + TR + "," + TG + "," + TB + "," + (p.alpha * 0.8) + ")");
        c.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill();
        // Dot
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255," + p.alpha + ")"; ctx.fill();
      }

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }

  /* ================================================================
     B) CustomCursor -- dot + ring
     Extracted from CustomCursor.tsx
     ================================================================ */
  function initCustomCursor() {
    /* skip on touch devices */
    if ("ontouchstart" in window) return;

    var dot = document.createElement("div");
    dot.setAttribute("aria-hidden", "true");
    dot.style.cssText =
      "position:fixed;top:0;left:0;width:8px;height:8px;border-radius:50%;" +
      "background:#37efed;pointer-events:none;z-index:9999;opacity:0;" +
      "translate:-50% -50%;will-change:transform;" +
      "transition:width 0.25s ease, height 0.25s ease, background 0.25s ease, opacity 0.25s ease;";
    document.body.appendChild(dot);

    var ring = document.createElement("div");
    ring.setAttribute("aria-hidden", "true");
    ring.style.cssText =
      "position:fixed;top:0;left:0;width:32px;height:32px;border-radius:50%;" +
      "border:1.5px solid rgba(55,239,237,0.45);pointer-events:none;z-index:9998;opacity:0;" +
      "translate:-50% -50%;will-change:transform;" +
      "transition:width 0.25s ease, height 0.25s ease, border-color 0.25s ease, border-width 0.25s ease, opacity 0.25s ease;";
    document.body.appendChild(ring);

    var mx = -100, my = -100;
    var rx = -100, ry = -100;
    var hoveredInteractive = false;

    function isInteractive(el) {
      if (!el) return false;
      return !!el.closest("a, button, [role='button']");
    }

    function setInverted(on) {
      if (hoveredInteractive === on) return;
      hoveredInteractive = on;

      if (on) {
        dot.style.width = "36px";
        dot.style.height = "36px";
        dot.style.background = "#37efed";
        dot.style.opacity = "0.15";
        ring.style.borderColor = "#37efed";
        ring.style.borderWidth = "2px";
        ring.style.width = "42px";
        ring.style.height = "42px";
      } else {
        dot.style.width = "8px";
        dot.style.height = "8px";
        dot.style.background = "#37efed";
        dot.style.opacity = "1";
        ring.style.borderColor = "rgba(55,239,237,0.45)";
        ring.style.borderWidth = "1.5px";
        ring.style.width = "32px";
        ring.style.height = "32px";
      }
    }

    function onMove(e) {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = "translate(" + mx + "px, " + my + "px)";
      setInverted(isInteractive(e.target));
    }

    function loop() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.transform = "translate(" + rx + "px, " + ry + "px)";
      requestAnimationFrame(loop);
    }

    function onEnter() {
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    }
    function onLeave() {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseleave", onLeave);
    requestAnimationFrame(loop);
  }

  /* ================================================================
     C) SideTab -- "Contact us" fixed tab
     Extracted from SideTab.tsx
     ================================================================ */
  function initSideTab() {
    var tab = document.createElement("a");
    tab.href = "#contact";
    tab.setAttribute("aria-label", "Contact us");
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
      var el = document.getElementById("contact");
      if (!el) return;
      e.preventDefault();
      var top = 0;
      var node = el;
      while (node) { top += node.offsetTop; node = node.offsetParent; }
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  }

  /* ================================================================
     D) ContactModal -- auto-show after 10s
     Extracted from ContactModal.tsx
     (Framer Motion animations replaced with CSS transitions)
     ================================================================ */
  function initContactModal() {
    var STORAGE_KEY = "zentinelle_modal_v2";
    if (localStorage.getItem(STORAGE_KEY)) return;

    var sent = false;
    var submitting = false;

    /* -- build DOM -- */
    var backdrop = document.createElement("div");
    backdrop.className = "fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm";
    backdrop.style.cssText =
      "opacity:0;pointer-events:none;transition:opacity 0.3s ease;";

    var modalWrap = document.createElement("div");
    modalWrap.className = "fixed z-[91] inset-x-4 bottom-6 sm:inset-x-auto sm:bottom-8 sm:right-8 sm:left-auto sm:w-[420px]";
    modalWrap.style.cssText =
      "opacity:0;transform:translateY(32px) scale(0.97);pointer-events:none;" +
      "transition:opacity 0.4s cubic-bezier(0.25,0.1,0.25,1), transform 0.4s cubic-bezier(0.25,0.1,0.25,1);";

    var card = document.createElement("div");
    card.className = "bg-[#13131f] border border-white/12 rounded-[16px] p-[28px] flex flex-col gap-[20px] shadow-2xl shadow-black/60";

    /* Header */
    var headerRow = document.createElement("div");
    headerRow.className = "flex items-start justify-between gap-4";

    var headerLeft = document.createElement("div");
    headerLeft.className = "flex flex-col gap-[6px]";

    /* badge */
    var badge = document.createElement("div");
    badge.className = "self-start flex items-center gap-[6px] px-[10px] py-[4px] rounded-[200px]";
    badge.style.cssText = "background:rgba(55,239,237,0.1);border:1px solid rgba(55,239,237,0.2);";
    badge.innerHTML =
      '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#37efed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>' +
      '<span class="text-[#37efed] text-[11px] uppercase tracking-wide" style="font-family:var(--font-sora), sans-serif;font-weight:400">Let\'s talk</span>';
    headerLeft.appendChild(badge);

    /* headline */
    var headline = document.createElement("p");
    headline.className = "text-white text-[18px] leading-snug";
    headline.style.cssText = "font-family:var(--font-boldonse), sans-serif;font-weight:400;";
    headline.textContent = "Have questions?";
    headerLeft.appendChild(headline);

    /* subtitle */
    var subtitle = document.createElement("p");
    subtitle.className = "text-[#ccccd8] text-[13px] leading-relaxed";
    subtitle.style.cssText = "font-family:var(--font-sora), sans-serif;font-weight:300;";
    subtitle.textContent = "Get in touch \u2014 we reply fast.";
    headerLeft.appendChild(subtitle);

    headerRow.appendChild(headerLeft);

    /* close button */
    var closeBtn = document.createElement("button");
    closeBtn.className = "shrink-0 w-[28px] h-[28px] flex items-center justify-center rounded-[8px] text-white/40 hover:text-white hover:bg-white/8 transition-colors mt-[2px]";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.innerHTML =
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
      '<path d="M18 6L6 18M6 6l12 12"/></svg>';
    headerRow.appendChild(closeBtn);

    card.appendChild(headerRow);

    /* sent confirmation (hidden) */
    var sentDiv = document.createElement("div");
    sentDiv.className = "flex flex-col items-center gap-[12px] py-[16px]";
    sentDiv.style.display = "none";
    sentDiv.innerHTML =
      '<div class="flex items-center justify-center w-[44px] h-[44px] rounded-full bg-[#37efed]">' +
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0b0b19" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M20 6L9 17l-5-5"/></svg></div>' +
      '<p class="text-white text-[15px] text-center" style="font-family:var(--font-sora), sans-serif;font-weight:700">Message sent!</p>' +
      '<p class="text-[#ccccd8]/60 text-[13px] text-center" style="font-family:var(--font-sora), sans-serif;font-weight:300">We\'ll get back to you shortly.</p>';
    card.appendChild(sentDiv);

    /* form */
    var form = document.createElement("form");
    form.className = "flex flex-col gap-[12px]";

    var inputRow = document.createElement("div");
    inputRow.className = "flex flex-col sm:flex-row gap-[10px]";

    var nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Name";
    nameInput.required = true;
    nameInput.className = "flex-1 px-[12px] py-[9px] rounded-[8px] text-[13px] bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[#37efed]/40 transition-colors";
    nameInput.style.cssText = "font-family:var(--font-sora), sans-serif;";
    inputRow.appendChild(nameInput);

    var emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.placeholder = "Email";
    emailInput.required = true;
    emailInput.className = "flex-1 px-[12px] py-[9px] rounded-[8px] text-[13px] bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[#37efed]/40 transition-colors";
    emailInput.style.cssText = "font-family:var(--font-sora), sans-serif;";
    inputRow.appendChild(emailInput);

    form.appendChild(inputRow);

    var textarea = document.createElement("textarea");
    textarea.rows = 3;
    textarea.placeholder = "Your message\u2026";
    textarea.required = true;
    textarea.className = "w-full px-[12px] py-[9px] rounded-[8px] text-[13px] bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[#37efed]/40 transition-colors resize-none";
    textarea.style.cssText = "font-family:var(--font-sora), sans-serif;";
    form.appendChild(textarea);

    var formFooter = document.createElement("div");
    formFooter.className = "flex items-center justify-between gap-3 pt-[2px]";

    var emailLink = document.createElement("a");
    emailLink.href = "mailto:hello@zentinelle.com";
    emailLink.className = "text-[#ccccd8]/50 text-[12px] hover:text-[#37efed] transition-colors flex items-center gap-[6px]";
    emailLink.style.cssText = "font-family:var(--font-sora), sans-serif;";
    emailLink.innerHTML =
      '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>' +
      'hello@zentinelle.com';
    formFooter.appendChild(emailLink);

    var sendBtn = document.createElement("button");
    sendBtn.type = "submit";
    sendBtn.className = "flex items-center gap-[8px] px-[16px] py-[9px] rounded-[8px] text-[13px] bg-[#37efed] text-[#0b0b19] hover:bg-white transition-colors disabled:opacity-60 shrink-0";
    sendBtn.style.cssText = "font-family:var(--font-sora), sans-serif;font-weight:600;";
    sendBtn.textContent = "Send";
    formFooter.appendChild(sendBtn);

    form.appendChild(formFooter);
    card.appendChild(form);

    modalWrap.appendChild(card);
    document.body.appendChild(backdrop);
    document.body.appendChild(modalWrap);

    /* -- behavior -- */
    function showModal() {
      backdrop.style.opacity = "1";
      backdrop.style.pointerEvents = "auto";
      modalWrap.style.opacity = "1";
      modalWrap.style.transform = "translateY(0) scale(1)";
      modalWrap.style.pointerEvents = "auto";
    }

    function dismiss() {
      localStorage.setItem(STORAGE_KEY, "1");
      backdrop.style.opacity = "0";
      backdrop.style.pointerEvents = "none";
      modalWrap.style.opacity = "0";
      modalWrap.style.transform = "translateY(24px) scale(0.97)";
      modalWrap.style.pointerEvents = "none";
    }

    closeBtn.addEventListener("click", dismiss);
    backdrop.addEventListener("click", dismiss);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (submitting) return;
      submitting = true;
      sendBtn.disabled = true;
      sendBtn.innerHTML =
        '<svg class="animate-spin" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">' +
        '<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>' +
        "Sending\u2026";
      setTimeout(function () {
        submitting = false;
        sent = true;
        form.style.display = "none";
        sentDiv.style.display = "flex";
        setTimeout(dismiss, 2200);
      }, 900);
    });

    /* auto-show after 10 seconds */
    setTimeout(showModal, 10000);
  }

  /* ================================================================
     E) Navbar interactivity
     Extracted from NavBar.tsx
     ================================================================ */
  function initNavbar() {
    var navLinks = [
      { label: "How it works",     href: "/#how-it-works",    sectionId: "how-it-works",  page: null                },
      { label: "Features",         href: "/#governance",      sectionId: "governance",    page: null                },
      { label: "Governance",       href: "/governance",       sectionId: null,            page: "/governance"       },
      { label: "Risk",             href: "/risk",             sectionId: null,            page: "/risk"             },
      { label: "Observability",    href: "/observability",    sectionId: null,            page: "/observability"    },
      { label: "Content Scanning", href: "/content-scanning", sectionId: null,            page: "/content-scanning" },
      { label: "Compliance",       href: "/compliance",       sectionId: null,            page: "/compliance"       },
      { label: "Quick Start",      href: "/#quick-start",     sectionId: "quick-start",   page: null                },
      { label: "Docs",             href: "https://zentinelle.dev/wiki/sdk/", sectionId: null, page: null            },
    ];

    var imgDot = "/bb66de66bee7ad3628b9dc976894505fce847328.svg";

    function getAbsoluteTop(el) {
      var top = 0;
      var node = el;
      while (node) {
        top += node.offsetTop;
        node = node.offsetParent;
      }
      return top;
    }

    function scrollToSection(sectionId) {
      var el = document.getElementById(sectionId);
      if (!el) return;
      var top = getAbsoluteTop(el);
      window.scrollTo({ top: top, behavior: "smooth" });
    }

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
        lines[0].style.transform = "rotate(45deg) translate(6.5px, 6.5px)";
        lines[1].style.opacity = "0";
        lines[1].style.transform = "scaleX(0)";
        lines[2].style.transform = "rotate(-45deg) translate(6.5px, -6.5px)";
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
        lines[1].style.transform = "";
        lines[2].style.transform = "";
      }
    }

    burger.addEventListener("click", function () {
      if (menuOpen) closeMenu(); else openMenu();
    });

    /* close on backdrop click */
    drawerBackdrop.addEventListener("click", closeMenu);

    /* close when clicking a link inside the drawer */
    var drawerLinks = drawerPanel.querySelectorAll("a");
    for (var i = 0; i < drawerLinks.length; i++) {
      (function (link) {
        link.addEventListener("click", function (e) {
          closeMenu();
          /* handle section scroll links in the drawer on homepage */
          var href = link.getAttribute("href");
          for (var j = 0; j < navLinks.length; j++) {
            if (navLinks[j].href === href && navLinks[j].sectionId && isHomePage) {
              e.preventDefault();
              scrollToSection(navLinks[j].sectionId);
              return;
            }
          }
        });
      })(drawerLinks[i]);
    }

    /* --- detect homepage --- */
    var pathname = window.location.pathname.replace(/\/+$/, "") || "/";
    var isHomePage = pathname === "/" || pathname === "/index.html";

    /* --- smooth scroll for section links (homepage only) --- */
    if (isHomePage) {
      var allNavAnchors = document.querySelectorAll('header nav a, div.fixed.inset-0.z-40 nav a');
      for (var i = 0; i < allNavAnchors.length; i++) {
        (function (link) {
          var href = link.getAttribute("href");
          for (var j = 0; j < navLinks.length; j++) {
            if (navLinks[j].href === href && navLinks[j].sectionId) {
              link.addEventListener("click", function (e) {
                e.preventDefault();
                scrollToSection(navLinks[j].sectionId);
              });
              break;
            }
          }
        })(allNavAnchors[i]);
      }
    }

    /* --- active section tracking --- */
    var sectionIds = [];
    for (var i = 0; i < navLinks.length; i++) {
      if (navLinks[i].sectionId) sectionIds.push(navLinks[i].sectionId);
    }

    /* map from section ID -> matching nav links */
    var desktopNav = document.querySelectorAll("header nav a");
    var drawerNav = drawerPanel.querySelectorAll("a");

    function getAllLinksForHref(href) {
      var result = [];
      for (var i = 0; i < desktopNav.length; i++) {
        if (desktopNav[i].getAttribute("href") === href) result.push(desktopNav[i]);
      }
      for (var i = 0; i < drawerNav.length; i++) {
        if (drawerNav[i].getAttribute("href") === href) result.push(drawerNav[i]);
      }
      return result;
    }

    /* Start link (href="/") */
    var startLinks = getAllLinksForHref("/");

    function updateActiveSection() {
      var scrollY = window.scrollY;
      var threshold = window.innerHeight * 0.4;
      var current = null;

      for (var i = 0; i < sectionIds.length; i++) {
        var el = document.getElementById(sectionIds[i]);
        if (!el) continue;
        if (el.offsetTop - threshold <= scrollY) current = sectionIds[i];
      }

      /* update nav link styles */
      for (var i = 0; i < navLinks.length; i++) {
        var nl = navLinks[i];
        var isActive;
        if (nl.page) {
          isActive = pathname === nl.page;
        } else if (nl.sectionId) {
          isActive = isHomePage && current === nl.sectionId;
        } else {
          isActive = false;
        }

        var links = getAllLinksForHref(nl.href);
        for (var j = 0; j < links.length; j++) {
          var link = links[j];
          var span = link.querySelector("span");
          var existingDot = link.querySelector("img.active-dot");

          if (isActive) {
            if (span) span.style.fontWeight = "700";
            link.style.background = "rgba(255,255,255,0.05)";
            link.classList.remove("hover:bg-white/5");
            if (!existingDot && imgDot) {
              var img = document.createElement("img");
              img.src = imgDot;
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
            if (!link.classList.contains("hover:bg-white/5")) {
              link.classList.add("hover:bg-white/5");
            }
            if (existingDot) existingDot.remove();
          }
        }
      }

      /* Start link: active when on homepage and no section is active */
      var startActive = isHomePage && current === null;
      for (var i = 0; i < startLinks.length; i++) {
        var link = startLinks[i];
        var span = link.querySelector("span");
        var existingDot = link.querySelector("img.active-dot");

        if (startActive) {
          if (span) span.style.fontWeight = "700";
          link.style.background = "rgba(255,255,255,0.05)";
          link.classList.remove("hover:bg-white/5");
          if (!existingDot && imgDot) {
            var img = document.createElement("img");
            img.src = imgDot;
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
          if (!link.classList.contains("hover:bg-white/5")) {
            link.classList.add("hover:bg-white/5");
          }
          if (existingDot) existingDot.remove();
        }
      }
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
    }, { passive: true });
    /* initial check */
    updateActiveSection();
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
    }, { passive: true });

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    /* initial state */
    updateVisibility();
  }

  /* ================================================================
     G) CardStack  -- scroll-driven section reveal/fade
     Extracted from CardStackWrapper.tsx
     ================================================================ */
  function initCardStack() {
    var sections = document.querySelectorAll("[data-card]");
    if (!sections.length) return;

    function update() {
      var vh = window.innerHeight;

      for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        var inner = section.querySelector("[data-card-inner]");
        if (!inner) continue;

        var top = section.getBoundingClientRect().top;

        // Fade-in: 0 when fully below viewport, 1 when top reaches 50% of viewport
        var fadeIn = Math.max(0, Math.min(1, 1 - (top - vh * 0.5) / (vh * 0.5)));

        // Scale + dim + fade: applied as the NEXT section slides over this one
        var next = sections[i + 1];
        var scale = 1;
        var brightness = 1;
        var stackOpacity = fadeIn;
        if (next) {
          var nextTop = next.getBoundingClientRect().top;
          var progress = Math.max(0, Math.min(1, 1 - nextTop / vh));
          scale = 1 - progress * 0.04;
          brightness = 1 - progress * 0.18;
          // Fade out this card once next card is ~35% overlapping
          var fadeStart = 0.35;
          var fadeEnd = 0.75;
          var fadeOut = Math.max(0, Math.min(1, (progress - fadeStart) / (fadeEnd - fadeStart)));
          stackOpacity = fadeIn * (1 - fadeOut);
        }

        inner.style.opacity = stackOpacity.toFixed(4);
        inner.style.transform = "scale(" + scale.toFixed(4) + ")";
        inner.style.filter = "brightness(" + brightness.toFixed(4) + ")";
      }
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  }

  /* ================================================================
     H) Lenis Smooth Scroll
     Extracted from SmoothScroll.tsx -- loaded via CDN
     ================================================================ */
  function initSmoothScroll() {
    var script = document.createElement("script");
    script.src = "https://unpkg.com/lenis@1.3.21/dist/lenis.min.js";
    script.onload = function () {
      if (typeof Lenis === "undefined") return;

      var lenis = new Lenis({
        duration: 1.4,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        touchMultiplier: 1.5,
      });

      window.__lenis = lenis;

      var raf;
      function frame(time) {
        lenis.raf(time);
        raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);
    };
    document.head.appendChild(script);
  }

  /* ================================================================
     I) Page Transition -- fade-in on load
     Extracted from PageTransition.tsx (Framer Motion -> CSS)
     ================================================================ */
  function initPageTransition() {
    /* Target the outer content wrapper in baseof.html:
       <div style="opacity:1;transform:none"> */
    var wrapper = document.querySelector('div[style*="opacity:1"][style*="transform:none"]');
    if (!wrapper) return;

    /* Start hidden */
    wrapper.style.opacity = "0";
    wrapper.style.transform = "translateY(18px)";
    wrapper.style.transition = "none";

    /* Force a reflow so the browser registers the start state */
    void wrapper.offsetHeight;

    /* Animate in */
    wrapper.style.transition = "opacity 0.38s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.38s cubic-bezier(0.25, 0.1, 0.25, 1)";
    wrapper.style.opacity = "1";
    wrapper.style.transform = "translateY(0)";
  }

  /* ================================================================
     J) StatusSlider -- auto-advancing "Working now" slider
     Extracted from StatusSlider.tsx
     ================================================================ */
  function initStatusSlider() {
    var items = [
      "Claude Code integration (hooks)",
      "OpenAI Codex integration (proxy)",
      "Gemini CLI integration (hooks)",
      "Policy engine \u2014 rate limits, tool permissions, model restrictions",
      "Real-time monitoring dashboard",
      "LLM proxy (Anthropic, OpenAI, Google)",
      "Compliance dashboards (SOC2, GDPR, HIPAA, EU AI Act, NIST)",
      "Python + TypeScript SDKs",
    ];

    /* Find the card by locating the "Working now" label */
    var labels = document.querySelectorAll("span");
    var headerLabel = null;
    for (var i = 0; i < labels.length; i++) {
      if (labels[i].textContent.trim() === "Working now") {
        headerLabel = labels[i];
        break;
      }
    }
    if (!headerLabel) return;

    /* Walk up to the card root: the div with class containing "shrink-0 w-full lg:w-[468px]" */
    var card = headerLabel.closest('.shrink-0.w-full.lg\\:w-\\[468px\\]');
    if (!card) return;

    /* Locate sub-elements */
    var counterSpan = card.querySelector(".ml-auto.text-white\\/25");
    var slideArea = card.querySelector(".flex-1.flex.flex-col.justify-center");
    var slideInner = slideArea ? slideArea.querySelector("div[style]") : null;
    var textEl = slideInner ? slideInner.querySelector("p") : null;
    var dots = card.querySelectorAll('button[aria-label^="Slide"]');
    var progressTrack = card.querySelector(".w-full.h-\\[2px\\]");
    var progressBar = progressTrack ? progressTrack.querySelector(".h-full") : null;

    if (!textEl || !dots.length || !progressBar) return;

    var active = 0;
    var animating = false;
    var timer = null;

    function updateUI() {
      /* Counter */
      if (counterSpan) counterSpan.textContent = (active + 1) + " / " + items.length;

      /* Text */
      textEl.textContent = items[active];

      /* Dots */
      for (var i = 0; i < dots.length; i++) {
        dots[i].style.width = (i === active) ? "24px" : "6px";
        dots[i].style.background = (i === active) ? "#37efed" : "rgba(255,255,255,0.15)";
      }

      /* Progress bar */
      progressBar.style.width = (((active + 1) / items.length) * 100) + "%";
    }

    function goTo(index) {
      if (animating) return;
      animating = true;

      /* Fade out */
      slideInner.style.opacity = "0";
      slideInner.style.transform = "translateY(10px)";

      setTimeout(function () {
        active = index;
        updateUI();

        /* Fade in */
        slideInner.style.opacity = "1";
        slideInner.style.transform = "translateY(0)";
        animating = false;
      }, 300);
    }

    function scheduleNext() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        goTo((active + 1) % items.length);
        scheduleNext();
      }, 3200);
    }

    /* Dot click handlers */
    for (var i = 0; i < dots.length; i++) {
      (function (idx) {
        dots[idx].addEventListener("click", function () {
          if (animating) return;
          goTo(idx);
          scheduleNext(); /* reset timer on manual navigation */
        });
      })(i);
    }

    /* Start auto-advance */
    scheduleNext();
  }

  /* ================================================================
     K) ComingSoonSlider -- auto-advancing "Coming soon" slider
     Extracted from ComingSoonSlider.tsx
     ================================================================ */
  function initComingSoonSlider() {
    var items = [
      "LangChain callback handlers",
      "LlamaIndex governed query engines",
      "CrewAI multi-agent integration",
      "Vercel AI SDK support",
      "Microsoft Agent Framework",
      "n8n workflow nodes",
      "Java + Go SDKs",
      "Hosted / managed version",
      "Policy-as-code (YAML / OPA)",
    ];

    /* Find the card by locating the "Coming soon" label */
    var labels = document.querySelectorAll("span");
    var headerLabel = null;
    for (var i = 0; i < labels.length; i++) {
      if (labels[i].textContent.trim() === "Coming soon") {
        headerLabel = labels[i];
        break;
      }
    }
    if (!headerLabel) return;

    var card = headerLabel.closest('.shrink-0.w-full.lg\\:w-\\[468px\\]');
    if (!card) return;

    var counterSpan = card.querySelector(".ml-auto.text-white\\/25");
    var slideArea = card.querySelector(".flex-1.flex.flex-col.justify-center");
    var slideInner = slideArea ? slideArea.querySelector("div[style]") : null;
    var textEl = slideInner ? slideInner.querySelector("p") : null;
    var dots = card.querySelectorAll('button[aria-label^="Slide"]');
    var progressTrack = card.querySelector(".w-full.h-\\[2px\\]");
    var progressBar = progressTrack ? progressTrack.querySelector(".h-full") : null;

    if (!textEl || !dots.length || !progressBar) return;

    var active = 0;
    var animating = false;
    var timer = null;

    function updateUI() {
      if (counterSpan) counterSpan.textContent = (active + 1) + " / " + items.length;
      textEl.textContent = items[active];

      for (var i = 0; i < dots.length; i++) {
        dots[i].style.width = (i === active) ? "24px" : "6px";
        dots[i].style.background = (i === active) ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.12)";
      }

      progressBar.style.width = (((active + 1) / items.length) * 100) + "%";
    }

    function goTo(index) {
      if (animating) return;
      animating = true;

      slideInner.style.opacity = "0";
      slideInner.style.transform = "translateY(10px)";

      setTimeout(function () {
        active = index;
        updateUI();
        slideInner.style.opacity = "1";
        slideInner.style.transform = "translateY(0)";
        animating = false;
      }, 300);
    }

    function scheduleNext() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        goTo((active + 1) % items.length);
        scheduleNext();
      }, 3200);
    }

    for (var i = 0; i < dots.length; i++) {
      (function (idx) {
        dots[idx].addEventListener("click", function () {
          if (animating) return;
          goTo(idx);
          scheduleNext();
        });
      })(i);
    }

    scheduleNext();
  }

  /* ================================================================
     L) CopyButton -- copy code blocks to clipboard
     Extracted from CopyButton.tsx
     ================================================================ */
  function initCopyButtons() {
    var COPY_SVG =
      '<svg width="14" height="14" viewBox="0 0 14 14" fill="none">' +
      '<rect x="4" y="1" width="8" height="9" rx="1.5" stroke="#0b0b19" stroke-width="1.5"/>' +
      '<path d="M2 5H1.5A1.5 1.5 0 0 0 0 6.5v6A1.5 1.5 0 0 0 1.5 14H8a1.5 1.5 0 0 0 1.5-1.5V12" stroke="#0b0b19" stroke-width="1.5" stroke-linecap="round"/>' +
      '</svg>';

    var CHECK_SVG =
      '<svg width="14" height="14" viewBox="0 0 14 14" fill="none">' +
      '<path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="#0b0b19" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';

    var buttons = document.querySelectorAll('button[aria-label="Copy code"]');

    for (var i = 0; i < buttons.length; i++) {
      (function (btn) {
        /* The button is inside a header div. The code content div is the
           next sibling of that header within the code block card. */
        var headerDiv = btn.parentElement;
        var codeDiv = headerDiv ? headerDiv.nextElementSibling : null;

        /* Style the button to match the teal CopyButton.tsx design */
        btn.style.background = "#37efed";
        btn.style.width = "28px";
        btn.style.height = "28px";
        btn.style.display = "flex";
        btn.style.alignItems = "center";
        btn.style.justifyContent = "center";
        btn.style.borderRadius = "6px";
        btn.style.border = "none";
        btn.style.cursor = "pointer";
        btn.style.color = "";
        btn.innerHTML = COPY_SVG;

        btn.addEventListener("click", function () {
          if (!codeDiv) return;

          var text = codeDiv.textContent || "";
          navigator.clipboard.writeText(text).then(function () {
            btn.innerHTML = CHECK_SVG;
            setTimeout(function () {
              btn.innerHTML = COPY_SVG;
            }, 1800);
          });
        });
      })(buttons[i]);
    }
  }

  /* ================================================================
     INIT
     ================================================================ */
  document.addEventListener("DOMContentLoaded", function () {
    initPageTransition();
    initSmoothScroll();
    initParticleField();
    initCustomCursor();
    initSideTab();
    initContactModal();
    initNavbar();
    initBackToTop();
    initCardStack();
    initStatusSlider();
    initComingSoonSlider();
    initCopyButtons();
  });
})();
