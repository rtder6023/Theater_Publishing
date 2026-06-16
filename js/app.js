const ADULT_PRICE = 15000;
const YOUTH_PRICE = 12000;
const MAX_PERSONNEL = 100;
const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const SEATS_PER_ROW = 14;
const AISLE_AFTER = 7;

const MOVIES = [
  {
    id: 1,
    title: "쥬라기 월드: 새로운 시작",
    rating: "12",
    genre: "SF · 액션 · 132분",
    poster: "https://picsum.photos/seed/jurassic/200/280",
    showtimes: [
      { time: "10:30", theater: "1관 4층" },
      { time: "13:20", theater: "2관 4층" },
      { time: "16:10", theater: "1관 4층" },
      { time: "19:00", theater: "3관 5층" },
      { time: "21:40", theater: "1관 4층", soldOut: true },
    ],
  },
  {
    id: 2,
    title: "인사이드 아웃 2",
    rating: "all",
    genre: "애니메이션 · 가족 · 96분",
    poster: "https://picsum.photos/seed/insideout/200/280",
    showtimes: [
      { time: "11:00", theater: "4관 3층" },
      { time: "14:30", theater: "4관 3층" },
      { time: "17:50", theater: "5관 3층" },
    ],
  },
  {
    id: 3,
    title: "범죄도시 4",
    rating: "15",
    genre: "액션 · 범죄 · 109분",
    poster: "https://picsum.photos/seed/city/200/280",
    showtimes: [
      { time: "12:00", theater: "6관 6층" },
      { time: "15:20", theater: "6관 6층" },
      { time: "18:40", theater: "7관 6층" },
      { time: "22:00", theater: "6관 6층" },
    ],
  },
  {
    id: 4,
    title: "듄: 파트 2",
    rating: "12",
    genre: "SF · 드라마 · 166분",
    poster: "https://picsum.photos/seed/dune/200/280",
    showtimes: [
      { time: "13:00", theater: "1관 1층" },
      { time: "17:30", theater: "1관 1층" },
      { time: "21:00", theater: "1관 1층" },
    ],
  },
];

const state = {
  screen: "home",
  selectedDate: null,
  selectedMovie: null,
  selectedShowtime: null,
  adultCount: 0,
  youthCount: 0,
  selectedSeats: [],
  paymentMethod: "card",
  occupiedSeats: generateOccupiedSeats(),
};

function getTotalPersonnel() {
  return state.adultCount + state.youthCount;
}

function getRequiredSeatCount() {
  return getTotalPersonnel();
}

function getTotalPrice() {
  return state.adultCount * ADULT_PRICE + state.youthCount * YOUTH_PRICE;
}

function generateOccupiedSeats() {
  const occupied = new Set();
  ROWS.forEach((row) => {
    for (let i = 1; i <= SEATS_PER_ROW; i++) {
      if (Math.random() < 0.25) {
        occupied.add(`${row}${i}`);
      }
    }
  });
  return occupied;
}

function formatPrice(n) {
  return n.toLocaleString("ko-KR") + "원";
}

function updateTime() {
  const now = new Date();
  const str = now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  document.querySelectorAll("[data-time], #currentTime").forEach((el) => {
    el.textContent = str;
  });
}

function showScreen(name) {
  const current = document.querySelector(".screen--active");
  const next = document.querySelector(`[data-screen="${name}"]`);
  if (!next || current === next) return;

  current.classList.add("screen--exit-left");
  current.classList.remove("screen--active");

  setTimeout(() => {
    current.classList.remove("screen--exit-left");
    next.classList.add("screen--active");
    state.screen = name;
  }, 200);
}

function initDates() {
  const list = document.getElementById("dateList");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const today = new Date();

  list.innerHTML = "";
  for (let i = 0; i < 16; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const isToday = i === 0;

    const btn = document.createElement("button");
    btn.className = "date-item" + (isToday ? " date-item--active" : "");
    btn.dataset.date = iso;
    btn.innerHTML = `
      <div class="date-item__day">${isToday ? "오늘" : days[d.getDay()]}</div>
      <div class="date-item__date">${d.getDate()}</div>
    `;
    btn.addEventListener("click", () => selectDate(iso, btn));
    list.appendChild(btn);

    if (isToday) state.selectedDate = iso;
  }
}

function selectDate(iso, el) {
  state.selectedDate = iso;
  document
    .querySelectorAll(".date-item")
    .forEach((d) => d.classList.remove("date-item--active"));
  el.classList.add("date-item--active");
}

function renderMovies() {
  const list = document.getElementById("movieList");
  list.innerHTML = MOVIES.map(
    (movie) => `
    <article class="movie-card${state.selectedMovie?.id === movie.id ? " movie-card--selected" : ""}" data-movie-id="${movie.id}">
      <div class="movie-card__poster" style="background-image:url('${movie.poster}')"></div>
      <div class="movie-card__body">
        <h3 class="movie-card__title">
          ${movie.title}
          <span class="movie-card__rating rating--${movie.rating}">${movie.rating === "all" ? "ALL" : movie.rating}</span>
        </h3>
        <p class="movie-card__genre">${movie.genre}</p>
        <div class="showtime-grid">
          ${movie.showtimes
            .map(
              (st, idx) => `
            <button
              class="showtime-btn${st.soldOut ? " showtime-btn--disabled" : ""}${state.selectedShowtime?.movieId === movie.id && state.selectedShowtime?.idx === idx ? " showtime-btn--active" : ""}"
              data-movie-id="${movie.id}"
              data-showtime-idx="${idx}"
              ${st.soldOut ? "disabled" : ""}
            >
              ${st.time}
              <small>${st.theater}</small>
            </button>
          `,
            )
            .join("")}
        </div>
      </div>
    </article>
  `,
  ).join("");

  list
    .querySelectorAll(".showtime-btn:not(.showtime-btn--disabled)")
    .forEach((btn) => {
      btn.addEventListener("click", () =>
        selectShowtime(+btn.dataset.movieId, +btn.dataset.showtimeIdx),
      );
    });
}

function resetPersonnel() {
  state.adultCount = 0;
  state.youthCount = 0;
  state.selectedSeats = [];
}

function selectShowtime(movieId, idx) {
  const movie = MOVIES.find((m) => m.id === movieId);
  const showtime = movie.showtimes[idx];
  state.selectedMovie = movie;
  state.selectedShowtime = { movieId, idx, ...showtime };
  resetPersonnel();
  renderMovies();
  document.getElementById("btnToPersonnel").disabled = false;
}

function updatePersonnelUI() {
  const total = getTotalPersonnel();

  document.getElementById("adultCount").textContent = state.adultCount;
  document.getElementById("youthCount").textContent = state.youthCount;
  document.getElementById("totalPersonnel").textContent = total;

  document.getElementById("adultMinus").disabled = state.adultCount <= 0;
  document.getElementById("youthMinus").disabled = state.youthCount <= 0;
  document.getElementById("adultPlus").disabled = total >= MAX_PERSONNEL;
  document.getElementById("youthPlus").disabled = total >= MAX_PERSONNEL;

  document.getElementById("btnToSeat").disabled = total === 0;
}

function changePersonnel(type, delta) {
  const total = getTotalPersonnel();
  if (delta > 0 && total >= MAX_PERSONNEL) return;
  if (type === "adult") {
    if (delta < 0 && state.adultCount <= 0) return;
    state.adultCount += delta;
  } else {
    if (delta < 0 && state.youthCount <= 0) return;
    state.youthCount += delta;
  }
  state.selectedSeats = [];
  updatePersonnelUI();
}

function updatePersonnelScreenInfo() {
  const { selectedMovie: movie, selectedShowtime: st, selectedDate } = state;
  if (!movie || !st) return;

  const dateObj = new Date(selectedDate + "T00:00:00");
  const dateStr = dateObj.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  document.getElementById("personnelMoviePoster").style.backgroundImage =
    `url('${movie.poster}')`;
  document.getElementById("personnelMovieTitle").textContent = movie.title;
  document.getElementById("personnelMovieMeta").textContent =
    `${dateStr} · ${st.time} · ${st.theater}`;
}

function renderSeatMap() {
  const map = document.getElementById("seatMap");
  const required = getRequiredSeatCount();

  map.innerHTML = ROWS.map((row) => {
    let seatsHtml = "";
    for (let i = 1; i <= SEATS_PER_ROW; i++) {
      if (i === AISLE_AFTER + 1) {
        seatsHtml += '<div class="seat-row__aisle"></div>';
      }
      const id = `${row}${i}`;
      const isOccupied = state.occupiedSeats.has(id);
      const isSelected = state.selectedSeats.includes(id);
      let cls = "seat";
      if (isOccupied) cls += " seat--occupied";
      else if (isSelected) cls += " seat--selected";

      seatsHtml += `<button class="${cls}" data-seat="${id}" ${isOccupied ? "disabled" : ""} aria-label="${id}">${isOccupied || isSelected ? "" : i}</button>`;
    }
    return `
      <div class="seat-row">
        <span class="seat-row__label">${row}</span>
        <div class="seat-row__seats">${seatsHtml}</div>
      </div>
    `;
  }).join("");

  map.querySelectorAll(".seat:not(.seat--occupied)").forEach((btn) => {
    btn.addEventListener("click", () => toggleSeat(btn.dataset.seat));
  });

  updateSeatSummary();
  document.getElementById("requiredSeatCount").textContent = required;
  document.getElementById("btnToPayment").disabled =
    state.selectedSeats.length !== required;
}

function toggleSeat(id) {
  const required = getRequiredSeatCount();
  const idx = state.selectedSeats.indexOf(id);

  if (idx >= 0) {
    state.selectedSeats.splice(idx, 1);
  } else {
    if (state.selectedSeats.length >= required) return;
    state.selectedSeats.push(id);
    state.selectedSeats.sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true }),
    );
  }
  renderSeatMap();
}

function updateSeatSummary() {
  const text = state.selectedSeats.length
    ? state.selectedSeats.join(", ")
    : "없음";
  document.getElementById("selectedSeatsText").textContent = text;
  document.getElementById("selectedCount").textContent =
    state.selectedSeats.length;
}

function updateSeatScreenInfo() {
  const { selectedMovie: movie, selectedShowtime: st, selectedDate } = state;
  if (!movie || !st) return;

  const dateObj = new Date(selectedDate + "T00:00:00");
  const dateStr = dateObj.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  document.getElementById("seatMoviePoster").style.backgroundImage =
    `url('${movie.poster}')`;
  document.getElementById("seatMovieTitle").textContent = movie.title;
  document.getElementById("seatMovieMeta").textContent =
    `${dateStr} · ${st.time} · ${st.theater} · ${getTotalPersonnel()}명 (성인 ${state.adultCount} · 청소년 ${state.youthCount})`;
}

function updatePaymentScreen() {
  const {
    selectedMovie: movie,
    selectedShowtime: st,
    selectedDate,
    selectedSeats,
    adultCount,
    youthCount,
  } = state;
  if (!movie || !st) return;

  const dateObj = new Date(selectedDate + "T00:00:00");
  const dateStr = dateObj.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  document.getElementById("orderPoster").style.backgroundImage =
    `url('${movie.poster}')`;
  document.getElementById("orderTitle").textContent = movie.title;
  document.getElementById("orderDate").textContent = dateStr + "요일";
  document.getElementById("orderTime").textContent = st.time;
  document.getElementById("orderTheater").textContent = st.theater;
  document.getElementById("orderPersonnel").textContent =
    `성인 ${adultCount} · 청소년 ${youthCount} (총 ${adultCount + youthCount}명)`;
  document.getElementById("orderSeats").textContent = selectedSeats.join(", ");

  const priceRows = [];
  if (adultCount > 0) {
    priceRows.push(`
      <div class="price-row">
        <span>성인 ${adultCount}매 × ${formatPrice(ADULT_PRICE)}</span>
        <span>${formatPrice(adultCount * ADULT_PRICE)}</span>
      </div>
    `);
  }
  if (youthCount > 0) {
    priceRows.push(`
      <div class="price-row">
        <span>청소년 ${youthCount}매 × ${formatPrice(YOUTH_PRICE)}</span>
        <span>${formatPrice(youthCount * YOUTH_PRICE)}</span>
      </div>
    `);
  }

  document.getElementById("priceBox").innerHTML = `
    ${priceRows.join("")}
    <div class="price-row price-row--total">
      <span>총 결제금액</span>
      <span id="priceTotal">${formatPrice(getTotalPrice())}</span>
    </div>
  `;
}

function updateCompleteScreen() {
  const {
    selectedMovie: movie,
    selectedShowtime: st,
    selectedSeats,
    selectedDate,
    adultCount,
    youthCount,
  } = state;

  document.getElementById("completeInfo").innerHTML = `
    <strong>${movie.title}</strong><br>
    ${selectedDate} · ${st.time} · ${st.theater}<br>
    인원: 성인 ${adultCount} · 청소년 ${youthCount}<br>
    좌석: ${selectedSeats.join(", ")}<br>
    결제금액: ${formatPrice(getTotalPrice())}
  `;
}

function navigateTo(name) {
  if (name === "movie") {
    initDates();
    renderMovies();
    document.getElementById("btnToPersonnel").disabled =
      !state.selectedShowtime;
  }
  if (name === "personnel") {
    updatePersonnelScreenInfo();
    updatePersonnelUI();
  }
  if (name === "seat") {
    if (getTotalPersonnel() === 0) return;
    state.selectedSeats = [];
    updateSeatScreenInfo();
    renderSeatMap();
  }
  if (name === "payment") {
    const required = getRequiredSeatCount();
    if (state.selectedSeats.length !== required) return;
    updatePaymentScreen();
  }
  if (name === "complete") {
    updateCompleteScreen();
  }
  if (name === "home") {
    state.selectedMovie = null;
    state.selectedShowtime = null;
    resetPersonnel();
    state.occupiedSeats = generateOccupiedSeats();
    document.getElementById("btnToPersonnel").disabled = true;
  }
  showScreen(name);
}

document.querySelectorAll("[data-go]").forEach((el) => {
  el.addEventListener("click", () => navigateTo(el.dataset.go));
});

document
  .getElementById("btnToPersonnel")
  .addEventListener("click", () => navigateTo("personnel"));
document
  .getElementById("btnToSeat")
  .addEventListener("click", () => navigateTo("seat"));
document
  .getElementById("btnToPayment")
  .addEventListener("click", () => navigateTo("payment"));
document
  .getElementById("btnPay")
  .addEventListener("click", () => navigateTo("complete"));

document
  .getElementById("adultPlus")
  .addEventListener("click", () => changePersonnel("adult", 1));
document
  .getElementById("adultMinus")
  .addEventListener("click", () => changePersonnel("adult", -1));
document
  .getElementById("youthPlus")
  .addEventListener("click", () => changePersonnel("youth", 1));
document
  .getElementById("youthMinus")
  .addEventListener("click", () => changePersonnel("youth", -1));

document.querySelectorAll(".payment-card").forEach((card) => {
  card.addEventListener("click", () => {
    document
      .querySelectorAll(".payment-card")
      .forEach((c) => c.classList.remove("payment-card--active"));
    card.classList.add("payment-card--active");
    state.paymentMethod = card.dataset.method;
  });
});

document.getElementById("datePrev").addEventListener("click", () => {
  document
    .getElementById("dateList")
    .scrollBy({ left: -200, behavior: "smooth" });
});

document.getElementById("dateNext").addEventListener("click", () => {
  document
    .getElementById("dateList")
    .scrollBy({ left: 200, behavior: "smooth" });
});

updateTime();
setInterval(updateTime, 30000);
