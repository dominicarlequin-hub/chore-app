export function triggerConfetti(x, y) {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;top:0;left:0;pointer-events:none;z-index:9999;";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const originX = x ?? canvas.width / 2;
  const originY = y ?? canvas.height / 2;

  const COLORS = ["#5DCAA5","#7F77DD","#D85A30","#378ADD","#EF9F27","#D4537E"];

  const particles = Array.from({ length: 100 }, () => ({
    x: originX,
    y: originY,
    vx: (Math.random() - 0.5) * 20,
    vy: (Math.random() - 0.5) * 20 - 3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    life: 1,
    decay: 0.02 + Math.random() * 0.01,
  }));

  let animId;

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach((p) => {
      if (p.life <= 0) return;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4;
      p.life -= p.decay;
      alive = true;

      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 8, 8);
    });

    ctx.globalAlpha = 1;

    if (alive) {
      animId = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animId);
      canvas.remove();
    }
  }

  animate();
}