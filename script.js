/* =======================
   CANVAS SETUP
======================= */
const canvas = new fabric.Canvas("canvas", {
  isDrawingMode: true
});

const TOOLBAR_HEIGHT = 60;

canvas.setWidth(window.innerWidth);
canvas.setHeight(window.innerHeight - TOOLBAR_HEIGHT);

canvas.freeDrawingBrush.width = 8;
canvas.freeDrawingBrush.color = "#000000";

// Redimensionar ao mudar tela
window.addEventListener("resize", () => {
  canvas.setWidth(window.innerWidth);
  canvas.setHeight(window.innerHeight - TOOLBAR_HEIGHT);
  canvas.renderAll();
});

/* =======================
   IMAGEM BASE
======================= */
fabric.Image.fromURL("assets/desenho.png", img => {
  img.selectable = false;
  img.evented = false;
  img.left = 0;
  img.top = 0;
  canvas.add(img);
  canvas.sendToBack(img);
});

/* =======================
   PALETA BOBBIE GOODS
======================= */
const bobbieColors = [
  "#F6C1CC", "#FFD6A5", "#BEE1E6",
  "#CDB4DB", "#BDB2FF", "#FFADAD",
  "#A3C4BC", "#FFF1A8", "#000000"
];

const palette = document.getElementById("palette");

bobbieColors.forEach(color => {
  const el = document.createElement("div");
  el.className = "color";
  el.style.background = color;
  el.onclick = () => {
    canvas.freeDrawingBrush.color = color;
    canvas.isDrawingMode = true;
    fillMode = false;
  };
  palette.appendChild(el);
});

/* =======================
   FERRAMENTAS
======================= */
let fillMode = false;

document.getElementById("brush").onclick = () => {
  canvas.isDrawingMode = true;
  fillMode = false;
};

document.getElementById("eraser").onclick = () => {
  canvas.isDrawingMode = true;
  canvas.freeDrawingBrush.color = "#f6f2ec";
  fillMode = false;
};

document.getElementById("bucket").onclick = () => {
  fillMode = true;
  canvas.isDrawingMode = false;
};

/* =======================
   ZOOM
======================= */
let zoom = 1;

document.getElementById("zoomIn").onclick = () => {
  zoom = Math.min(3, zoom + 0.1);
  canvas.setZoom(zoom);
};

document.getElementById("zoomOut").onclick = () => {
  zoom = Math.max(0.5, zoom - 0.1);
  canvas.setZoom(zoom);
};

/* =======================
   SALVAR IMAGEM
======================= */
document.getElementById("save").onclick = () => {
  const link = document.createElement("a");
  link.download = "meu-desenho.png";
  link.href = canvas.toDataURL({
    format: "png",
    multiplier: 1
  });
  link.click();
};

/* =======================
   BALDE DE TINTA (FLOOD FILL)
======================= */
canvas.on("mouse:down", opt => {
  if (!fillMode) return;

  const p = canvas.getPointer(opt.e);
  floodFill(
    Math.floor(p.x),
    Math.floor(p.y),
    canvas.freeDrawingBrush.color
  );

  fillMode = false;
});

function floodFill(x, y, hex) {
  const ctx = canvas.lowerCanvasEl.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  const img = ctx.getImageData(0, 0, width, height);
  const data = img.data;

  const target = getPixel(data, x, y, width);
  const fill = hexToRgba(hex);

  if (colorsMatch(target, fill)) return;

  const stack = [[x, y]];

  while (stack.length) {
    const [cx, cy] = stack.pop();

    if (cx < 0 || cy < 0 || cx >= width || cy >= height) continue;

    const idx = (cy * width + cx) * 4;

    const current = [
      data[idx],
      data[idx + 1],
      data[idx + 2],
      data[idx + 3]
    ];

    if (!colorsMatch(current, target)) continue;

    data[idx]     = fill[0];
    data[idx + 1] = fill[1];
    data[idx + 2] = fill[2];
    data[idx + 3] = 255;

    stack.push([cx + 1, cy]);
    stack.push([cx - 1, cy]);
    stack.push([cx, cy + 1]);
    stack.push([cx, cy - 1]);
  }

  ctx.putImageData(img, 0, 0);
}

function getPixel(data, x, y, width) {
  const i = (y * width + x) * 4;
  return [
    data[i],
    data[i + 1],
    data[i + 2],
    data[i + 3]
  ];
}

function hexToRgba(hex) {
  hex = hex.replace("#", "");
  return [
    parseInt(hex.substring(0, 2), 16),
    parseInt(hex.substring(2, 4), 16),
    parseInt(hex.substring(4, 6), 16),
    255
  ];
}

function colorsMatch(a, b) {
  return a[0] === b[0] &&
         a[1] === b[1] &&
         a[2] === b[2];
}

/* =======================
   PRESENTES + MODAIS
======================= */
document.querySelectorAll(".gift").forEach(gift => {
  gift.addEventListener("click", () => {
    gift.classList.add("opening");

    setTimeout(() => {
      const modalId = gift.dataset.modal;
      const modal = document.getElementById(modalId);
      if (modal) modal.style.display = "flex";
      gift.classList.remove("opening");
    }, 350);
  });
});

document.querySelectorAll(".close").forEach(btn => {
  btn.addEventListener("click", () => {
    const modal = btn.closest(".modal");
    if (modal) modal.style.display = "none";
  });
});
