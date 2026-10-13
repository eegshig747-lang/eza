
"use strict";

// GOOGLE APPS SCRIPT
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyjP6NN6R8jvc26uHZsz2FrfsuWA9W-mAl0fQwTSWBew3GwiHDbzXYelbgAjJuSpAw7/exec";

const $ = (id) => document.getElementById(id);

const pages = document.querySelectorAll(".page");
const dateCards = document.querySelectorAll(".date-card");
const showCards = document.querySelectorAll(".show-card");

let selectedDate = "";
let selectedShow = "";
let selectedDay = null;
let currentMonth = new Date();
let hasPrinted = false;
let sending = false;

currentMonth.setDate(1);

function showPage(pageId) {
  pages.forEach((page) => {
    page.classList.toggle("active", page.id === pageId);
  });
  window.scrollTo(0, 0);
}

function formatDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

// PHOTO BOOTH SOUND
function playPrintSound() {
  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(
      90, context.currentTime
    );
    oscillator.frequency.linearRampToValueAtTime(
      55, context.currentTime + 0.45
    );

    gain.gain.setValueAtTime(
      0.025, context.currentTime
    );
    gain.gain.exponentialRampToValueAtTime(
      0.001, context.currentTime + 0.5
    );

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.5);

    oscillator.onended = () => context.close();
  } catch (error) {
    console.log("Audio unavailable:", error);
  }
}

// PHOTO BOOTH PRINT
$("printButton").addEventListener("click", () => {
  if (hasPrinted) return;

  hasPrinted = true;
  $("printButton").disabled = true;

  playPrintSound();
  $("photoPaper").classList.add("printed");

  setTimeout(() => {
    $("openButton").disabled = false;
  }, 3000);
});

$("openButton").addEventListener("click", () => {
  showPage("dates");
});

$("datesBack").addEventListener("click", () => {
  showPage("home");
});

// DATE SELECTION
dateCards.forEach((card) => {
  card.addEventListener("click", () => {
    dateCards.forEach((item) => {
      item.classList.remove("selected");
    });

    card.classList.add("selected");
    selectedDate = card.dataset.date;
    selectedShow = "";
    selectedDay = null;

    showCards.forEach((item) => {
      item.classList.remove("selected");
    });
    $("comedyNext").disabled = true;
    $("dateNext").disabled = false;
  });
});

$("dateNext").addEventListener("click", () => {
  if (!selectedDate) return;

  if (selectedDate === "Хошин шог үзэх") {
    showPage("comedy");
  } else {
    openCalendar();
  }
});

// COMEDY SELECTION
showCards.forEach((card) => {
  card.addEventListener("click", () => {
    showCards.forEach((item) => {
      item.classList.remove("selected");
    });

    card.classList.add("selected");
    selectedShow = card.dataset.show;
    selectedDay = null;

    $("comedyNext").disabled = false;
  });
});

$("comedyNext").addEventListener("click", () => {
  if (!selectedShow) return;
  openCalendar();
});

$("comedyBack").addEventListener("click", () => {
  showPage("dates");
});

// CALENDAR
const MONTHS = [
  "January", "February", "March",
  "April", "May", "June",
  "July", "August", "September",
  "October", "November", "December"
];

const WEEKDAYS = [
  "Sun", "Mon", "Tue", "Wed",
  "Thu", "Fri", "Sat"
];

function openCalendar() {
  const today = new Date();

  currentMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  selectedDay = null;

  $("doneButton").disabled = true;
  $("doneButton").classList.remove("hidden");
  $("calendarBox").classList.remove("hidden");
  $("calendarBack").classList.remove("hidden");
  $("confirmation").classList.add("hidden");

  renderCalendar();
  showPage("calendarPage");
}

function renderCalendar() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  $("monthTitle").textContent =
    `${MONTHS[month]} ${year}`;

  const calendarDays = $("calendarDays");
  calendarDays.innerHTML = "";

  WEEKDAYS.forEach((name) => {
    const heading = document.createElement("div");
    heading.className = "weekday";
    heading.textContent = name;
    calendarDays.appendChild(heading);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(
    year, month + 1, 0
  ).getDate();

  for (let i = 0; i < firstDay; i++) {
    calendarDays.appendChild(
      document.createElement("div")
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const button = document.createElement("button");

    button.type = "button";
    button.className = "day";
    button.textContent = day;

    const isPast = date < today;
    const isWeekend =
      date.getDay() === 0 || date.getDay() === 6;

    const comedyWeekend =
      selectedDate === "Хошин шог үзэх" &&
      isWeekend;

    if (isPast || comedyWeekend) {
      button.disabled = true;
    }

    if (
      selectedDay &&
      formatDate(selectedDay) === formatDate(date)
    ) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      if (button.disabled) return;

      selectedDay = date;

      document.querySelectorAll(".day").forEach(
        (item) => item.classList.remove("selected")
      );

      button.classList.add("selected");
      $("doneButton").disabled = false;
    });

    calendarDays.appendChild(button);
  }

  const firstCurrentMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  $("prevMonth").disabled =
    currentMonth <= firstCurrentMonth;
}

$("prevMonth").addEventListener("click", () => {
  const today = new Date();

  const earliest = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  const previous = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() - 1,
    1
  );

  if (previous < earliest) return;

  currentMonth = previous;
  renderCalendar();
});

$("nextMonth").addEventListener("click", () => {
  currentMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    1
  );

  renderCalendar();
});

$("calendarBack").addEventListener("click", () => {
  if (selectedDate === "Хошин шог үзэх") {
    showPage("comedy");
  } else {
    showPage("dates");
  }
});

// DONE + GMAIL
$("doneButton").addEventListener("click", async () => {
  if (!selectedDate || !selectedDay || sending) return;

  if (
    selectedDate === "Хошин шог үзэх" &&
    !selectedShow
  ) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDay < today) {
    alert("Ирээдүйн өдөр сонгоно уу.");
    return;
  }

  const data = {
    dateType: selectedDate,
    show:
      selectedDate === "Хошин шог үзэх"
        ? selectedShow
        : "",
    selectedDay: formatDate(selectedDay)
  };

  sending = true;

  const button = $("doneButton");
  button.disabled = true;
  button.textContent = "SENDING...";

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain"
      },
      body: JSON.stringify(data)
    });

    let summary = data.dateType;

    if (data.show) {
      summary += "\n" + data.show;
    }

    summary += "\n" + data.selectedDay;

    $("resultText").textContent = summary;

    $("calendarBox").classList.add("hidden");
    $("doneButton").classList.add("hidden");
    $("calendarBack").classList.add("hidden");
    $("confirmation").classList.remove("hidden");

  } catch (error) {
    console.error(error);
    alert("Илгээхэд алдаа гарлаа. Дахин оролдоно уу.");
  } finally {
    sending = false;
    button.textContent = "DONE ♡";
    button.disabled = false;
  }
});

// SHARE
$("shareButton").addEventListener("click", async () => {
  const shareText =
    "Our Date ♡\n\n" + $("resultText").textContent;

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Birthday Date Invitation",
        text: shareText
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error(error);
      }
    }
  } else {
    try {
      await navigator.clipboard.writeText(shareText);
      alert("Date information copied ♡");
    } catch (error) {
      alert(shareText);
    }
  }
});

// BACK FROM CONFIRMATION
$("resultBack").addEventListener("click", () => {
  $("confirmation").classList.add("hidden");
  $("calendarBox").classList.remove("hidden");
  $("doneButton").classList.remove("hidden");
  $("calendarBack").classList.remove("hidden");
  renderCalendar();
});

showPage("home");
