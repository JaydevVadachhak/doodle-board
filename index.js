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
const roomIdDisplay = document.getElementById("roomId");
const userCountDisplay = document.getElementById("userCount");
const undoButton = document.getElementById("undoButton");
const redoButton = document.getElementById("redoButton");
const shareButton = document.getElementById("shareButton");
const publicCheckbox = document.getElementById("publicCheckbox");
const drawingNameInput = document.getElementById("drawingName");
const magnification = 1.5; // Adjust the magnification factor as needed
let shapeStartX, shapeStartY;
let currentTool = "pencil";
let isErasing = false;
let isDrawing = false;
let currentColor = colorPicker.value;
let currentBrushSize = parseInt(brushSize.value);
let currentEraserSize = parseInt(eraserSizeInput.value);

// Undo/redo history
let drawHistory = [];
let redoHistory = [];
let currentDrawingState = null;
let maxHistoryLength = 20;

// Room and socket variables
let socket;
let roomId = generateRoomId();
let userId = null;

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
  context.strokeStyle = currentColor;
  context.lineWidth = currentBrushSize;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();

  const x = e.clientX - canvas.offsetLeft;
  const y = e.clientY - canvas.offsetTop;

  context.moveTo(x, y);

  // Start a new pencil stroke event
  currentDrawingState = {
    type: 'pencil',
    color: currentColor,
    size: currentBrushSize,
    points: [{ x, y }]
  };
}

function draw(e) {
  if (!isDrawing || currentTool !== "pencil") return;

  const x = e.clientX - canvas.offsetLeft;
  const y = e.clientY - canvas.offsetTop;

  context.lineTo(x, y);
  context.stroke();

  // Add point to current drawing state
  if (currentDrawingState) {
    currentDrawingState.points.push({ x, y });
  }
}

function stopDrawing() {
  if (currentTool !== "pencil" || !isDrawing) return;
  isDrawing = false;
  context.closePath();

  // Emit the drawing event
  if (currentDrawingState && currentDrawingState.points.length > 1) {
    emitDrawEvent(currentDrawingState);
    saveDrawingState();
  }

  currentDrawingState = null;
}

function startErasing(e) {
  if (currentTool !== "eraser") return;
  isErasing = true;
  context.globalCompositeOperation = "destination-out";
  context.lineWidth = currentEraserSize;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();

  const x = e.clientX - canvas.offsetLeft;
  const y = e.clientY - canvas.offsetTop;

  context.moveTo(x, y);

  // Start a new eraser stroke event
  currentDrawingState = {
    type: 'eraser',
    size: currentEraserSize,
    points: [{ x, y }]
  };
}

function erase(e) {
  if (!isErasing || currentTool !== "eraser") return;

  const x = e.clientX - canvas.offsetLeft;
  const y = e.clientY - canvas.offsetTop;

  context.lineTo(x, y);
  context.stroke();

  // Add point to current drawing state
  if (currentDrawingState) {
    currentDrawingState.points.push({ x, y });
  }
}

function stopErasing() {
  if (currentTool !== "eraser" || !isErasing) return;
  isErasing = false;
  context.closePath();
  context.globalCompositeOperation = "source-over";

  // Emit the erasing event
  if (currentDrawingState && currentDrawingState.points.length > 1) {
    emitDrawEvent(currentDrawingState);
    saveDrawingState();
  }

  currentDrawingState = null;
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

  // Save canvas state before drawing shape
  saveCanvasState();
}

function drawShape(e) {
  if (!isDrawing || (currentTool !== "rectangle" && currentTool !== "line" && currentTool !== "circle")) return;

  // Restore canvas to state before shape drawing
  restoreCanvasState();

  const currentX = e.clientX - canvas.offsetLeft;
  const currentY = e.clientY - canvas.offsetTop;

  context.strokeStyle = currentColor;
  context.lineWidth = currentBrushSize;
  context.beginPath();

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
      context.arc(shapeStartX, shapeStartY, Math.sqrt(
        Math.pow(currentX - shapeStartX, 2) +
        Math.pow(currentY - shapeStartY, 2)
      ), 0, 2 * Math.PI);
      break;
    default:
      break;
  }
  context.stroke();
}

function stopDrawingShape(e) {
  if (!isDrawing || (currentTool !== "rectangle" && currentTool !== "line" && currentTool !== "circle")) return;

  isDrawing = false;

  const currentX = e.clientX - canvas.offsetLeft;
  const currentY = e.clientY - canvas.offsetTop;

  // Create shape event
  const shapeEvent = {
    type: 'shape',
    shape: currentTool,
    color: currentColor,
    size: currentBrushSize,
    startX: shapeStartX,
    startY: shapeStartY,
    endX: currentX,
    endY: currentY
  };

  // Emit the shape event
  emitDrawEvent(shapeEvent);
  saveDrawingState();
}

function handleTouchStart(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent("mousedown", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
}

function handleTouchMove(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent("mousemove", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
}

function handleTouchEnd(e) {
  e.preventDefault();
  const mouseEvent = new MouseEvent("mouseup", {});
  canvas.dispatchEvent(mouseEvent);
}

colorPicker.addEventListener("change", (e) => {
  currentColor = e.target.value;
});

brushSize.addEventListener("change", (e) => {
  currentBrushSize = parseInt(e.target.value);
});

clearButton.addEventListener("click", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  emitClearCanvas();
  saveDrawingState();
});

saveButton.addEventListener("click", () => {
  if (drawingNameInput.value.trim() === '') {
    showNotification('Please enter a name for your drawing');
    return;
  }

  // Save to server for collaboration
  emitSaveDrawing();

  // Also allow local download
  const image = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = image;
  link.download = `${drawingNameInput.value || 'my_doodle'}.png`;
  link.click();
});

eraserSizeInput.addEventListener("change", (e) => {
  currentEraserSize = parseInt(e.target.value);
});

toolSelector.addEventListener("change", (e) => {
  currentTool = e.target.value;
  context.globalCompositeOperation = "source-over";
});

shareButton.addEventListener("click", () => {
  const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(url)
      .then(() => {
        showNotification('Room link copied to clipboard!');
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
        promptShareLink(url);
      });
  } else {
    promptShareLink(url);
  }
});

function promptShareLink(url) {
  const shareDialog = document.getElementById("shareDialog");
  const shareLink = document.getElementById("shareLink");

  shareLink.value = url;
  shareDialog.style.display = "flex";

  shareLink.select();
}

document.getElementById("closeShareDialog").addEventListener("click", () => {
  document.getElementById("shareDialog").style.display = "none";
});

// Undo/Redo functionality
undoButton.addEventListener("click", undo);
redoButton.addEventListener("click", redo);

function undo() {
  if (drawHistory.length <= 1) return;

  // Move current state to redo history
  redoHistory.push(drawHistory.pop());

  // Restore previous state
  const previousState = drawHistory[drawHistory.length - 1];
  restoreDrawingState(previousState);

  // Update button states
  updateUndoRedoButtons();
}

function redo() {
  if (redoHistory.length === 0) return;

  // Get the next state from redo history
  const nextState = redoHistory.pop();

  // Apply it and add to draw history
  restoreDrawingState(nextState);
  drawHistory.push(nextState);

  // Update button states
  updateUndoRedoButtons();
}

function saveDrawingState() {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  // Add to history
  drawHistory.push(imageData);

  // Clear redo history when a new action is performed
  redoHistory = [];

  // Limit history size
  if (drawHistory.length > maxHistoryLength) {
    drawHistory.shift();
  }

  // Update button states
  updateUndoRedoButtons();
}

function restoreDrawingState(imageData) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.putImageData(imageData, 0, 0);
}

function updateUndoRedoButtons() {
  undoButton.disabled = drawHistory.length <= 1;
  redoButton.disabled = redoHistory.length === 0;
}

// Canvas state for shape preview
let canvasState;

function saveCanvasState() {
  canvasState = context.getImageData(0, 0, canvas.width, canvas.height);
}

function restoreCanvasState() {
  if (canvasState) {
    context.putImageData(canvasState, 0, 0);
  }
}

// Initialize the application
function init() {
  // Set up socket connection
  initializeSocket();

  // Set up initial drawing state
  saveDrawingState();

  // Update URL with room ID
  window.history.replaceState(null, '', `?room=${roomId}`);

  // Set up responsive canvas
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  const container = document.querySelector('.canvas-container');
  const containerWidth = container.clientWidth;

  // Save current drawing
  const currentDrawing = context.getImageData(0, 0, canvas.width, canvas.height);

  // Resize canvas (keeping aspect ratio)
  const aspectRatio = canvas.height / canvas.width;
  const newWidth = Math.min(containerWidth - 20, 1000); // Max width 1000px, with some padding
  const newHeight = newWidth * aspectRatio;

  canvas.width = newWidth;
  canvas.height = newHeight;

  // Restore drawing
  context.putImageData(currentDrawing, 0, 0);
}

// Start the application
window.addEventListener('load', init);

function initializeSocket() {
  socket = io();

  socket.on('connect', () => {
    userId = socket.id;
    joinRoom(roomId);
  });

  socket.on('initialDrawing', (drawingEvents) => {
    // Clear canvas and replay all drawing events
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawingEvents.forEach(event => {
      applyDrawEvent(event);
    });
    saveDrawingState();
  });

  socket.on('drawEvent', (event) => {
    applyDrawEvent(event);
  });

  socket.on('clearCanvas', () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    saveDrawingState();
  });

  socket.on('userJoined', (data) => {
    updateUserCount(data.userCount);
  });

  socket.on('userLeft', (data) => {
    updateUserCount(data.userCount);
  });

  socket.on('drawingSaved', (response) => {
    if (response.success) {
      showNotification('Drawing saved successfully!');
    }
  });
}

function joinRoom(newRoomId) {
  roomId = newRoomId;
  socket.emit('joinRoom', roomId);
  roomIdDisplay.textContent = roomId;
}

function generateRoomId() {
  // Get room ID from URL or generate a new one
  const urlParams = new URLSearchParams(window.location.search);
  const roomFromUrl = urlParams.get('room');

  if (roomFromUrl) {
    return roomFromUrl;
  }

  // Generate a random 6-character room ID
  return Math.random().toString(36).substring(2, 8);
}

function updateUserCount(count) {
  userCountDisplay.textContent = count;
}

function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

function applyDrawEvent(event) {
  switch (event.type) {
    case 'pencil':
      drawPencilStroke(event);
      break;
    case 'eraser':
      drawEraserStroke(event);
      break;
    case 'shape':
      drawShapeFromEvent(event);
      break;
  }
}

function drawPencilStroke(event) {
  context.strokeStyle = event.color;
  context.lineWidth = event.size;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();

  const points = event.points;
  if (points.length < 2) return;

  context.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    context.lineTo(points[i].x, points[i].y);
  }

  context.stroke();
  context.closePath();
}

function drawEraserStroke(event) {
  context.globalCompositeOperation = "destination-out";
  context.lineWidth = event.size;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();

  const points = event.points;
  if (points.length < 2) return;

  context.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    context.lineTo(points[i].x, points[i].y);
  }

  context.stroke();
  context.closePath();
  context.globalCompositeOperation = "source-over";
}

function drawShapeFromEvent(event) {
  context.strokeStyle = event.color;
  context.lineWidth = event.size;
  context.beginPath();

  switch (event.shape) {
    case "rectangle":
      context.rect(
        event.startX,
        event.startY,
        event.endX - event.startX,
        event.endY - event.startY
      );
      break;
    case "line":
      context.moveTo(event.startX, event.startY);
      context.lineTo(event.endX, event.endY);
      break;
    case "circle":
      context.arc(event.startX, event.startY, Math.sqrt(
        Math.pow(event.endX - event.startX, 2) +
        Math.pow(event.endY - event.startY, 2)
      ), 0, 2 * Math.PI);
      break;
  }
  context.stroke();
}

function emitDrawEvent(eventData) {
  if (socket?.connected) {
    socket.emit('drawEvent', {
      roomId: roomId,
      event: eventData
    });
  }
}

function emitClearCanvas() {
  if (socket?.connected) {
    socket.emit('clearCanvas', roomId);
  }
}

function emitSaveDrawing() {
  if (socket?.connected) {
    socket.emit('saveDrawing', {
      roomId: roomId,
      name: drawingNameInput.value,
      public: publicCheckbox.checked
    });
  }
}
