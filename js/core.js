const Tools = {};
let currentTool = null;
let currentInstance = null;

function registerTool(name, module) {
  Tools[name] = module;
}

function loadTool(name) {
  const tool = Tools[name];

  if (!tool) {
    console.error("Tool not found:", name);
    return;
  }

  const app = document.getElementById("app");

  // 🧹 清理上一個工具（重要）
  if (currentInstance && currentInstance.destroy) {
    currentInstance.destroy();
  }

  app.innerHTML = "";

  currentTool = name;

  // 🧠 建立 instance
  currentInstance = tool;

  if (tool.render) {
    tool.render(app);
  }
}

function getCurrentTool() {
  return currentTool;
}