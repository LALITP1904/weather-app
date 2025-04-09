const weather = {
    apiKey: "f1bfd4293a6d8ffb4f59ce0814cfdf5b",
    currentCity: "",
    
    async fetchWeather(city) {
        try {
            toggleLoader(true);
            const currentResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${this.apiKey}`
            );
            const currentData = await currentResponse.json();
            
            const forecastResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${this.apiKey}`
            );
            const forecastData = await forecastResponse.json();
            
            this.displayWeather(currentData);
            this.displayForecast(forecastData);
            this.addToHistory(city);
            this.currentCity = city;
        } catch (error) {
            showError("Error fetching weather data");
        } finally {
            toggleLoader(false);
        }
    },

    displayWeather(data) {
        const { name } = data;
        const { icon, description } = data.weather[0];
        const { temp, humidity } = data.main;
        const { speed } = data.wind;

        document.querySelector(".city").textContent = `Weather in ${name}`;
        document.querySelector(".weather-icon").src = 
            `https://openweathermap.org/img/wn/${icon}.png`;
        document.querySelector(".weather-condition").textContent = description;
        document.querySelector(".temperature").textContent = `${temp.toFixed(1)}`;
        document.querySelector(".humidity").textContent = `${humidity}%`;
        document.querySelector(".wind").textContent = `${speed.toFixed(1)} m/s`;
    },

    displayForecast(data) {
        const forecastCards = document.querySelector(".forecast-cards");
        forecastCards.innerHTML = "";
        
        const dailyForecast = data.list.filter((item, index) => index % 8 === 0);
        
        dailyForecast.slice(0, 5).forEach(item => {
            const card = document.createElement("div");
            card.className = "forecast-card";
            card.innerHTML = `
                <h4>${new Date(item.dt * 1000).toLocaleDateString('en', {weekday: 'short'})}</h4>
                <img src="<https://openweathermap.org/img/wn/${item.weather>[0].icon}.png">
                <p>${item.main.temp.toFixed(1)}°C</p>
                <small>${item.weather[0].main}</small>
            `;
            forecastCards.appendChild(card);
        });
    },

    addToHistory(city) {
        let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
        history = [city, ...history.filter(item => item !== city)].slice(0, 5);
        localStorage.setItem("weatherHistory", JSON.stringify(history));
        this.displayHistory();
    },

    displayHistory() {
        const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
        const historyContainer = document.querySelector(".history-items");
        historyContainer.innerHTML = "";
        
        history.forEach(city => {
            const btn = document.createElement("button");
            btn.className = "history-item";
            btn.innerHTML = `<i class="fas fa-city"></i> ${city}`;
            btn.addEventListener("click", () => this.fetchWeather(city));
            historyContainer.appendChild(btn);
        });
    }
};

// Theme Toggle
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

// Loader
function toggleLoader(show) {
    document.querySelector(".loader").style.display = show ? "block" : "none";
}

// Event Listeners
document.querySelector(".cityName").addEventListener("click", () => {
    const city = document.querySelector(".search-bar").value;
    if (city) weather.fetchWeather(city);
});

document.querySelector(".curLoca").addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${weather.apiKey}`)
                .then(response => response.json())
                .then(data => weather.fetchWeather(data.name));
        },
        error => showError("Geolocation blocked")
    );
});

document.querySelector(".refresh").addEventListener("click", () => {
    if (weather.currentCity) weather.fetchWeather(weather.currentCity);
});

// Initialize
function initialize() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    weather.displayHistory();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${weather.apiKey}`)
                    .then(response => response.json())
                    .then(data => weather.fetchWeather(data.name));
            },
            () => weather.fetchWeather("London")
        );
    } else {
        weather.fetchWeather("London");
    }
}

initialize();
