# Mapty

Mapty is a modern JavaScript application designed for tracking and managing running and cycling workouts directly on an interactive map. By leveraging geolocation and mapping technologies, it provides an intuitive interface for users to log their fitness activities while visualizing their routes. Built with a focus on clean, scalable code and interactive user experience.

![Mapty Screenshot](mapty-mockup.png)

## Features

### 🗺️ Interactive Map Integration
- Built with the **Leaflet.js** library for seamless map rendering and interaction.
- Users can add workouts by clicking directly on the map.

### 📊 Dynamic Workout Logging
- Supports two types of workouts: **Running** and **Cycling**, each with unique attributes like pace and elevation gain.
- Auto-saves workout data using **LocalStorage**, enabling data persistence across sessions.

### 💡 User Interface and Interaction
- Smooth form toggling and dynamic input fields for customized workout attributes.
- Clean, responsive layout designed with **CSS Grid** for desktop-first experiences.
- Workout details displayed in a scrollable list with visually distinctive styles based on activity type.

### 🚀 Code Architecture and Optimizations
- Implements object-oriented principles with a modular class hierarchy for **Workout**, **Running**, and **Cycling** activities.
- Encapsulation of logic via private class fields and methods for improved readability and maintainability.
- Extensive use of ES6+ features such as arrow functions, template literals, and `async/await`.

## Technologies

### Libraries & APIs
- **Leaflet.js**: For interactive map functionality.
- **LocalStorage API**: To persist workout data.
- **Geolocation API**: Automatically centers the map based on the user's location.

### CSS Techniques
- **Transitions and Animations**: Enhances user experience with smooth element visibility toggling.

### HTML and Metadata
- **Semantic Markup**: Clean and accessible HTML structure.
