const TICKET_PRICE = 15000;
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
      // { time: '13:00', theater: 'IMAX 1관' },
      // { time: '17:30', theater: 'IMAX 1관' },
      // { time: '21:00', theater: 'IMAX 1관' },
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
  selectedSeats: [],
  paymentMethod: "card",
  occupiedSeats: generateOccupiedSeats(),
};

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

function selectShowtime(movieId, idx) {
  const movie = MOVIES.find((m) => m.id === movieId);
  const showtime = movie.showtimes[idx];
  state.selectedMovie = movie;
  state.selectedShowtime = { movieId, idx, ...showtime };
  state.selectedSeats = [];
  renderMovies();
  document.getElementById("btnToSeat").disabled = false;
}

function renderSeatMap() {
  const map = document.getElementById("seatMap");
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
      {
        isOccupied || isSelected
          ? (seatsHtml += `<button class="${cls}" value="1" data-seat="${id}" ${isOccupied ? "disabled" : ""} aria-label="${id}"></button>`)
          : (seatsHtml += `<button class="${cls}" value="1" data-seat="${id}" ${isOccupied ? "disabled" : ""} aria-label="${id}">${i}</button>`);
      }
      // seatsHtml += `<button class="${cls}" value="1" data-seat="${id}" ${isOccupied ? "disabled" : ""} aria-label="${id}"></button>`;

      console.log(row);
      console.log(seatsHtml);
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
}

function toggleSeat(id) {
  const idx = state.selectedSeats.indexOf(id);
  if (idx >= 0) {
    state.selectedSeats.splice(idx, 1);
  } else {
    if (state.selectedSeats.length >= 8) return;
    state.selectedSeats.push(id);
    state.selectedSeats.sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true }),
    );
  }
  renderSeatMap();
  document.getElementById("btnToPayment").disabled =
    state.selectedSeats.length === 0;
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
    `${dateStr} · ${st.time} · ${st.theater}`;
}

function updatePaymentScreen() {
  const {
    selectedMovie: movie,
    selectedShowtime: st,
    selectedDate,
    selectedSeats,
  } = state;
  if (!movie || !st) return;

  const dateObj = new Date(selectedDate + "T00:00:00");
  const dateStr = dateObj.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
  const qty = selectedSeats.length;
  const total = qty * TICKET_PRICE;

  document.getElementById("orderPoster").style.backgroundImage =
    `url('${movie.poster}')`;
  document.getElementById("orderTitle").textContent = movie.title;
  document.getElementById("orderDate").textContent = dateStr + "요일";
  document.getElementById("orderTime").textContent = st.time;
  document.getElementById("orderTheater").textContent = st.theater;
  document.getElementById("orderSeats").textContent = selectedSeats.join(", ");
  document.getElementById("priceQty").textContent = qty;
  document.getElementById("priceSubtotal").textContent = formatPrice(total);
  document.getElementById("priceTotal").textContent = formatPrice(total);
}

function updateCompleteScreen() {
  const {
    selectedMovie: movie,
    selectedShowtime: st,
    selectedSeats,
    selectedDate,
  } = state;
  console.log(selectedDate);
  document.getElementById("completeInfo").innerHTML = `
    <strong>${movie.title}</strong><br>
    ${selectedDate} · ${st.time} · ${st.theater}<br>
    좌석: ${selectedSeats.join(", ")}<br>
    결제금액: ${formatPrice(selectedSeats.length * TICKET_PRICE)}
  `;
}

function navigateTo(name) {
  if (name === "movie") {
    initDates();
    renderMovies();
    document.getElementById("btnToSeat").disabled = !state.selectedShowtime;
  }
  if (name === "seat") {
    updateSeatScreenInfo();
    renderSeatMap();
    document.getElementById("btnToPayment").disabled =
      state.selectedSeats.length === 0;
  }
  if (name === "payment") {
    updatePaymentScreen();
  }
  if (name === "complete") {
    updateCompleteScreen();
  }
  if (name === "home") {
    state.selectedMovie = null;
    state.selectedShowtime = null;
    state.selectedSeats = [];
    state.occupiedSeats = generateOccupiedSeats();
    document.getElementById("btnToSeat").disabled = true;
  }
  showScreen(name);
}

document.querySelectorAll("[data-go]").forEach((el) => {
  el.addEventListener("click", () => navigateTo(el.dataset.go));
});

document
  .getElementById("btnToSeat")
  .addEventListener("click", () => navigateTo("seat"));
document
  .getElementById("btnToPayment")
  .addEventListener("click", () => navigateTo("payment"));
document
  .getElementById("btnPay")
  .addEventListener("click", () => navigateTo("complete"));

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
