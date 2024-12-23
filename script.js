"use strict";

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

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

let map, mapEvent;

navigator.geolocation.getCurrentPosition(
  function (data) {
    const { latitude, longitude } = data.coords;
    const coords = [latitude, longitude];

    map = L.map("map").setView(coords, 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    map.on("click", function (e) {
      mapEvent = e;
      form.classList.remove("hidden");
      inputDistance.focus();
    });
  },
  function () {
    alert("Could not get your position!");
  }
);

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const { lat, lng } = mapEvent.latlng;

  inputDistance.value =
    inputDuration.value =
    inputCadence.value =
    inputElevation.value =
      "";

  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: "running-popup",
      })
    )
    .setPopupContent("Workout")
    .openPopup();
});

inputType.addEventListener('change', function() {
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
})