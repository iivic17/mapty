"use strict";

class Workout {
  #date = new Date();
  #id = String(Date.now()).slice(-10);
  #coords;
  #distance;
  #duration;
  #type;
  #description;

  constructor(coords, distance, duration, type) {
    this.#coords = coords;
    this.#distance = distance;
    this.#duration = duration;
    this.#type = type;
    this.#setDescription();
  }

  #setDescription() {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    this.#description = `${this.#type[0].toUpperCase()}${this.#type.slice(
      1
    )} on ${months[this.#date.getMonth()]} ${this.#date.getDate()}`;
  }

  get date() {
    return this.#date;
  }

  get id() {
    return this.#id;
  }

  get coords() {
    return this.#coords;
  }

  get distance() {
    return this.#distance;
  }

  get duration() {
    return this.#duration;
  }

  get type() {
    return this.#type;
  }

  get description() {
    return this.#description;
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration, "running");
    this.cadence = cadence;
    this.#calcPace();
  }

  #calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration, "cycling");
    this.elevationGain = elevationGain;
    this.#calcSpeed();
  }

  #calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

class App {
  #map;
  #mapEvent;
  #workouts = [];
  #zoomLevel = 14;

  #form = document.querySelector(".form");
  #containerWorkouts = document.querySelector(".workouts");
  #inputType = document.querySelector(".form__input--type");
  #inputDistance = document.querySelector(".form__input--distance");
  #inputDuration = document.querySelector(".form__input--duration");
  #inputCadence = document.querySelector(".form__input--cadence");
  #inputElevation = document.querySelector(".form__input--elevation");

  constructor() {
    this.#getPosition();

    this.#form.addEventListener("submit", this.#newWorkout.bind(this));
    this.#inputType.addEventListener(
      "change",
      this.#toggleElevationField.bind(this)
    );
    this.#containerWorkouts.addEventListener(
      "click",
      this.#moveToPopup.bind(this)
    );
  }

  #getPosition() {
    navigator.geolocation.getCurrentPosition(
      this.#loadMap.bind(this),
      this.#handleLoadMapErr
    );
  }

  #loadMap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map("map").setView(coords, this.#zoomLevel);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this.#showForm.bind(this));
  }

  #handleLoadMapErr() {
    alert("Could not get your position!");
  }

  #showForm(e) {
    this.#mapEvent = e;
    this.#form.classList.remove("hidden");
    this.#inputDistance.focus();
  }

  #hideForm() {
    this.#inputDistance.value =
      this.#inputDuration.value =
      this.#inputCadence.value =
      this.#inputElevation.value =
        "";

    this.#form.style.display = "none";
    this.#form.classList.add("hidden");
    setTimeout(() => (this.#form.style.display = "grid"), 1000);
  }

  #toggleElevationField() {
    this.#inputElevation
      .closest(".form__row")
      .classList.toggle("form__row--hidden");
    this.#inputCadence
      .closest(".form__row")
      .classList.toggle("form__row--hidden");
  }

  #renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.description}`
      )
      .openPopup();
  }

  #renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
      <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">${
          workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>
    `;

    if (workout.type === "running") {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
      `;
    }

    if (workout.type === "cycling") {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
      `;
    }

    this.#form.insertAdjacentHTML("afterend", html);
  }

  #newWorkout(e) {
    function validInputs(...inputs) {
      return inputs.every((input) => Number.isFinite(input));
    }

    function allPositive(...inputs) {
      return inputs.every((input) => input > 0);
    }

    e.preventDefault();

    const type = this.#inputType.value;
    const distance = Number(this.#inputDistance.value);
    const duration = Number(this.#inputDuration.value);
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    if (type === "running") {
      const cadence = Number(this.#inputCadence.value);

      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) {
        return alert("Inputs have to be positive numbers!");
      }

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    if (type === "cycling") {
      const elevation = Number(this.#inputElevation.value);

      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      ) {
        return alert("Inputs have to be positive numbers!");
      }

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    this.#workouts.push(workout);
    this.#renderWorkoutMarker(workout);
    this.#renderWorkout(workout);
    this.#hideForm();
  }

  #moveToPopup(e) {
    const workoutEl = e.target.closest(".workout");

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      (workout) => workout.id === workoutEl.dataset.id
    );

    this.#map.setView(workout.coords, this.#zoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
}

const app = new App();
