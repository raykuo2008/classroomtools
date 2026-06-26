registerTool("seating", {
  render(container) {
    container.innerHTML = `
      <div class="card seating-card">
        <h2>🪑 座位編排</h2>
        <div class="tool-note" id="student-count"></div>

        <div class="seating-controls">
          <input id="rows" type="number" min="1" value="5" placeholder="列數" aria-label="列數">
          <input id="cols" type="number" min="1" value="6" placeholder="行數" aria-label="行數">
          <button id="generate">隨機編排</button>
        </div>

        <div id="board"></div>
      </div>
    `;

    const board = container.querySelector("#board");
    const btn = container.querySelector("#generate");
    const studentCount = container.querySelector("#student-count");
    const rowsInput = container.querySelector("#rows");
    const colsInput = container.querySelector("#cols");

    const slotWidth = 112;
    const slotHeight = 64;
    const gap = 18;
    const padding = 24;
    const snapDistance = 90;

    let students = [];
    let nameplates = [];
    let slots = [];
    let activeCols = Number(colsInput.value);

    studentCount.innerText = `目前名單：${State.getStudents().length} 位學生`;

    function shuffle(items) {
      const result = [...items];

      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }

      return result;
    }

    function getSlotPosition(index) {
      return {
        x: padding + (index % activeCols) * (slotWidth + gap),
        y: padding + Math.floor(index / activeCols) * (slotHeight + gap)
      };
    }

    function renderSlots(rows, cols) {
      slots = [];

      for (let i = 0; i < rows * cols; i++) {
        const position = getSlotPosition(i);
        const slot = document.createElement("div");

        slot.className = "seat-slot";
        slot.style.left = position.x + "px";
        slot.style.top = position.y + "px";
        slot.style.width = slotWidth + "px";
        slot.style.height = slotHeight + "px";

        board.appendChild(slot);
        slots.push({ index: i, ...position });
      }
    }

    function movePlateToSlot(plate) {
      const position = getSlotPosition(plate.slotIndex);

      plate.el.style.left = position.x + "px";
      plate.el.style.top = position.y + "px";
    }

    function updateAllPlatePositions() {
      nameplates.forEach(movePlateToSlot);
    }

    function getPlateBySlot(slotIndex) {
      return nameplates.find(plate => plate.slotIndex === slotIndex);
    }

    function findNearestSlot(clientX, clientY) {
      const boardRect = board.getBoundingClientRect();
      let nearest = null;
      let nearestDistance = Infinity;

      slots.forEach(slot => {
        const position = getSlotPosition(slot.index);
        const centerX = boardRect.left + position.x + slotWidth / 2;
        const centerY = boardRect.top + position.y + slotHeight / 2;
        const distance = Math.hypot(clientX - centerX, clientY - centerY);

        if (distance < nearestDistance) {
          nearest = slot;
          nearestDistance = distance;
        }
      });

      if (!nearest || nearestDistance > snapDistance) {
        return null;
      }

      return nearest.index;
    }

    function swapSlots(sourcePlate, targetSlotIndex) {
      const sourceSlotIndex = sourcePlate.slotIndex;
      const targetPlate = getPlateBySlot(targetSlotIndex);

      sourcePlate.slotIndex = targetSlotIndex;

      if (targetPlate) {
        targetPlate.slotIndex = sourceSlotIndex;
      }

      updateAllPlatePositions();
    }

    function makeDraggable(plate) {
      let offsetX = 0;
      let offsetY = 0;
      let dragging = false;

      plate.el.addEventListener("pointerdown", (event) => {
        dragging = true;
        plate.el.setPointerCapture(event.pointerId);
        plate.el.classList.add("dragging");

        const rect = plate.el.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;
      });

      plate.el.addEventListener("pointermove", (event) => {
        if (!dragging) return;

        const boardRect = board.getBoundingClientRect();
        const x = event.clientX - boardRect.left - offsetX;
        const y = event.clientY - boardRect.top - offsetY;

        plate.el.style.left = x + "px";
        plate.el.style.top = y + "px";
      });

      function finishDrag(event) {
        if (!dragging) return;

        dragging = false;
        plate.el.classList.remove("dragging");
        if (plate.el.hasPointerCapture(event.pointerId)) {
          plate.el.releasePointerCapture(event.pointerId);
        }

        const targetSlotIndex = findNearestSlot(event.clientX, event.clientY);

        if (targetSlotIndex === null) {
          movePlateToSlot(plate);
          return;
        }

        swapSlots(plate, targetSlotIndex);
      }

      plate.el.addEventListener("pointerup", finishDrag);
      plate.el.addEventListener("pointercancel", finishDrag);
    }

    function createNameplate(name, slotIndex) {
      const el = document.createElement("div");
      const plate = { name, slotIndex, el };

      el.className = "seat";
      el.innerText = name;
      el.style.width = slotWidth + "px";
      el.style.height = slotHeight + "px";

      makeDraggable(plate);
      board.appendChild(el);
      nameplates.push(plate);
      movePlateToSlot(plate);
    }

    function generateSeating() {
      const rows = Number(rowsInput.value);
      const cols = Number(colsInput.value);

      students = State.getStudents();

      if (students.length === 0) {
        alert("請先到班級名單管理新增學生");
        return;
      }

      if (!rows || !cols || rows <= 0 || cols <= 0) {
        alert("請輸入正確的列數與行數");
        return;
      }

      if (students.length > rows * cols) {
        alert("座位數不夠，請增加列數或行數");
        return;
      }

      board.innerHTML = "";
      nameplates = [];
      activeCols = cols;

      board.style.width = padding * 2 + cols * slotWidth + (cols - 1) * gap + "px";
      board.style.height = padding * 2 + rows * slotHeight + (rows - 1) * gap + "px";

      renderSlots(rows, cols);

      shuffle(students).forEach((name, index) => {
        createNameplate(name, index);
      });
    }

    btn.addEventListener("click", generateSeating);
  }
});
