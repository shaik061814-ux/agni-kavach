const nodes = [
  {
    id: "battery",
    label: "Battery",
    x: 120,
    y: 150,
    size: 52,
    color: "#4fc3ff",
    detail: "Power source supplying the controller and control path used in the prototype concept."
  },
  {
    id: "valve",
    label: "Solenoid Valve",
    x: 690,
    y: 120,
    size: 44,
    color: "#ff7d6b",
    detail: "Normally closed valve acting as the proposed emergency fuel shut-off element."
  },
  {
    id: "arduino",
    label: "Arduino Uno",
    x: 380,
    y: 300,
    size: 86,
    color: "#7ed6ff",
    detail: "Main processing board reading the sensor inputs and directing the output response."
  },
  {
    id: "sensor",
    label: "Gas Sensor",
    x: 705,
    y: 300,
    size: 32,
    color: "#7df0bc",
    detail: "Gas detection module used as the early-warning input in the concept layout."
  },
  {
    id: "buzzer",
    label: "Buzzer",
    x: 150,
    y: 430,
    size: 30,
    color: "#ffd166",
    detail: "Audible alarm output used to signal a warning condition."
  },
  {
    id: "lcd",
    label: "LCD Display",
    x: 330,
    y: 480,
    size: 34,
    color: "#c2e3ff",
    detail: "Status display showing state, warning, and system readiness information."
  },
  {
    id: "relay",
    label: "Relay",
    x: 565,
    y: 440,
    size: 28,
    color: "#ff9b75",
    detail: "Switching element connecting the controller signal path to the valve and alarm action."
  }
];

const connections = [
  { from: "battery", to: "arduino" },
  { from: "battery", to: "buzzer" },
  { from: "sensor", to: "arduino" },
  { from: "arduino", to: "buzzer" },
  { from: "arduino", to: "lcd" },
  { from: "arduino", to: "relay" },
  { from: "relay", to: "valve" }
];

const nodeMap = Object.fromEntries(nodes.map(node => [node.id, node]));
const svg = document.getElementById("diagramSvg");
const nodeTitle = document.getElementById("nodeTitle");
const nodeText = document.getElementById("nodeText");

let selectedId = "arduino";
let zoomLevel = 1;
let offsetX = 0;
let offsetY = 0;
let dragState = null;

function playSignal() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "square";
  oscillator.frequency.value = 680;
  gain.gain.value = 0.04;

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.12);

  if ("vibrate" in navigator) {
    navigator.vibrate(80);
  }
}

function updateInfo() {
  const node = nodeMap[selectedId];
  nodeTitle.textContent = node.label;
  nodeText.textContent = node.detail;
}

function render() {
  svg.innerHTML = "";

  const wireGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svg.appendChild(wireGroup);

  connections.forEach(({ from, to }) => {
    const a = nodeMap[from];
    const b = nodeMap[to];
    const active = selectedId === from || selectedId === to;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const cx1 = (a.x + b.x) / 2;
    const cx2 = (a.x + b.x) / 2;

    path.setAttribute("d", `M ${a.x} ${a.y} C ${cx1} ${a.y}, ${cx2} ${b.y}, ${b.x} ${b.y}`);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", active ? "#8fe9ff" : "#4c687d");
    path.setAttribute("stroke-width", active ? "4.5" : "2.5");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-dasharray", active ? "0" : "10 10");
    path.setAttribute("opacity", active ? "1" : "0.78");

    wireGroup.appendChild(path);
  });

  const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svg.appendChild(nodeGroup);

  nodes.forEach((node) => {
    const active = selectedId === node.id;

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.style.cursor = "pointer";

    const glow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    glow.setAttribute("cx", node.x);
    glow.setAttribute("cy", node.y);
    glow.setAttribute("r", node.size + (active ? 18 : 10));
    glow.setAttribute("fill", node.color);
    glow.setAttribute("opacity", active ? "0.32" : "0.12");

    const box = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    box.setAttribute("x", node.x - node.size);
    box.setAttribute("y", node.y - node.size);
    box.setAttribute("width", node.size * 2);
    box.setAttribute("height", node.size * 2);
    box.setAttribute("rx", node.id === "arduino" ? 18 : 16);
    box.setAttribute("fill", "#0d1b24");
    box.setAttribute("stroke", active ? "#9deeff" : node.color);
    box.setAttribute("stroke-width", active ? "3.5" : "2.5");
    box.setAttribute("filter", active ? "drop-shadow(0 0 16px rgba(143,233,255,0.9))" : "none");

    const centerText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    centerText.setAttribute("x", node.x);
    centerText.setAttribute("y", node.y + 6);
    centerText.setAttribute("font-size", node.id === "arduino" ? "18" : "10");
    centerText.setAttribute("font-weight", active ? "700" : "600");
    centerText.setAttribute("text-anchor", "middle");
    centerText.setAttribute("font-family", "Segoe UI, sans-serif");
    centerText.setAttribute("fill", active ? "#ffffff" : "#eaf9ff");
    centerText.textContent = node.id === "arduino" ? "UNO" : node.label.slice(0, 2).toUpperCase();

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", node.x);
    label.setAttribute("y", node.y + node.size + 22);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-size", "11");
    label.setAttribute("font-family", "Segoe UI, sans-serif");
    label.setAttribute("fill", active ? "#ffffff" : "#eaf9ff");
    label.textContent = node.label;

    group.appendChild(glow);
    group.appendChild(box);
    group.appendChild(centerText);
    group.appendChild(label);

    group.addEventListener("click", () => {
      selectedId = node.id;
      updateInfo();
      render();
      playSignal();
    });

    nodeGroup.appendChild(group);
  });

  updateInfo();
  svg.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${zoomLevel})`;
}

svg.addEventListener("wheel", (event) => {
  event.preventDefault();
  const delta = event.deltaY > 0 ? -0.08 : 0.08;
  zoomLevel = Math.min(2.2, Math.max(0.7, Number((zoomLevel + delta).toFixed(2))));
  render();
});

svg.addEventListener("pointerdown", (event) => {
  dragState = {
    startX: event.clientX,
    startY: event.clientY,
    lastX: offsetX,
    lastY: offsetY
  };
});

svg.addEventListener("pointermove", (event) => {
  if (!dragState) return;
  const dx = event.clientX - dragState.startX;
  const dy = event.clientY - dragState.startY;
  offsetX = dragState.lastX + dx;
  offsetY = dragState.lastY + dy;
  render();
});

svg.addEventListener("pointerup", () => {
  dragState = null;
});

svg.addEventListener("pointerleave", () => {
  dragState = null;
});

const revealElements = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.1 }
);

revealElements.forEach((el) => observer.observe(el));

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

navToggle.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!isOpen));
  navLinks.classList.toggle("is-open");
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navToggle.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("is-open");
  });
});

document.addEventListener("mousemove", (e) => {
  document.documentElement.style.setProperty("--pointer-x", `${e.clientX}px`);
  document.documentElement.style.setProperty("--pointer-y", `${e.clientY}px`);
  document.body.classList.add("has-pointer");
});

document.addEventListener("mouseleave", () => {
  document.body.classList.remove("has-pointer");
});

render();
