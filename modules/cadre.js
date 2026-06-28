registerTool("cadre", {
  render(container) {
    container.innerHTML = `
      <div class="card cadre-card">
        <h2>📋 幹部編排</h2>

        <button id="assign-cadre">隨機分配</button>

        <div class="cleaning-table" id="cadre-table"></div>

        <button class="add-cleaning-job" id="add-cadre-job">＋</button>

        <div class="cleaning-picker" id="cadre-picker">
          <div class="cleaning-picker-panel">
            <div class="cleaning-picker-title" id="cadre-picker-title">選擇學生</div>
            <div class="cleaning-picker-list" id="cadre-picker-list"></div>
            <button id="close-cadre-picker">關閉</button>
          </div>
        </div>
      </div>
    `;

    const table = container.querySelector("#cadre-table");
    const assignBtn = container.querySelector("#assign-cadre");
    const addBtn = container.querySelector("#add-cadre-job");
    const picker = container.querySelector("#cadre-picker");
    const pickerTitle = container.querySelector("#cadre-picker-title");
    const pickerList = container.querySelector("#cadre-picker-list");
    const closePickerBtn = container.querySelector("#close-cadre-picker");

    let jobs = State.get("cadreJobs");
    let activeJobIndex = null;

    if (!jobs || jobs.length === 0) {
      jobs = [
        { work: "班長", count: 1, names: [] },
        { work: "副班長", count: 1, names: [] },
        { work: "風紀", count: 1, names: [] },
        { work: "學藝", count: 1, names: [] },
        { work: "康樂", count: 1, names: [] }
      ];
      saveJobs();
    }

    function saveJobs() {
      State.set("cadreJobs", jobs);
    }

    function shuffle(items) {
      const result = [...items];

      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }

      return result;
    }

    function getAssignedStudents() {
      return jobs.flatMap(job => job.names);
    }

    function getAvailableStudents() {
      const assigned = new Set(getAssignedStudents());
      return State.getStudents().filter(student => !assigned.has(student));
    }

    function renderNamesBox(namesBox, job, jobIndex) {
      namesBox.innerHTML = "";

      if (job.names.length === 0) {
        const empty = document.createElement("span");
        empty.className = "cleaning-empty";
        empty.innerText = "尚未分配";
        namesBox.appendChild(empty);
        return;
      }

      job.names.forEach((name, nameIndex) => {
        const chip = document.createElement("button");

        chip.className = "cleaning-name-chip";
        chip.type = "button";
        chip.innerText = name;

        chip.addEventListener("click", (event) => {
          event.stopPropagation();
          jobs[jobIndex].names.splice(nameIndex, 1);
          saveJobs();
          activeJobIndex = jobIndex;
          picker.classList.add("show");
          renderTable();
          positionPicker();
          renderPicker();
        });

        namesBox.appendChild(chip);
      });
    }

    function renderPicker() {
      pickerList.innerHTML = "";

      if (activeJobIndex === null) {
        return;
      }

      const job = jobs[activeJobIndex];
      const availableStudents = getAvailableStudents();

      pickerTitle.innerText = `${job.work || "職位"}：選擇學生`;

      if (availableStudents.length === 0) {
        const empty = document.createElement("div");
        empty.className = "cleaning-picker-empty";
        empty.innerText = "沒有未分配的學生";
        pickerList.appendChild(empty);
        return;
      }

      availableStudents.forEach(student => {
        const btn = document.createElement("button");

        btn.className = "cleaning-picker-name";
        btn.type = "button";
        btn.innerText = student;

        btn.addEventListener("click", () => {
          if (job.names.length >= job.count) {
            alert("這個職位的名額已滿");
            return;
          }

          job.names.push(student);
          saveJobs();
          renderTable();
          positionPicker();
          renderPicker();
        });

        pickerList.appendChild(btn);
      });
    }

    function positionPicker() {
      if (activeJobIndex === null) return;

      const anchor = table.querySelector(
        `.cleaning-names[data-job-index="${activeJobIndex}"]`
      );

      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const pickerWidth = Math.min(360, window.innerWidth - 32);
      const left = Math.min(rect.right + 12, window.innerWidth - pickerWidth - 16);
      const top = Math.min(rect.top, window.innerHeight - 320);

      picker.style.left = Math.max(16, left) + "px";
      picker.style.top = Math.max(16, top) + "px";
    }

    function openPicker(jobIndex) {
      activeJobIndex = jobIndex;
      picker.classList.add("show");
      positionPicker();
      renderPicker();
    }

    function closePicker() {
      activeJobIndex = null;
      picker.classList.remove("show");
      picker.style.left = "";
      picker.style.top = "";
    }

    function deleteCadreJob(jobIndex) {
      jobs.splice(jobIndex, 1);

      if (activeJobIndex === jobIndex) {
        closePicker();
      } else if (activeJobIndex !== null && activeJobIndex > jobIndex) {
        activeJobIndex--;
      }

      saveJobs();
      renderTable();
    }

    function renderTable() {
      table.innerHTML = `
        <div class="cleaning-header">職位</div>
        <div class="cleaning-header">人數</div>
        <div class="cleaning-header">名字</div>
        <div class="cleaning-header cleaning-header-action">刪除</div>
      `;

      jobs.forEach((job, index) => {
        const workInput = document.createElement("input");
        const countInput = document.createElement("input");
        const namesBox = document.createElement("div");
        const deleteBtn = document.createElement("button");

        workInput.className = "cleaning-work";
        workInput.value = job.work;
        workInput.placeholder = "職位";

        countInput.className = "cleaning-count";
        countInput.type = "number";
        countInput.min = "1";
        countInput.value = job.count;
        countInput.setAttribute("aria-label", `${job.work || "職位"}人數`);

        namesBox.className = "cleaning-names";
        namesBox.dataset.jobIndex = index;
        namesBox.setAttribute("role", "button");
        namesBox.setAttribute("tabindex", "0");
        renderNamesBox(namesBox, job, index);

        deleteBtn.className = "delete-job-btn";
        deleteBtn.type = "button";
        deleteBtn.innerText = "刪除";

        workInput.addEventListener("input", () => {
          jobs[index].work = workInput.value.trim();
          saveJobs();
        });

        countInput.addEventListener("input", () => {
          jobs[index].count = Math.max(1, Number(countInput.value) || 1);
          saveJobs();
        });

        namesBox.addEventListener("click", () => {
          openPicker(index);
        });

        namesBox.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker(index);
          }
        });

        deleteBtn.addEventListener("click", () => {
          deleteCadreJob(index);
        });

        table.appendChild(workInput);
        table.appendChild(countInput);
        table.appendChild(namesBox);
        table.appendChild(deleteBtn);
      });
    }

    function assignCadreJobs() {
      const students = State.getStudents();
      const totalNeeded = jobs.reduce((sum, job) => sum + job.count, 0);

      if (students.length === 0) {
        alert("資料庫中沒有學生名單，請先到班級名單管理新增學生");
        return;
      }

      if (totalNeeded > students.length) {
        alert("職位需要的人數超過學生名單人數，請降低人數或增加名單");
        return;
      }

      const shuffled = shuffle(students);
      let studentIndex = 0;

      jobs.forEach(job => {
        job.names = [];

        for (let i = 0; i < job.count; i++) {
          job.names.push(shuffled[studentIndex]);
          studentIndex++;
        }
      });

      saveJobs();
      renderTable();
    }

    function addCadreJob() {
      jobs.push({
        work: "新職位",
        count: 1,
        names: []
      });

      saveJobs();
      renderTable();
    }

    assignBtn.addEventListener("click", assignCadreJobs);
    addBtn.addEventListener("click", addCadreJob);
    closePickerBtn.addEventListener("click", closePicker);

    renderTable();
  }
});
