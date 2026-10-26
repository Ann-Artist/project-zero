/**
 * PROJECT ZERO — Final Room: Birthday Reward Vault (2D Canvas)
 * Celebratory 2D confetti particle system, radiant spotlights,
 * and high-impact metallic engineering trophy illustration.
 */

export class VaultRoom2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.isActive = false;
    this.particles = [];
  }

  start() {
    this.isActive = true;
    this.particles = [];

    // Create 120 colorful celebratory confetti particles
    const colors = ['#ffd700', '#00e676', '#38bdf8', '#ff9100', '#ec4899', '#ffffff'];
    for (let i = 0; i < 120; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * -this.canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: 2 + Math.random() * 4,
        size: 5 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1
      });
    }
  }

  stop() {
    this.isActive = false;
    this.particles = [];
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  update(delta) {
    if (!this.isActive || !this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;

      if (p.y > this.canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * this.canvas.width;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
  }
}
