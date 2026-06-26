registerTool("students", {
  render(container) {
    container.innerHTML = `
      <div class="card students-card">
        <h2>👥 班級名單管理</h2>

        <div class="students-add-row">
          <input id="student-name" type="text" placeholder="輸入學生姓名">
          <button id="add-student">新增</button>
        </div>

        <textarea id="students-list" placeholder="一行一個學生"></textarea>

        <div class="students-actions">
          <button id="save-students">儲存名單</button>
          <button id="clear-students">清空名單</button>
        </div>

        <div class="students-summary" id="students-summary"></div>
        <div class="students-chips" id="students-chips"></div>
      </div>
    `;

    const nameInput = container.querySelector("#student-name");
    const addBtn = container.querySelector("#add-student");
    const listInput = container.querySelector("#students-list");
    const saveBtn = container.querySelector("#save-students");
    const clearBtn = container.querySelector("#clear-students");
    const summary = container.querySelector("#students-summary");
    const chips = container.querySelector("#students-chips");

    let students = State.getStudents();

    function normalizeNames(names) {
      const seen = new Set();

      return names
        .map(name => name.trim())
        .filter(name => name !== "")
        .filter(name => {
          if (seen.has(name)) return false;
          seen.add(name);
          return true;
        });
    }

    function saveStudents() {
      State.setStudents(students);
    }

    function syncTextarea() {
      listInput.value = students.join("\n");
    }

    function renderStudents() {
      summary.innerText = `目前 ${students.length} 位學生`;
      chips.innerHTML = "";

      students.forEach((student, index) => {
        const chip = document.createElement("button");

        chip.className = "student-chip";
        chip.type = "button";
        chip.innerText = student;

        chip.addEventListener("click", () => {
          students.splice(index, 1);
          saveStudents();
          syncTextarea();
          renderStudents();
        });

        chips.appendChild(chip);
      });
    }

    function updateFromTextarea() {
      students = normalizeNames(listInput.value.split("\n"));
      saveStudents();
      syncTextarea();
      renderStudents();
    }

    function addStudent() {
      const name = nameInput.value.trim();

      if (name === "") {
        alert("請輸入學生姓名");
        return;
      }

      if (students.includes(name)) {
        alert("名單中已經有這位學生");
        return;
      }

      students.push(name);
      nameInput.value = "";
      saveStudents();
      syncTextarea();
      renderStudents();
    }

    addBtn.addEventListener("click", addStudent);
    saveBtn.addEventListener("click", updateFromTextarea);
    clearBtn.addEventListener("click", () => {
      if (!confirm("確定要清空班級名單嗎？")) return;

      students = [];
      saveStudents();
      syncTextarea();
      renderStudents();
    });

    nameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        addStudent();
      }
    });

    syncTextarea();
    renderStudents();
  }
});
