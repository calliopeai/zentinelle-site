(function () {
  var W = 560, H = 540, COUNT = 85, CONNECT_DIST = 140;
  var TR = 55, TG = 239, TB = 237;

  function buildZ(cx, cy, w, h, n) {
    var x0 = cx - w / 2, x1 = cx + w / 2;
    var y0 = cy - h / 2, y1 = cy + h / 2;
    var pts = [];
    for (var i = 0; i <= n; i++) pts.push([x0 + (x1 - x0) * (i / n), y0]);
    for (var i = 1; i < n; i++) {
      var t = i / n;
      pts.push([x1 - (x1 - x0) * t, y0 + (y1 - y0) * t]);
    }
    for (var i = 0; i <= n; i++) pts.push([x0 + (x1 - x0) * (i / n), y1]);
    return pts;
  }

  var Z_ANCHORS = buildZ(W / 2, H / 2, 210, 210, 13);

  function init() {
    var canvas = document.getElementById("particle-field");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var mx = -999, my = -999, hovered = false, justExploded = false;

    canvas.addEventListener("mouseenter", function () { hovered = true; justExploded = true; });
    canvas.addEventListener("mousemove", function (e) {
      var rect = canvas.getBoundingClientRect();
      mx = (e.clientX - rect.left) * (W / rect.width);
      my = (e.clientY - rect.top) * (H / rect.height);
    });
    canvas.addEventListener("mouseleave", function () { hovered = false; mx = -999; my = -999; });

    var pts = [];
    for (var i = 0; i < COUNT; i++) {
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

    var zpts = Z_ANCHORS.map(function (anchor) {
      return {
        x: anchor[0] + (Math.random() - 0.5) * 60,
        y: anchor[1] + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
        tx: anchor[0], ty: anchor[1],
        size: 1.6 + Math.random() * 1.4,
        alpha: 0,
        flickerPhase: Math.random() * Math.PI * 2,
        flickerSpeed: 1.0 + Math.random() * 1.8,
      };
    });

    var sparks = [];
    var time = 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      time += 0.018;

      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) { p.vx *= -1; p.x = Math.max(0, Math.min(W, p.x)); }
        if (p.y < 0 || p.y > H) { p.vy *= -1; p.y = Math.max(0, Math.min(H, p.y)); }
        var flicker = Math.sin(time * p.flickerSpeed + p.flickerPhase);
        p.alpha = Math.max(0.04, Math.min(1, p.baseAlpha + flicker * (p.isNode ? 0.28 : 0.08)));
      }

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

      for (var i = 0; i < zpts.length; i++) {
        var p = zpts[i];
        var pull = hovered ? 0.001 : 0.004;
        p.vx += (p.tx - p.x) * pull;
        p.vy += (p.ty - p.y) * pull;
        if (hovered) {
          var dx = p.x - mx, dy = p.y - my;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110 && dist > 0) {
            var force = (1 - dist / 110) * 4.5;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }
        p.vx *= 0.92; p.vy *= 0.92;
        p.x += p.vx; p.y += p.vy;
        var flicker = 0.5 + 0.5 * Math.sin(time * p.flickerSpeed + p.flickerPhase);
        p.alpha = 0.55 + flicker * 0.45;
      }

      if (Math.random() < 0.08) {
        var i = Math.floor(Math.random() * zpts.length);
        var j = (i + 1) % zpts.length;
        var a = zpts[i], b = zpts[j];
        var dx = b.x - a.x, dy = b.y - a.y;
        if (Math.sqrt(dx * dx + dy * dy) < 60) {
          sparks.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, t: 0, speed: 0.022 + Math.random() * 0.03, alpha: 1, life: 55 });
        }
      }
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

      for (var i = 0; i < zpts.length; i++) {
        var p = zpts[i];
        var hr = p.size * 5 + Math.sin(time * p.flickerSpeed + p.flickerPhase) * p.size;
        var h = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, hr);
        h.addColorStop(0, "rgba(" + TR + "," + TG + "," + TB + "," + (p.alpha * 0.35) + ")");
        h.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath(); ctx.arc(p.x, p.y, hr, 0, Math.PI * 2); ctx.fillStyle = h; ctx.fill();
        var c = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        c.addColorStop(0, "rgba(255,255,255," + p.alpha + ")");
        c.addColorStop(0.5, "rgba(" + TR + "," + TG + "," + TB + "," + (p.alpha * 0.8) + ")");
        c.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255," + p.alpha + ")"; ctx.fill();
      }

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();