let DATA = {}, KEYS = [];

const root = document.documentElement, main = document.getElementById("main"), tabs = document.getElementById("tabs");
const st = { tr: true, size: 0, theme: null };

try { Object.assign(st, JSON.parse(localStorage.getItem("doa") || "{}")); } catch (e) {}

const save = () => { try { localStorage.setItem("doa", JSON.stringify(st)); } catch (e) {} };
const dark = () => st.theme ? st.theme === "dark" : matchMedia("(prefers-color-scheme:dark)").matches;

// fungsi logika apply beberapa fitur
function apply() {
  if (st.theme) root.dataset.theme = st.theme;
  root.style.setProperty("--arab", (22 + st.size * 3) + "px");
  root.style.setProperty("--tr", (16 + st.size * 1.5) + "px");
  main.classList.toggle("hide-tr", !st.tr);
  document.getElementById("tTr").setAttribute("aria-pressed", st.tr);
  document.getElementById("tTheme").textContent = dark() ? "Mode terang" : "Mode gelap";
}

function copy(text, btn) {
  const done = () => { btn.textContent = "Tersalin"; setTimeout(() => btn.textContent = "Salin", 1500); };
  function fallback() {
    const a = document.createElement("textarea");
    a.value = text; document.body.appendChild(a); a.select();
    try { document.execCommand("copy"); done(); } catch (e) {}
    a.remove();
  }
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
  else fallback();
}

function render() {
  const k = KEYS.includes(location.hash.slice(1)) ? location.hash.slice(1) : KEYS[0], i = KEYS.indexOf(k);
  [...tabs.children].forEach((b, j) => j === i ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current"));
  main.innerHTML = "";

  const h = document.createElement("h2");
  h.textContent = "Bagian " + k + " · " + DATA[k].length + " doa";
  main.appendChild(h);

  DATA[k].forEach(d => {
    const c = document.createElement("article");
    c.className = "doa";
    c.innerHTML = '<h3></h3><p class="ar" lang="ar"></p><p class="tr"></p>';
    c.querySelector("h3").textContent = d.judul;
    c.querySelector(".ar").textContent = d.arab;
    c.querySelector(".tr").textContent = d.terjemahan;
    if (d.catatan) { const n = document.createElement("p"); n.className = "note"; n.textContent = d.catatan; c.appendChild(n); }

    const b = document.createElement("button");
    b.className = "cp"; b.textContent = "Salin";
    b.onclick = () => copy(d.judul + "\n\n" + d.arab + (st.tr ? "\n\n" + d.terjemahan : "") + (d.catatan ? "\n(" + d.catatan + ")" : ""), b);
    c.appendChild(b);
    main.appendChild(c);
  });

  const p = document.createElement("div");
  p.className = "pager";
  p.innerHTML = '<button id="prev"></button><button id="next"></button>';
  main.appendChild(p);
  const pv = p.querySelector("#prev"), nx = p.querySelector("#next");
  pv.textContent = "Bagian " + (KEYS[i - 1] || ""); pv.disabled = i === 0;
  nx.textContent = "Bagian " + (KEYS[i + 1] || ""); nx.disabled = i === KEYS.length - 1;
  pv.onclick = () => { location.hash = KEYS[i - 1]; };
  nx.onclick = () => { location.hash = KEYS[i + 1]; };
  window.scrollTo(0, 0);
}

document.getElementById("tTr").onclick = () => { st.tr = !st.tr; save(); apply(); };
document.getElementById("fMin").onclick = () => { st.size = Math.max(-2, st.size - 1); save(); apply(); };
document.getElementById("fMax").onclick = () => { st.size = Math.min(6, st.size + 1); save(); apply(); };
document.getElementById("tTheme").onclick = () => { st.theme = dark() ? "light" : "dark"; root.dataset.theme = st.theme; save(); apply(); };
apply();

fetch("doa.json")
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(data => {
    DATA = data; KEYS = Object.keys(data);
    KEYS.forEach(k => {
      const b = document.createElement("button");
      b.className = "tab"; b.textContent = k; b.setAttribute("aria-label", "Bagian " + k);
      b.onclick = () => { location.hash = k; };
      tabs.appendChild(b);
    });
    addEventListener("hashchange", render);
    render();
  })
  .catch(() => {
    main.innerHTML = '<p class="pesan">doa.json tidak bisa dimuat. Jalankan lewat server atau hosting, bukan dengan klik dua kali pada index.html. Pastikan juga isi doa.json valid.</p>';
  });
