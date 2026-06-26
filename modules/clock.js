registerTool("clock", {
  timer: null,

  destroy() {
    clearInterval(this.timer);
    this.timer = null;
  },

  render(container) {
    const tool = this;

    container.innerHTML = `
      <div class="card clock-card">
        <h2>🕒 教室時鐘</h2>

        <div class="clock-time" id="clock-time">00:00:00</div>
        <div class="clock-date" id="clock-date">載入中...</div>
      </div>
    `;

    const timeEl = container.querySelector("#clock-time");
    const dateEl = container.querySelector("#clock-date");

    function updateClock() {
      const now = new Date();
      const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

      timeEl.innerText = now.toLocaleTimeString("zh-TW", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      });

      dateEl.innerText =
        `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日 ` +
        `星期${weekdays[now.getDay()]}`;
    }

    updateClock();
    tool.timer = setInterval(updateClock, 1000);
  }
});
