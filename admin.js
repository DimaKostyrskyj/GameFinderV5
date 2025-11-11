// 👥 Список разрешённых администраторов 
//const ADMINS = [
 // { username: "Kai", password: "KaiSatto3188" },
 // { username: "Kingo", password: "25802006Vk." },
 // { username: "Very", password: "jG8PEeuuF%HAG2FtP1zesZoYh3IY#$oD" }
//];

const loginBtn = document.getElementById("adminLoginBtn");
const modal = document.getElementById("adminLoginModal");
const submitBtn = document.getElementById("adminSubmit");
const adminPanel = document.getElementById("adminPanel");
const consoleDiv = document.getElementById("adminConsole");
const cmdInput = document.getElementById("adminCommand");
const runBtn = document.getElementById("adminRun");
const errorDiv = document.getElementById("adminError");

let adminLogs = [];
let originalConsole = { ...console };
let currentAdmin = null;

// 🔄 Перехватываем все console.*
["log", "warn", "error", "info"].forEach(type => {
  console[type] = function (...args) {
    originalConsole[type](...args);
    const text = `[${new Date().toLocaleTimeString()}] [${type.toUpperCase()}] ${args.join(" ")}`;
    adminLogs.push(text);
    if (adminLogs.length > 1000) adminLogs.shift();
    if (adminPanel && !adminPanel.classList.contains("hidden")) {
      logToConsole(text, type);
    }
  };
});

// 🟢 Открыть модал входа
loginBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
  errorDiv.textContent = "";
});

// 🔐 Войти
submitBtn.addEventListener("click", async () => {
  const user = document.getElementById("adminUser").value.trim();
  const pass = document.getElementById("adminPass").value.trim();

  try {
    const response = await fetch('/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });

    const result = await response.json();
    
    if (result.ok) {
      currentAdmin = user;
      modal.classList.add("hidden");
      openAdminPanel();
    } else {
      errorDiv.textContent = "❌ Неверный логин или пароль";
    }
  } catch (error) {
    errorDiv.textContent = "❌ Ошибка подключения";
  }
});

// Проверка статуса при загрузке
// Проверка статуса
async function checkAdminStatus() {
  try {
    const response = await fetch('/api/admin/status', {  // ← ИСПРАВЬТЕ
      credentials: 'include'
    });
    const result = await response.json();
    
    if (result.ok) {
      currentAdmin = result.user;
      openAdminPanel();
    }
  } catch (error) {
    console.log('Admin not logged in');
  }
}

// Выход
function logoutAdmin() {
  fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })  // ← ИСПРАВЬТЕ
    .then(() => {
      currentAdmin = null;
      adminPanel.classList.add("hidden");
      logToConsole("🚪 Выход из админ-панели завершён.");
    });
}

// ▶ Выполнение команд
runBtn.addEventListener("click", () => {
  const cmd = cmdInput.value.trim();
  if (!cmd) return;
  logToConsole(`> ${cmd}`, "info");
  executeCommand(cmd);
  cmdInput.value = "";
});

// 🧾 Логирование
function logToConsole(text, type = "log") {
  const div = document.createElement("div");
  div.textContent = text;
  if (type === "error") div.style.color = "#f87171";
  if (type === "warn") div.style.color = "#facc15";
  if (type === "info") div.style.color = "#38bdf8";
  if (type === "log") div.style.color = "#e2e8f0";
  consoleDiv.appendChild(div);
  consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

// ⚙️ Команды
function executeCommand(cmd) {
  const [command, ...args] = cmd.toLowerCase().split(" ");
  switch (command) {
    case "help":
      logToConsole("📜 Команды:");
      logToConsole("- help — показать список команд");
      logToConsole("- clear — очистить консоль");
      logToConsole("- stats — показать состояние AI");
      logToConsole("- logs — показать последние 100 логов");
      logToConsole("- download — скачать все логи");
      logToConsole("- eval <код> — выполнить JavaScript");
      logToConsole("- logout — выйти из админки");
      break;

    case "clear":
      consoleDiv.innerHTML = "";
      break;

    case "stats":
  logToConsole("🔍 Проверка состояния API...");
  testAPIStatus();
  break;

    case "godmode":
      logToConsole("🌟 Активирован GOD MODE");
      if (typeof app !== "undefined") app.activateGodMode?.();
      break;

    case "logs":
      logToConsole("📋 Последние 100 логов:");
      adminLogs.slice(-100).forEach(line => logToConsole(line));
      break;

    case "download":
      downloadLogs();
      break;

    case "eval":
      const code = cmd.slice(5);
      try {
        const result = eval(code);
        logToConsole("✅ Результат: " + result);
      } catch (e) {
        logToConsole("❌ Ошибка: " + e.message, "error");
      }
      break;

    case "logout":
      logoutAdmin();
      break;

    default:
      logToConsole("❓ Неизвестная команда. Введите 'help'");
  }
}

// 📥 Скачивание логов
function downloadLogs() {
  if (adminLogs.length === 0) {
    logToConsole("📭 Логи пусты");
    return;
  }
  const blob = new Blob([adminLogs.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `console_logs_${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;
  a.click();
  logToConsole("💾 Логи успешно сохранены!");
}
// 🌐 Проверка статуса API / AI
async function testAPIStatus() {
  const testUrl = "/api/test"; // <-- замени на свой реальный эндпоинт
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(testUrl, {
      method: "GET",
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const text = await res.text();
      logToConsole("✅ API работает корректно!");
      logToConsole("🧠 Ответ AI: " + (text || "OK"));
    } else {
      logToConsole(`⚠️ API вернул ошибку: ${res.status}`, "warn");
    }
  } catch (err) {
    logToConsole("❌ Ошибка подключения к API: " + err.message, "error");
  }
}

// 🧰 Открыть панель
function openAdminPanel() {
  adminPanel.classList.remove("hidden");
  consoleDiv.innerHTML = "";
  logToConsole(`✅ Добро пожаловать, ${currentAdmin}!`);
  logToConsole("📡 Консоль подключена.");
  createPanelHeader();
}

// 🧭 Заголовок с кнопками
function createPanelHeader() {
  if (document.getElementById("adminHeader")) return;

  const header = document.createElement("div");
  header.id = "adminHeader";
  header.className = "admin-header";
  header.innerHTML = `
    <span>👨‍💻 ${currentAdmin}</span>
    <div>
      <button id="collapseBtn" class="mini-btn">🔻</button>
      <button id="downloadBtn" class="mini-btn">📥</button>
      <button id="logoutBtn" class="mini-btn exit">🚪</button>
    </div>
  `;
  adminPanel.prepend(header);

  document.getElementById("logoutBtn").onclick = logoutAdmin;
  document.getElementById("downloadBtn").onclick = downloadLogs;

  const collapseBtn = document.getElementById("collapseBtn");
  collapseBtn.onclick = () => {
    adminPanel.classList.toggle("collapsed");
    collapseBtn.textContent = adminPanel.classList.contains("collapsed") ? "🔼" : "🔻";
  };
}