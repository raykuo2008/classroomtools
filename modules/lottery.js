registerTool("lottery", {
  render(container) {
    container.innerHTML = `
      <div class="card">
        <h2>🎲 抽籤系統</h2>

        <div class="lottery-controls">
          <label>
            人數
            <input id="draw-count" type="number" min="1" value="1">
          </label>
        </div>

        <button id="start-btn">開始抽籤</button>

        <div id="lottery-box">尚未開始</div>

        <div class="lottery-history-header">
          <h3>📜 抽籤歷史</h3>
          <button id="clear-history-btn" type="button">清除歷史紀錄</button>
        </div>

        <div id="history"></div>
      </div>
    `;

    const drawCountInput = container.querySelector("#draw-count");
    const box = container.querySelector("#lottery-box");
    const startBtn = container.querySelector("#start-btn");
    const clearHistoryBtn = container.querySelector("#clear-history-btn");
    const historyDiv = container.querySelector("#history");

    let interval = null;

    function shuffle(items) {
      const result = [...items];

      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }

      return result;
    }

    function renderHistory() {
      const history = State.get("lotteryHistory");

      if (history.length === 0) {
        historyDiv.innerHTML = `<div class="lottery-empty-history">目前沒有抽籤紀錄</div>`;
        return;
      }

      historyDiv.innerHTML = `
        <ul>
          ${history.map(item => `<li>${Array.isArray(item) ? item.join("、") : item}</li>`).join("")}
        </ul>
      `;
    }

    function clearHistory() {
      State.set("lotteryHistory", []);
      renderHistory();
    }

    function startLottery() {
      const students = State.getStudents();
      const drawCount = Number(drawCountInput.value);

      if (students.length === 0) {
        alert("請先到班級名單管理新增學生");
        return;
      }

      if (!Number.isInteger(drawCount) || drawCount <= 0) {
        alert("請輸入正確的抽籤人數");
        return;
      }

      if (drawCount > students.length) {
        alert("抽籤人數不能超過班級名單人數");
        return;
      }

      if (interval) clearInterval(interval);

      let i = 0;

      interval = setInterval(() => {
        box.innerText = shuffle(students).slice(0, drawCount).join("、");
        i++;
      }, 80);

      setTimeout(() => {
        clearInterval(interval);

        const winners = shuffle(students).slice(0, drawCount);

        box.innerText = "🎉 " + winners.join("、");

        State.push("lotteryHistory", winners);

        renderHistory();
      }, 2500);
    }

    startBtn.addEventListener("click", startLottery);
    clearHistoryBtn.addEventListener("click", clearHistory);

    renderHistory();
  }
});
