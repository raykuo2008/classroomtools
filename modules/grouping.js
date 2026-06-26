registerTool("grouping", {
  render(container) {
    container.innerHTML = `
      <div class="card grouping-card">
        <h2>👥 分組</h2>
        <div class="tool-note" id="grouping-count"></div>

        <div class="grouping-controls">
          <input id="group-count" type="number" min="1" value="4" placeholder="組數" aria-label="組數">
          <button id="generate-groups">確定</button>
        </div>

        <div class="groups-board" id="groups-board"></div>
      </div>
    `;

    const countInfo = container.querySelector("#grouping-count");
    const countInput = container.querySelector("#group-count");
    const generateBtn = container.querySelector("#generate-groups");
    const board = container.querySelector("#groups-board");

    let groups = [];
    let dragging = null;

    countInfo.innerText = `目前名單：${State.getStudents().length} 位學生`;

    function shuffle(items) {
      const result = [...items];

      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }

      return result;
    }

    function renderGroups() {
      board.innerHTML = "";

      groups.forEach((group, groupIndex) => {
        const column = document.createElement("div");
        const title = document.createElement("div");
        const list = document.createElement("div");

        column.className = "group-column";
        column.dataset.groupIndex = groupIndex;

        title.className = "group-title";
        title.innerText = `第 ${groupIndex + 1} 組`;

        list.className = "group-list";

        group.forEach((student, studentIndex) => {
          const chip = document.createElement("div");

          chip.className = "group-name";
          chip.draggable = true;
          chip.innerText = student;
          chip.dataset.groupIndex = groupIndex;
          chip.dataset.studentIndex = studentIndex;

          list.appendChild(chip);
        });

        if (group.length === 0) {
          const empty = document.createElement("div");
          empty.className = "group-empty";
          empty.innerText = "空組";
          list.appendChild(empty);
        }

        column.appendChild(title);
        column.appendChild(list);
        board.appendChild(column);
      });
    }

    function moveStudent(targetGroupIndex) {
      if (!dragging || dragging.groupIndex === targetGroupIndex) {
        renderGroups();
        return;
      }

      const sourceGroup = groups[dragging.groupIndex];
      const targetGroup = groups[targetGroupIndex];
      const student = sourceGroup.splice(dragging.studentIndex, 1)[0];

      if (student) {
        targetGroup.push(student);
      }

      dragging = null;
      renderGroups();
    }

    function generateGroups() {
      const students = State.getStudents();
      const groupCount = Number(countInput.value);

      if (students.length === 0) {
        alert("請先到班級名單管理新增學生");
        return;
      }

      if (!Number.isInteger(groupCount) || groupCount <= 0) {
        alert("請輸入正確的組數");
        return;
      }

      groups = Array.from({ length: groupCount }, () => []);

      shuffle(students).forEach((student, index) => {
        groups[index % groupCount].push(student);
      });

      renderGroups();
    }

    board.addEventListener("dragstart", (event) => {
      const chip = event.target.closest(".group-name");
      if (!chip) return;

      dragging = {
        groupIndex: Number(chip.dataset.groupIndex),
        studentIndex: Number(chip.dataset.studentIndex)
      };

      chip.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", chip.innerText);
    });

    board.addEventListener("dragend", (event) => {
      const chip = event.target.closest(".group-name");
      if (chip) {
        chip.classList.remove("dragging");
      }
    });

    board.addEventListener("dragover", (event) => {
      if (!event.target.closest(".group-column")) return;

      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    });

    board.addEventListener("drop", (event) => {
      const column = event.target.closest(".group-column");
      if (!column) return;

      event.preventDefault();
      moveStudent(Number(column.dataset.groupIndex));
    });

    generateBtn.addEventListener("click", generateGroups);
  }
});
