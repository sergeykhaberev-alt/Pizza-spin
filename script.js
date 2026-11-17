// Демонстрационная логика Pizza Bonus.
// В настоящем проекте проверка кода и выбор приза должны выполняться на сервере.
const PRIZES = [
  { name: "Скидка 10%", detail: "на следующий заказ", icon: "🏷️" },
  { name: "Бесплатная пицца", detail: "по условиям акции", icon: "🍕" },
  { name: "Скидка 15%", detail: "на следующий заказ", icon: "✨" },
  { name: "Ещё одно вращение", detail: "дополнительный шанс", icon: "🎡" },
  { name: "Напиток в подарок", detail: "к следующему заказу", icon: "🥤" },
  { name: "Скидка 5%", detail: "на следующий заказ", icon: "🎁" },
  { name: "Бесплатная пицца", detail: "по условиям акции", icon: "🍕" },
  { name: "Сюрприз от пиццерии", detail: "специальный бонус", icon: "🎉" }
];

// Тестовые коды. В реальном проекте эти данные нельзя хранить в JavaScript.
const DEMO_CODES = {
  "DODO-1000": { amount: 1000, used: false },
  "PIZZA-500": { amount: 500, used: false },
  "BONUS-2000": { amount: 2000, used: false }
};
const STORAGE_KEY = "pizzaBonusDemo";
let data = loadData();
let spinning = false;
let rotation = 0;
let currentPrize = null;

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
      name: "", turns: 0, spins: [], usedCodes: [], availableTurns: 0
    };
  } catch {
    return { name: "", turns: 0, spins: [], usedCodes: [], availableTurns: 0 };
  }
}
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
const $ = id => document.getElementById(id);

const PAGES = ["wheel", "history", "profile", "about", "contacts"];
function showPage(page, updateAddress = true) {
  if (!PAGES.includes(page)) page = "wheel";
  document.querySelectorAll(".page").forEach(el => el.classList.add("hidden"));
  $("page-" + page).classList.remove("hidden");
  document.querySelectorAll(".nav-link").forEach(btn => btn.classList.toggle("active", btn.dataset.page === page));
  if (updateAddress && window.location.hash !== "#" + page) {
    history.pushState(null, "", "#" + page);
  }
  if (page === "history") renderHistory();
  if (page === "profile") renderProfile();
}
document.querySelectorAll("[data-page]").forEach(btn => {
  btn.addEventListener("click", () => showPage(btn.dataset.page));
});
$("profileButton").addEventListener("click", () => showPage("profile"));
function pageFromAddress() {
  const page = window.location.hash.replace(/^#\/?/, "");
  showPage(PAGES.includes(page) ? page : "wheel", false);
}
window.addEventListener("popstate", pageFromAddress);
window.addEventListener("hashchange", pageFromAddress);

function setMessage(text, type = "") {
  const el = $("codeMessage");
  el.textContent = text;
  el.className = "message " + type;
}
function checkCode() {
  const code = $("codeInput").value.trim().toUpperCase();
  if (!code) {
    setMessage("Сначала введи код покупки.", "error");
    return;
  }
  if (data.usedCodes.includes(code)) {
    setMessage("Этот код уже использован. Каждый чек даёт только одно вращение.", "error");
    return;
  }
  // Секретный демонстрационный код: даёт вращение и не расходуется.
  if (code === "0000") {
    data.availableTurns += 1;
    saveData();
    $("codeInput").value = "";
    setMessage("Демонстрационный код принят! Добавлено одно вращение. Код 0000 можно использовать повторно.", "success");
    updateCounters();
    return;
  }
  const purchase = DEMO_CODES[code];
  if (!purchase) {
    setMessage("Код не найден. Проверь его или используй один из демо-кодов.", "error");
    return;
  }
  if (purchase.amount < 500) {
    setMessage("Для участия сумма покупки должна быть не менее 500 ₽.", "error");
    return;
  }
  data.usedCodes.push(code);
  data.availableTurns += 1;
  saveData();
  $("codeInput").value = "";
  setMessage(`Покупка на ${purchase.amount.toLocaleString("ru-RU")} ₽ подтверждена! Доступно одно вращение.`, "success");
  updateCounters();
}
$("checkCode").addEventListener("click", checkCode);
$("codeInput").addEventListener("keydown", e => { if (e.key === "Enter") checkCode(); });
document.querySelectorAll(".code-chip").forEach(btn => {
  btn.addEventListener("click", () => {
    $("codeInput").value = btn.dataset.code;
    checkCode();
  });
});

function updateCounters() {
  $("turnsLabel").textContent = `${data.availableTurns} ${wordTurns(data.availableTurns)}`;
  $("spinButton").disabled = data.availableTurns < 1 || spinning;
  $("spinButton").textContent = spinning ? "Колесо вращается..." :
    data.availableTurns > 0 ? "КРУТИТЬ КОЛЕСО" : "Сначала подтверди покупку";
  $("userLabel").textContent = data.name || "Гость";
  renderProfile();
}
function wordTurns(n) {
  const n10 = n % 10, n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return "вращение";
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return "вращения";
  return "вращений";
}

function spin() {
  if (spinning || data.availableTurns < 1) return;
  spinning = true;
  currentPrize = Math.floor(Math.random() * PRIZES.length);
  updateCounters();
  $("prizeResult").textContent = "Удачи! Колесо вращается…";
  const segment = 360 / PRIZES.length;
  const target = 360 * 6 + (360 - (currentPrize + 0.5) * segment);
  rotation += target;
  $("wheel").style.transform = `rotate(${rotation}deg)`;
  window.setTimeout(finishSpin, 4300);
}
function finishSpin() {
  const prize = PRIZES[currentPrize];
  data.availableTurns -= 1;
  data.turns += 1;
  const record = {
    id: Date.now(), name: prize.name, detail: prize.detail, icon: prize.icon,
    date: new Date().toLocaleString("ru-RU")
  };
  data.spins.unshift(record);
  if (prize.name === "Ещё одно вращение") data.availableTurns += 1;
  saveData();
  $("prizeResult").textContent = `${prize.icon} Поздравляем! Твой приз: ${prize.name}`;
  spinning = false;
  updateCounters();
  renderHistory();
}
$("spinButton").addEventListener("click", spin);

function renderHistory() {
  const list = $("historyList");
  if (!data.spins.length) {
    list.innerHTML = '<div class="empty-state">Пока нет вращений. Подтверди покупку и попробуй удачу! 🎁</div>';
    return;
  }
  list.innerHTML = data.spins.map(item => `
    <div class="history-item">
      <div><b>${escapeHtml(item.icon)} ${escapeHtml(item.name)}</b><small>${escapeHtml(item.date)} · ${escapeHtml(item.detail)}</small></div>
      <span class="prize-tag">Получен</span>
    </div>`).join("");
}
function renderProfile() {
  if (!$("profileSpins")) return;
  $("nameInput").value = data.name || "";
  $("profileSpins").textContent = data.turns;
  $("profilePrizes").textContent = data.spins.length;
  $("profileTurns").textContent = data.availableTurns;
}
$("saveProfile").addEventListener("click", () => {
  data.name = $("nameInput").value.trim();
  saveData();
  $("profileMessage").textContent = data.name ? "Имя сохранено." : "Имя удалено. Можно участвовать анонимно.";
  $("userLabel").textContent = data.name || "Гость";
});
$("resetData").addEventListener("click", () => {
  if (!confirm("Сбросить имя, историю и использованные демо-коды?")) return;
  localStorage.removeItem(STORAGE_KEY);
  data = loadData();
  document.querySelectorAll(".code-chip").forEach(() => {});
  setMessage("Данные демонстрации сброшены.");
  $("prizeResult").textContent = "Твой бонус уже ждёт!";
  updateCounters();
  renderHistory();
});
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}

updateCounters();
renderHistory();
pageFromAddress();
