registerTool("cleaning", {
  render(container) {
    container.innerHTML = `
      <div class="card cleaning-card">
        <h2>🧹 掃地工作分配</h2>

        <button id="assign-cleaning">隨機分配</button>

        <div class="cleaning-table" id="cleaning-table"></div>

        <button class="add-cleaning-job" id="add-cleaning-job">＋</button>

        <div class="cleaning-picker" id="cleaning-picker">
          <div class="cleaning-picker-panel">
            <div class="cleaning-picker-title" id="cleaning-picker-title">選擇學生</div>
            <div class="cleaning-picker-list" id="cleaning-picker-list"></div>
            <button id="close-cleaning-picker">關閉</button>
          </div>
        </div>
      </div>
    `;

    const table = container.querySelector("#cleaning-table");
    const assignBtn = container.querySelector("#assign-cleaning");
    const addBtn = container.querySelector("#add-cleaning-job");
    const picker = container.querySelector("#cleaning-picker");
    const pickerTitle = container.querySelector("#cleaning-picker-title");
    const pickerList = container.querySelector("#cleaning-picker-list");
    const closePickerBtn = container.querySelector("#close-cleaning-picker");

    let jobs = State.get("cleaningJobs");
    let activeJobIndex = null;

    if (!jobs || jobs.length === 0) {
      jobs = [
        { work: "黑板", count: 2, names: [] },
        { work: "地板", count: 4, names: [] },
        { work: "走廊", count: 3, names: [] },
        { work: "垃圾", count: 2, names: [] },
        { work: "窗戶", count: 2, names: [] }
      ];
      saveJobs();
    }

    function saveJobs() {
      State.set("cleaningJobs", jobs);
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

      pickerTitle.innerText = `${job.work || "工作"}：選擇學生`;

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
            alert("這個工作的名額已滿");
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

    function deleteCleaningJob(jobIndex) {
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
        <div class="cleaning-header">工作</div>
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
        workInput.placeholder = "工作";

        countInput.className = "cleaning-count";
        countInput.type = "number";
        countInput.min = "1";
        countInput.value = job.count;
        countInput.setAttribute("aria-label", `${job.work || "工作"}人數`);

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
          deleteCleaningJob(index);
        });

        table.appendChild(workInput);
        table.appendChild(countInput);
        table.appendChild(namesBox);
        table.appendChild(deleteBtn);
      });
    }

    function assignCleaningJobs() {
      const students = State.getStudents();
      const totalNeeded = jobs.reduce((sum, job) => sum + job.count, 0);

      if (students.length === 0) {
        alert("資料庫中沒有學生名單，請先在抽籤或座位編排輸入名單");
        return;
      }

      if (totalNeeded > students.length) {
        alert("工作需要的人數超過學生名單人數，請降低人數或增加名單");
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

    function addCleaningJob() {
      jobs.push({
        work: "新工作",
        count: 1,
        names: []
      });

      saveJobs();
      renderTable();
    }

    assignBtn.addEventListener("click", assignCleaningJobs);
    addBtn.addEventListener("click", addCleaningJob);
    closePickerBtn.addEventListener("click", closePicker);
    picker.addEventListener("click", (event) => {
      if (event.target === picker) {
        closePicker();
      }
    });

    renderTable();
  }
});
