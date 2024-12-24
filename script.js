"use strict";

class Workout {
  _date = new Date();
  _id = String(Date.now()).slice(-10);
  _coords;
  _distance;
  _duration;
  _type;
  _description;

  constructor(coords, distance, duration, type) {
    this._coords = coords;
    this._distance = distance;
    this._duration = duration;
    this._type = type;
    this._setDescription();
  }

  _setDescription() {
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

    this._description = `${this._type[0].toUpperCase()}${this._type.slice(
      1
    )} on ${months[this._date.getMonth()]} ${this._date.getDate()}`;
  }

  toJson() {
    return {
      date: this._date,
      id: this._id,
      coords: this._coords,
      distance: this._distance,
      duration: this._duration,
      type: this._type,
      description: this._description,
    };
  }

  static fromJSON(data) {
    const workout = new Workout(
      data.coords,
      data.distance,
      data.duration,
      data.type
    );
    workout._date = new Date(data.date);
    workout._id = data.id;
    return workout;
  }

  get date() {
    return this._date;
  }

  get id() {
    return this._id;
  }

  get coords() {
    return this._coords;
  }

  get distance() {
    return this._distance;
  }

  get duration() {
    return this._duration;
  }

  get type() {
    return this._type;
  }

  get description() {
    return this._description;
  }
}

class Running extends Workout {
  _pace;
  _cadence;

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration, "running");
    this._cadence = cadence;
    this._calcPace();
  }

  _calcPace() {
    this._pace = this._duration / this._distance;
  }

  toJson() {
    return {
      ...super.toJson(),
      cadence: this._cadence,
      pace: this._pace,
    };
  }

  static fromJSON(data) {
    const running = new Running(
      data.coords,
      data.distance,
      data.duration,
      data.cadence
    );
    running._date = new Date(data.date);
    running._id = data.id;
  
    running._calcPace();
  
    return running;
  }

  get cadence() {
    return this._cadence;
  }

  get pace() {
    return this._pace;
  }
}

class Cycling extends Workout {
  _elevationGain;
  _speed;

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration, "cycling");
    this._elevationGain = elevationGain;
    this._calcSpeed();
  }

  _calcSpeed() {
    this._speed = this._distance / (this._duration / 60);
  }

  toJson() {
    return {
      ...super.toJson(),
      elevationGain: this._elevationGain,
      speed: this._speed,
    };
  }

  static fromJSON(data) {
    const cycling = new Cycling(
      data.coords,
      data.distance,
      data.duration,
      data.elevationGain
    );
    cycling._date = new Date(data.date);
    cycling._id = data.id;
  
    cycling._calcSpeed();
  
    return cycling;
  }

  get elevationGain() {
    return this._elevationGain;
  }

  get speed() {
    return this._speed;
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

    this.#initializeWorkouts();
  }

  #initializeWorkouts() {
    this.#getLocalStorage();
    if (this.#workouts.length > 0) {
      this.#renderWorkouts();
    }
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

    if (this.#workouts.length > 0) {
      this.#workouts.forEach((workout) => this.#renderWorkoutMarker(workout));
    }
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

  #renderWorkouts() {
    this.#workouts.forEach((workout) => {
      this.#renderWorkout(workout);
    });
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
    this.#setLocalStorage();
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

  #setLocalStorage() {
    const data = this.#workouts.map((workout) => workout.toJson());
    localStorage.setItem("mapty-workouts", JSON.stringify(data));
  }

  #getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("mapty-workouts"));
    if (!data) return;

    this.#workouts = data.map((item) => {
      if (item.type === "running") return Running.fromJSON(item);
      if (item.type === "cycling") return Cycling.fromJSON(item);
      return Workout.fromJSON(item);
    });
  }
}

const app = new App();