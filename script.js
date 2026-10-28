(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const WA = "201225528300";

  $("#year").textContent = new Date().getFullYear();

  /* theme */
  const themeBtn = $("#theme");
  const isDark = () => root.dataset.theme === "dark" ||
    (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
  const paintTheme = () => { themeBtn.textContent = isDark() ? "☀" : "☾"; };
  paintTheme();
  themeBtn.addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
    paintTheme();
  });

  /* mobile menu */
  const links = $("#links"), burger = $("#burger");
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  });
  links.addEventListener("click", e => {
    if (e.target.closest("a")) { links.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
  });

  /* scroll progress + active link */
  const bar = $("#progress");
  const secs = [...document.querySelectorAll("main section[id]")];
  const anchors = [...links.querySelectorAll("a")];
  const onScroll = () => {
    const h = root.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    let cur = "";
    secs.forEach(s => { if (scrollY >= s.offsetTop - 140) cur = s.id; });
    anchors.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + cur));
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* typed code window */
  const codeEl = $("#code");
  const lines = [
    [["c", "// مطور ويب"]],
    [["k", "const "], ["p", "bakr"], ["", " = {"]],
    [["", "  name: "], ["s", '"Bakr Al-Azoumi"'], ["", ","]],
    [["", "  role: "], ["s", '"Web Developer"'], ["", ","]],
    [["", "  builds: ["], ["s", '"fast"'], ["", ", "], ["s", '"secure"'], ["", ", "], ["s", '"clear"'], ["", "],"]],
    [["", "  available: "], ["b", "true"], ["", ","]],
    [["", "};"]]
  ];
  const esc = t => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const render = n => {               // n = number of characters shown
    let out = "", left = n;
    for (const line of lines) {
      for (const [cls, txt] of line) {
        if (left <= 0) return out;
        const part = txt.slice(0, left); left -= txt.length;
        out += cls ? `<span class="${cls}">${esc(part)}</span>` : esc(part);
      }
      out += "\n"; left -= 1;
    }
    return out;
  };
  const total = lines.reduce((a, l) => a + l.reduce((b, [, t]) => b + t.length, 0) + 1, 0);
  const clock = $("#clock");
  if (reduce) { codeEl.innerHTML = render(total); clock.textContent = "Ln " + lines.length; }
  else {
    let i = 0;
    const tick = () => {
      codeEl.innerHTML = render(++i);
      clock.textContent = "Ln " + (codeEl.textContent.split("\n").length);
      if (i < total) setTimeout(tick, 38);
    };
    setTimeout(tick, 700);
  }

  /* GitHub repos */
  const list = $("#repos");
  const empty = msg => { list.innerHTML = ""; const li = document.createElement("li"); li.className = "repo-empty"; li.textContent = msg; list.append(li); };
  const fmt = d => new Date(d).toLocaleDateString("ar-EG", { year: "numeric", month: "short" });
  fetch("https://api.github.com/users/bkr800634-gif/repos?sort=updated&per_page=30")
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(repos => {
      const own = repos.filter(r => !r.fork).slice(0, 6);
      if (!own.length) return empty("لا توجد مشاريع عامة بعد. تابع حسابي على GitHub قريباً.");
      list.innerHTML = "";
      own.forEach(r => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.className = "repo"; a.href = r.html_url; a.target = "_blank"; a.rel = "noopener";
        const name = document.createElement("b"); name.textContent = r.name;
        const d = document.createElement("span"); d.className = "d"; d.textContent = r.description || "مشروع على GitHub";
        const meta = document.createElement("span"); meta.className = "meta";
        if (r.language) { const l = document.createElement("span"); l.className = "lang"; l.innerHTML = "<i></i>"; l.append(r.language); meta.append(l); }
        if (r.stargazers_count) { const s = document.createElement("span"); s.textContent = "★ " + r.stargazers_count; meta.append(s); }
        const u = document.createElement("span"); u.textContent = fmt(r.pushed_at); meta.append(u);
        a.append(name, d, meta); li.append(a); list.append(li);
      });
    })
    .catch(() => empty("تعذر تحميل المشاريع الآن. يمكنك مشاهدتها مباشرة على GitHub."));

  /* copy number */
  const copyBtn = $("#copy");
  copyBtn.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText("01225528300"); copyBtn.textContent = "تم النسخ"; }
    catch (e) { copyBtn.textContent = "01225528300"; }
    setTimeout(() => (copyBtn.textContent = "نسخ رقم الواتساب"), 2000);
  });

  /* form -> WhatsApp */
  $("#form").addEventListener("submit", e => {
    e.preventDefault();
    const msg = `مرحباً بكر، أنا ${$("#fname").value.trim()}.\nنوع المشروع: ${$("#ftype").value}\nالتفاصيل: ${$("#fmsg").value.trim()}`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  });
})();