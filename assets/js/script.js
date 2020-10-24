
// Get the API key for open weather
var myKey = config.OPEN_WEATHER_KEY;




// get the city name from the search field







var getData = function(cityName){

    // clean the place string
    cityName = cityName.replace(" ", "+");

    // build the url for current weather
    var urlNow =  `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${myKey}`;
    //console.log(urlNow)

    fetch(urlNow).then(function(res){
        if(res.ok){
            return res.json();
        };
    }).then(function(data){
        //console.log(data);

        //get UV data from long and lat
        var lon = data.coord.lon;
        var lat = data.coord.lat;
        var urlUV = `http://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${myKey}`;

        fetch(urlUV).then(function(res){
            return res.json();
        }).then(function(UVdata){
            var UVindex = UVdata.value
            
            populateNow(data, UVindex);
        });

        var urlForecast =  `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${myKey}`;
        //console.log(urlForecast)
    
        fetch(urlForecast).then(function(res){
            if(res.ok){
                return res.json();
            };
        }).then(function(data){
            populateForecast(data);
        });
    

    });


}

var populateNow = function(cityObj, UVindex){
    
    // evaluate UV index
    UVi = parseInt(UVindex) // round up or down as per epa.gov standard
    if(UVi <= 2){
        uvclass = "uv-low"
    } else if(UVi <= 5){
        uvclass = "uv-moderate"
    } else if(UVi <= 7){
        uvclass = "uv-high"
    } else if(UVi <= 10){
        uvclass = "uv-very-high"
    } else {
        uvclass = "uv-extreme"
    }

    // evaluate wind direction



    // convert temperature to celcius and farenheit
    var tC = cityObj.main.temp - 273.15
    var tK = (cityObj.main.temp - 273.15)*9/5+32
    var tempStr = tC.toFixed(1) + "&#176C / " + tK.toFixed(1) + "&#176F";


    //Build a dom element for the Now card
    var cardEl = document.createElement("div"); 
    cardEl.setAttribute("class", "card");
   
    // build a bi ygly chunk of html..
    var str = `<div class = "card-body">
        <h5 id="city-now" class = "card-title">${cityObj.name} : ${moment.unix(cityObj.dt).format("MMM Do YYYY")}</h5>
        <p class="card-text">Temperature: ${tempStr}</p>
        <p class="card-text">Humidity: ${cityObj.main.humidity}% relative </p>
        <p class="card-text">Wind Speed: ${cityObj.wind.speed}m/s <span id ="arrow" style="--angle: ${cityObj.wind.deg}deg;">&#8679;</span>  </p>
        <p class="card-text">UV Index:  <span class = "badge ${uvclass}">${UVindex}</span> </p>
    </div>`;

    cardEl.innerHTML = str;

   

    // Attach the whole schabang
    var todayEl =  document.querySelector("#today");
    console.log(todayEl);
    todayEl.appendChild(cardEl);
    
};


var populateForecast = function(cityObj){
    
    

    
    //console.log(cityObj);
};




var handleSearchClick = function(){
    var cityName = document.getElementById("search-input").value    
    getData(cityName);
}




document.getElementById("search-btn").addEventListener("click",handleSearchClick);

