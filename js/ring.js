(() => {
  const cosmos = document.getElementById("cosmos");
  const rail = document.getElementById("rail");
  const lanes = document.getElementById("lanes");
  const clasp = document.getElementById("clasp");
  const champ = document.getElementById("champ");
  const champImg = champ ? champ.querySelector("img") : null;
  const copyCa = document.getElementById("copyCa");
  const copyCaLabel = document.getElementById("copyCaLabel");

  const stars = [];
  const motes = [];
  const streaks = [];
  let width = 0;
  let height = 0;
  let ctx = null;
  let raf = 0;

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    cosmos.width = Math.floor(width * devicePixelRatio);
    cosmos.height = Math.floor(height * devicePixelRatio);
    cosmos.style.width = `${width}px`;
    cosmos.style.height = `${height}px`;
    ctx = cosmos.getContext("2d");
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  };

  const seedSky = () => {
    stars.length = 0;
    motes.length = 0;
    streaks.length = 0;
    const starCount = Math.min(160, Math.floor(width / 10));
    for (let i = 0; i < starCount; i += 1) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.3,
        tw: Math.random() * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.02,
        tint: Math.random() > 0.82 ? "gold" : Math.random() > 0.7 ? "cyan" : "ice",
      });
    }
    const moteCount = Math.min(36, Math.floor(width / 40));
    for (let i = 0; i < moteCount; i += 1) {
      motes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        s: 2 + Math.random() * 3,
        v: 0.12 + Math.random() * 0.35,
        a: 0.12 + Math.random() * 0.22,
        hue: Math.random() > 0.5 ? "rgba(94,200,255," : "rgba(240,196,90,",
      });
    }
  };

  const spawnStreak = () => {
    if (streaks.length > 2) return;
    streaks.push({
      x: Math.random() * width,
      y: Math.random() * height * 0.45,
      len: 70 + Math.random() * 90,
      life: 0,
      max: 48 + Math.random() * 24,
    });
  };

  const draw = (t) => {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    stars.forEach((star) => {
      const pulse = 0.35 + Math.abs(Math.sin(t * star.speed + star.tw)) * 0.65;
      ctx.beginPath();
      ctx.fillStyle =
        star.tint === "gold"
          ? `rgba(240,196,90,${pulse})`
          : star.tint === "cyan"
            ? `rgba(94,200,255,${pulse})`
            : `rgba(215,230,255,${pulse})`;
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    });

    motes.forEach((mote) => {
      mote.y -= mote.v;
      if (mote.y < -8) {
        mote.y = height + 8;
        mote.x = Math.random() * width;
      }
      ctx.fillStyle = `${mote.hue}${mote.a})`;
      ctx.fillRect(Math.round(mote.x), Math.round(mote.y), mote.s, mote.s);
    });

    streaks.forEach((streak, index) => {
      streak.life += 1;
      const p = streak.life / streak.max;
      ctx.strokeStyle = `rgba(240,196,90,${1 - p})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(streak.x, streak.y);
      ctx.lineTo(streak.x + streak.len, streak.y + streak.len * 0.35);
      ctx.stroke();
      if (streak.life > streak.max) streaks.splice(index, 1);
    });

    if (Math.random() < 0.008) spawnStreak();
    raf = requestAnimationFrame(draw);
  };

  if (cosmos) {
    resize();
    seedSky();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", () => {
      cancelAnimationFrame(raf);
      resize();
      seedSky();
      raf = requestAnimationFrame(draw);
    });
  }

  window.addEventListener("pointermove", (event) => {
    document.documentElement.style.setProperty("--mx", `${event.clientX}px`);
    document.documentElement.style.setProperty("--my", `${event.clientY}px`);

    if (champ && champImg) {
      const box = champ.getBoundingClientRect();
      const dx = (event.clientX - (box.left + box.width / 2)) / box.width;
      const dy = (event.clientY - (box.top + box.height / 2)) / box.height;
      champImg.style.transform = `translateY(${Math.sin(Date.now() / 900) * 2}px) rotateX(${(-dy * 8).toFixed(2)}deg) rotateY(${(dx * 10).toFixed(2)}deg)`;
    }
  });

  document.querySelectorAll(".tug").forEach((node) => {
    node.addEventListener("pointermove", (event) => {
      const box = node.getBoundingClientRect();
      const x = event.clientX - box.left - box.width / 2;
      const y = event.clientY - box.top - box.height / 2;
      node.style.transform = `translate(${x * 0.12}px, ${y * 0.16}px)`;
    });
    node.addEventListener("pointerleave", () => {
      node.style.transform = "";
    });
  });

  const markWait = () => {
    document.querySelectorAll("[data-wait]").forEach((node) => {
      node.style.setProperty("--wait", node.dataset.wait || "0");
    });
  };
  markWait();

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("in");
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".rise").forEach((node) => io.observe(node));

  const onScroll = () => {
    if (!rail) return;
    rail.classList.toggle("is-stuck", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (clasp && rail) {
    clasp.addEventListener("click", () => {
      rail.classList.toggle("open");
    });
    lanes?.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => rail.classList.remove("open"));
    });
  }

  if (copyCa) {
    copyCa.addEventListener("click", async () => {
      const value = copyCa.dataset.ca || "";
      try {
        await navigator.clipboard.writeText(value);
        if (copyCaLabel) copyCaLabel.textContent = "Copied";
      } catch {
        if (copyCaLabel) copyCaLabel.textContent = "Failed";
      }
      window.setTimeout(() => {
        if (copyCaLabel) copyCaLabel.textContent = "Copy";
      }, 1600);
    });
  }
})();
