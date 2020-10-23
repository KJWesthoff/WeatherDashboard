
// Get the API key for open weather
var myKey = config.OPEN_WEATHER_KEY;
console.log(myKey);




var cityName = "Napa"




var url =  `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${myKey}`;

console.log(url);

