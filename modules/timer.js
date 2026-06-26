registerTool("timer", {
  timer: null,

  destroy() {
    clearInterval(this.timer);
    this.timer = null;
  },

  render(container) {
    const tool = this;

    container.innerHTML = `
      <div class="card timer-card">
        <h2>⏱ 考試計時器</h2>

        <div class="timer-inputs">
          <label>
            分
            <input id="minutes" type="number" min="0" value="0">
          </label>
          <label>
            秒
            <input id="seconds" type="number" min="0" value="0">
          </label>
        </div>

        <div class="timer-display" id="display">00:00</div>

        <button id="start">開始</button>
        <button id="pause">暫停</button>
        <button id="reset">重置</button>
        <button id="fullscreen">全螢幕</button>
      </div>
    `;

    const minutesInput = container.querySelector("#minutes");
    const secondsInput = container.querySelector("#seconds");
    const display = container.querySelector("#display");
    const startBtn = container.querySelector("#start");
    const pauseBtn = container.querySelector("#pause");
    const resetBtn = container.querySelector("#reset");
    const fsBtn = container.querySelector("#fullscreen");

    let remaining = 0;
    let running = false;

    function getInputSeconds() {
      const minutes = Number(minutesInput.value) || 0;
      const seconds = Number(secondsInput.value) || 0;

      return Math.floor(minutes * 60 + seconds);
    }

    function updateDisplay() {
      const min = Math.floor(remaining / 60);
      const sec = remaining % 60;
      display.innerText =
        String(min).padStart(2, "0") +
        ":" +
        String(sec).padStart(2, "0");
    }

    function startTimer() {
      if (running) return;

      if (remaining === 0) {
        remaining = getInputSeconds();

        if (remaining <= 0) {
          alert("請輸入分鐘或秒數");
          return;
        }

        updateDisplay();
      }

      running = true;

      tool.timer = setInterval(() => {
        if (remaining > 0) {
          remaining--;
        }

        updateDisplay();

        if (remaining <= 0) {
          clearInterval(tool.timer);
          tool.timer = null;
          running = false;
          alert("⏰ 時間到！");
        }
      }, 1000);
    }

    function pauseTimer() {
      clearInterval(tool.timer);
      tool.timer = null;
      running = false;
    }

    function resetTimer() {
      clearInterval(tool.timer);
      tool.timer = null;
      running = false;
      remaining = 0;
      minutesInput.value = 0;
      secondsInput.value = 0;
      updateDisplay();
    }

    function toggleFullscreen() {
      const el = container.querySelector(".timer-card");

      if (!document.fullscreenElement) {
        el.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }

    startBtn.onclick = startTimer;
    pauseBtn.onclick = pauseTimer;
    resetBtn.onclick = resetTimer;
    fsBtn.onclick = toggleFullscreen;

    updateDisplay();
  }
});
