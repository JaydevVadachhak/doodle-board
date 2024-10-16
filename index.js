const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const magnifier = document.getElementById("magnifier");
const magnifierCtx = magnifier.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
const clearButton = document.getElementById("clearButton");
const saveButton = document.getElementById("saveButton");
const eraserSizeInput = document.getElementById("eraserSize");
const toolSelector = document.getElementById("toolSelector");
const magnification = 1.5; // Adjust the magnification factor as needed
let shapeStartX, shapeStartY;
let currentTool = "pencil";
let isErasing = false;
let isDrawing = false;

canvas.addEventListener("mousemove", showMagnifier);
canvas.addEventListener("mouseout", hideMagnifier);

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);

canvas.addEventListener("touchstart", handleTouchStart);
canvas.addEventListener("touchmove", handleTouchMove);
canvas.addEventListener("touchend", handleTouchEnd);

canvas.addEventListener("mousedown", startErasing);
canvas.addEventListener("mousemove", erase);
canvas.addEventListener("mouseup", stopErasing);
canvas.addEventListener("mouseout", stopErasing);

canvas.addEventListener("mousedown", startDrawingShape);
canvas.addEventListener("mousemove", drawShape);
canvas.addEventListener("mouseup", stopDrawingShape);
canvas.addEventListener("mouseout", stopDrawingShape);

function showMagnifier(e) {
  magnifier.style.display = "block";
  const x = e.clientX - canvas.offsetLeft;
  const y = e.clientY - canvas.offsetTop;

  magnifierCtx.clearRect(0, 0, magnifier.width, magnifier.height);
  magnifierCtx.drawImage(
    canvas,
    x - 50,
    y - 50,
    magnifier.width * magnification,
    magnifier.height * magnification,
    0,
    0,
    magnifier.width,
    magnifier.height
  );

  magnifier.style.left = `${e.clientX + 10}px`;
  magnifier.style.top = `${e.clientY + 10}px`;
}

function hideMagnifier() {
  magnifier.style.display = "none";
}

function startDrawing(e) {
  if (currentTool !== "pencil") return;
  isDrawing = true;
  context.strokeStyle = colorPicker.value;
  context.lineWidth = parseInt(brushSize.value);
  context.beginPath();
  context.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
}

function draw(e) {
  if (!isDrawing || currentTool !== "pencil") return;
  context.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
  context.stroke();
}

function stopDrawing() {
  if (currentTool !== "pencil") return;
  isDrawing = false;
  context.closePath();
}

function startErasing(e) {
  if (currentTool !== "eraser") return;
  isErasing = true;
  context.beginPath();
  context.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
}

function erase(e) {
  if (!isErasing || currentTool !== "eraser") return;
  context.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
  context.stroke();
}

function stopErasing() {
  if (currentTool !== "eraser") return;
  isErasing = false;
  context.closePath();
}

function startDrawingShape(e) {
  if (
    currentTool !== "rectangle" &&
    currentTool !== "line" &&
    currentTool !== "circle"
  ) {
    return;
  }
  isDrawing = true;
  shapeStartX = e.clientX - canvas.offsetLeft;
  shapeStartY = e.clientY - canvas.offsetTop;
  context.beginPath();
}

function drawShape(e) {
  if (!isDrawing) return;
  //   context.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas for shape preview
  const currentX = e.clientX - canvas.offsetLeft;
  const currentY = e.clientY - canvas.offsetTop;

  switch (currentTool) {
    case "rectangle":
      context.rect(
        shapeStartX,
        shapeStartY,
        currentX - shapeStartX,
        currentY - shapeStartY
      );
      break;
    case "line":
      context.moveTo(shapeStartX, shapeStartY);
      context.lineTo(currentX, currentY);
      break;
    case "circle":
      const radius = Math.sqrt(
        Math.pow(currentX - shapeStartX, 2) +
          Math.pow(currentY - shapeStartY, 2)
      );
      context.arc(shapeStartX, shapeStartY, radius, 0, 2 * Math.PI);
      break;
  }
  context.stroke();
}

function stopDrawingShape() {
  if (!isDrawing) return;
  isDrawing = false;
  context.closePath();
  //   context.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas for final shape
}

function handleTouchStart(e) {
  const touch = e.touches[0];
  if (currentTool === "pencil") {
    startDrawing(
      touch.clientX - canvas.offsetLeft,
      touch.clientY - canvas.offsetTop
    );
  } else if (currentTool === "eraser") {
    startErasing(
      touch.clientX - canvas.offsetLeft,
      touch.clientY - canvas.offsetTop
    );
  }
  e.preventDefault();
}

function handleTouchMove(e) {
  const touch = e.touches[0];
  if (currentTool === "pencil") {
    draw(touch.clientX - canvas.offsetLeft, touch.clientY - canvas.offsetTop);
  } else if (currentTool === "eraser") {
    erase(touch.clientX - canvas.offsetLeft, touch.clientY - canvas.offsetTop);
  }
  e.preventDefault();
}

function handleTouchEnd() {
  if (currentTool === "pencil") {
    stopDrawing();
  } else if (currentTool === "eraser") {
    stopErasing();
  }
}

colorPicker.addEventListener("change", (e) => {
  context.strokeStyle = e.target.value;
});

brushSize.addEventListener("change", (e) => {
  context.lineWidth = parseInt(e.target.value);
});

clearButton.addEventListener("click", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
});

saveButton.addEventListener("click", () => {
  const image = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = image;
  link.download = "my_doodle.png";
  link.click();
});

eraserSizeInput.addEventListener("change", (e) => {
  context.lineWidth = parseInt(e.target.value);
});

toolSelector.addEventListener("change", (e) => {
  currentTool = e.target.value;
  context.globalCompositeOperation =
    currentTool === "eraser" ? "destination-out" : "source-over";
});
