var key = 'b4804e7791e2911215584fe0723200ad';
var city = "Austin";
var cityHist = JSON.parse(localStorage.getItem('city')) || [];

// Search button click handler
$('.search').on("click", function () {
	city = $(this).parent('.btnPar').siblings('.textVal').val().trim();
	if (!city) return;
	cityHist.push(city);  // Add city to history
	if (cityHist.length > 5) cityHist.shift();  // Keep only 5 recent cities
	localStorage.setItem('city', JSON.stringify(cityHist));  // Save to localStorage
	fiveForecastEl.empty();  // Clear previous forecast
	getWeatherToday();  // Fetch today's weather
	getHistory();  // Update history buttons
});

// Generate history buttons
function getHistory() {
	$('.cityHist').empty();  // Clear existing buttons
	cityHist.forEach(city => {
		$('.cityHist').prepend($('<button>').text(city).addClass('btn btn-outline-secondary histBtn'));
	});
	$('.histBtn').on("click", function () {
		city = $(this).text();  // Set city from history
		fiveForecastEl.empty();
		getWeatherToday();  // Fetch weather for selected city
	});
}

// Fetch today's weather
function getWeatherToday() {
	var getUrlCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${key}`;
	$.get(getUrlCurrent, function (response) {
		// Display weather info for today
		$('.cardBodyToday').html(`
			<h3>${response.name} (${moment().format('MMMM Do YYYY')})</h3>
			<img src="https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png">
			<p>Temperature: ${response.main.temp} °F</p>
			<p>Feels Like: ${response.main.feels_like} °F</p>
			<p>Humidity: ${response.main.humidity} %</p>
			<p>Wind Speed: ${response.wind.speed} MPH</p>
		`);
		// Fetch UV index for today
		var getUrlUvi = `https://api.openweathermap.org/data/2.5/onecall?lat=${response.coord.lat}&lon=${response.coord.lon}&exclude=hourly,daily,minutely&appid=${key}`;
		$.get(getUrlUvi, function (uviResponse) {
			$('.cardBodyToday').append(`<p>UV Index: <span class="${getUviClass(uviResponse.current.uvi)}">${uviResponse.current.uvi}</span></p>`);
		});
	});
	getFiveDayForecast();  // Fetch 5-day forecast
}

// Determine UV index class for styling
function getUviClass(uvi) {
	if (uvi <= 2) return 'green';
	if (uvi <= 5) return 'yellow';
	if (uvi <= 7) return 'orange';
	if (uvi <= 10) return 'red';
	return 'purple';
}

// Fetch 5-day weather forecast
function getFiveDayForecast() {
	$.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${key}`, function (response) {
		// Filter and display only the 12:00 PM forecast
		var myWeather = response.list.filter(item => item.dt_txt.includes("12:00:00")).map(item => ({
			date: item.dt_txt.split(' ')[0],
			temp: item.main.temp,
			feels_like: item.main.feels_like,
			icon: item.weather[0].icon,
			humidity: item.main.humidity
		}));
		myWeather.forEach(weather => {
			$('.fiveForecast').append(`
				<div class="card text-white bg-primary mb-3" style="max-width: 200px;">
					<div class="card-header">${moment(weather.date).format('MM-DD-YYYY')}</div>
					<div class="card-body">
						<img class="icons" src="https://openweathermap.org/img/wn/${weather.icon}@2x.png">
						<p>Temperature: ${weather.temp} °F</p>
						<p>Feels Like: ${weather.feels_like} °F</p>
						<p>Humidity: ${weather.humidity} %</p>
					</div>
				</div>
			`);
		});
	});
}

// Initialize page load (load history and weather)
function initLoad() {
	if (cityHist.length) {
		city = cityHist[0];  // Default to the most recent city
	}
	getHistory();  // Display history buttons
	if (city) getWeatherToday();  // Fetch weather for the default city
}

initLoad();  // Call init on page load
