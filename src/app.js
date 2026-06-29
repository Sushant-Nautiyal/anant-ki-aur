import {
  WEEKDAYS,
  MONTH_FORMATTER,
  DAY_FORMATTER,
  addMonths,
  addYears,
  buildMonthGrid,
  clampDate,
  todayDate,
  toDateKey
} from "./calendar.js";
import { loadDailyMessages } from "./data.js";

const EMPTY_MESSAGE = "No wisdom message available for this date.";

export function createApp(root) {
  const state = {
    selectedDate: todayDate(),
    displayDate: todayDate(),
    messages: new Map(),
    favorites: loadFavorites(),
    isLoading: true,
    isDark: localStorage.getItem("aka-theme") === "dark"
  };

  root.innerHTML = template();
  const els = bindElements(root);
  applyTheme(state.isDark);
  attachEvents(els, state);
  render(els, state);

  loadDailyMessages()
    .then((messages) => {
      state.messages = messages;
    })
    .catch(() => showToast(els, "Could not load messages. Showing empty state."))
    .finally(() => {
      state.isLoading = false;
      render(els, state);
    });
}

function template() {
  return `
    <main class="app-shell" aria-label="Anant Ki Aur daily satsang wisdom">
      <section class="phone-frame">
        <header class="hero">
          <button class="icon-button theme-toggle" type="button" aria-label="Toggle dark mode">☾</button>
          <div class="om-mark" aria-hidden="true">ॐ</div>
            <div class="brand-copy">
            <h1>अनन्त की ओर</h1>
            <div class="divider"></div>
            <p class="guru-title">परम पूज्य स्वामी अवधेशानंद गिरि जी महाराज</p>
            <p class="subtitle">के सानिध्य में प्राप्त अनुग्रह आशीष</p>
            <p class="subtitle">प्रातः कालीन उच्छेष्टि प्रसादी</p>
            <div class="divider"></div>
            </div>
        </header>

        <section class="message-card" aria-live="polite">
          <div class="date-line skeleton-target"></div>
          <blockquote class="message-text skeleton-target"></blockquote>
          <div class="message-actions" aria-label="Message actions">
            <button class="pill-button today-button" type="button">Today</button>
            <button class="pill-button random-button" type="button">Random</button>
            <button class="pill-button favorite-button" type="button" aria-pressed="false">♡</button>
            <button class="pill-button copy-button" type="button">Copy</button>
            <button class="pill-button share-button" type="button">Share</button>
          </div>
        </section>

        <section class="calendar-panel" aria-label="Calendar">
          <div class="calendar-toolbar">
            <button class="nav-button prev-year" type="button" aria-label="Previous year">«</button>
            <button class="nav-button prev-month" type="button" aria-label="Previous month">‹</button>
            <button class="month-title" type="button" aria-label="Current month and year"></button>
            <button class="nav-button next-month" type="button" aria-label="Next month">›</button>
            <button class="nav-button next-year" type="button" aria-label="Next year">»</button>
          </div>

          <label class="year-jump">
            <span>Year</span>
            <input class="year-input" type="number" min="1900" max="2200" inputmode="numeric" aria-label="Jump to year" />
          </label>

          <div class="weekday-row" aria-hidden="true"></div>
          <div class="calendar-grid" role="grid" aria-label="Monthly calendar"></div>
        </section>

        <footer>ॐ तत् सत्</footer>
        <div class="toast" role="status" aria-live="polite"></div>
      </section>
    </main>
  `;
}

function bindElements(root) {
  return {
    root,
    dateLine: root.querySelector(".date-line"),
    messageText: root.querySelector(".message-text"),
    calendarGrid: root.querySelector(".calendar-grid"),
    weekdayRow: root.querySelector(".weekday-row"),
    monthTitle: root.querySelector(".month-title"),
    yearInput: root.querySelector(".year-input"),
    prevMonth: root.querySelector(".prev-month"),
    nextMonth: root.querySelector(".next-month"),
    prevYear: root.querySelector(".prev-year"),
    nextYear: root.querySelector(".next-year"),
    todayButton: root.querySelector(".today-button"),
    randomButton: root.querySelector(".random-button"),
    favoriteButton: root.querySelector(".favorite-button"),
    copyButton: root.querySelector(".copy-button"),
    shareButton: root.querySelector(".share-button"),
    themeToggle: root.querySelector(".theme-toggle"),
    toast: root.querySelector(".toast")
  };
}

function attachEvents(els, state) {
  els.prevMonth.addEventListener("click", () => changeDate(els, state, addMonths(state.selectedDate, -1)));
  els.nextMonth.addEventListener("click", () => changeDate(els, state, addMonths(state.selectedDate, 1)));
  els.prevYear.addEventListener("click", () => changeDate(els, state, addYears(state.selectedDate, -1)));
  els.nextYear.addEventListener("click", () => changeDate(els, state, addYears(state.selectedDate, 1)));

  els.todayButton.addEventListener("click", () => changeDate(els, state, todayDate()));

  els.yearInput.addEventListener("change", () => {
    const year = Number(els.yearInput.value);

    if (!Number.isInteger(year) || year < 1900 || year > 2200) {
      showToast(els, "Please enter a year between 1900 and 2200.");
      els.yearInput.value = state.selectedDate.getFullYear();
      return;
    }

    changeDate(els, state, clampDate(year, state.selectedDate.getMonth(), state.selectedDate.getDate()));
  });

  els.randomButton.addEventListener("click", () => {
    const keys = [...state.messages.keys()];
    if (!keys.length) {
      showToast(els, "No messages available yet.");
      return;
    }

    const key = keys[Math.floor(Math.random() * keys.length)];
    const [year, month, day] = key.split("-").map(Number);
    changeDate(els, state, new Date(year, month - 1, day));
  });

  els.favoriteButton.addEventListener("click", () => {
    const key = toDateKey(state.selectedDate);

    if (state.favorites.has(key)) {
      state.favorites.delete(key);
      showToast(els, "Removed from favorites.");
    } else {
      state.favorites.add(key);
      showToast(els, "Added to favorites.");
    }

    saveFavorites(state.favorites);
    render(els, state);
  });

  els.copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(getShareText(state));
      showToast(els, "Wisdom copied.");
    } catch {
      showToast(els, "Copy is not available on this device.");
    }
  });

  els.shareButton.addEventListener("click", async () => {
    const text = getShareText(state);

    try {
      if (navigator.share) {
        await navigator.share({ title: "Anant Ki Aur", text });
      } else {
        await navigator.clipboard.writeText(text);
        showToast(els, "Sharing not available. Wisdom copied instead.");
      }
    } catch {
      showToast(els, "Sharing was cancelled.");
    }
  });

  els.themeToggle.addEventListener("click", () => {
    state.isDark = !state.isDark;
    localStorage.setItem("aka-theme", state.isDark ? "dark" : "light");
    applyTheme(state.isDark);
    render(els, state);
  });
}

function changeDate(els, state, date) {
  state.selectedDate = date;
  state.displayDate = date;
  render(els, state, true);
}

function render(els, state, animate = false) {
  const key = toDateKey(state.selectedDate);
  const message = state.messages.get(key) || EMPTY_MESSAGE;

  els.root.classList.toggle("is-loading", state.isLoading);
  els.root.classList.toggle("is-animating", animate);

  els.dateLine.textContent = DAY_FORMATTER.format(state.selectedDate);
  els.messageText.textContent = state.isLoading ? "" : message;
  applyMessageSize(els.messageText, message);
  els.monthTitle.textContent = MONTH_FORMATTER.format(state.displayDate);
  els.yearInput.value = state.selectedDate.getFullYear();

  const isFavorite = state.favorites.has(key);
  els.favoriteButton.textContent = isFavorite ? "♥" : "♡";
  els.favoriteButton.setAttribute("aria-pressed", String(isFavorite));
  els.favoriteButton.setAttribute("aria-label", isFavorite ? "Remove from favorites" : "Add to favorites");
  els.themeToggle.textContent = state.isDark ? "☀" : "☾";

  renderWeekdays(els);
  renderCalendar(els, state);

  if (animate) {
    window.setTimeout(() => els.root.classList.remove("is-animating"), 180);
  }
}
function applyMessageSize(messageElement, message) {
  const length = message.trim().length;

  messageElement.classList.remove(
    "message-short",
    "message-medium",
    "message-long",
    "message-very-long"
  );

  if (length <= 120) {
    messageElement.classList.add("message-short");
  } else if (length <= 220) {
    messageElement.classList.add("message-medium");
  } else if (length <= 340) {
    messageElement.classList.add("message-long");
  } else {
    messageElement.classList.add("message-very-long");
  }
}
function renderWeekdays(els) {
  if (els.weekdayRow.children.length) return;
  els.weekdayRow.innerHTML = WEEKDAYS.map((day) => `<span>${day}</span>`).join("");
}

function renderCalendar(els, state) {
  const todayKey = toDateKey(todayDate());
  const selectedKey = toDateKey(state.selectedDate);
  const cells = buildMonthGrid(state.displayDate);

  els.calendarGrid.innerHTML = cells
    .map((date) => {
      if (!date) return `<span class="calendar-empty" aria-hidden="true"></span>`;

      const key = toDateKey(date);
      const hasMessage = state.messages.has(key);
      const isSelected = key === selectedKey;
      const isToday = key === todayKey;
      const isFavorite = state.favorites.has(key);

      return `
        <button
          class="day-button ${isSelected ? "selected" : ""} ${isToday ? "today" : ""} ${hasMessage ? "has-message" : ""} ${isFavorite ? "favorite" : ""}"
          type="button"
          data-date="${key}"
          role="gridcell"
          aria-selected="${isSelected}"
          aria-label="${DAY_FORMATTER.format(date)}${hasMessage ? ", message available" : ", no message available"}"
          aria-current="${isToday ? "date" : "false"}"
        >
          <span>${date.getDate()}</span>
        </button>
      `;
    })
    .join("");

  els.calendarGrid.querySelectorAll("[data-date]").forEach((button) => {
    button.addEventListener("click", () => {
      const [year, month, day] = button.dataset.date.split("-").map(Number);
      changeDate(els, state, new Date(year, month - 1, day));
    });
  });
}

function getShareText(state) {
  const key = toDateKey(state.selectedDate);
  const message = state.messages.get(key) || EMPTY_MESSAGE;
  return `${DAY_FORMATTER.format(state.selectedDate)}\n\n${message}\n\nॐ तत् सत्\nAnant Ki Aur`;
}

function loadFavorites() {
  try {
    return new Set(JSON.parse(localStorage.getItem("aka-favorites") || "[]"));
  } catch {
    return new Set();
  }
}

function saveFavorites(favorites) {
  localStorage.setItem("aka-favorites", JSON.stringify([...favorites]));
}

function applyTheme(isDark) {
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
}

let toastTimer;
function showToast(els, message) {
  window.clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("visible");
  toastTimer = window.setTimeout(() => els.toast.classList.remove("visible"), 2200);
}
