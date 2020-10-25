
// Get the API key for open weather
var myKey = config.OPEN_WEATHER_KEY;

var cityList = JSON.parse(localStorage.getItem('cityList')) || [];



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
            // it all seems to be working add the city to the visited list
            var cityName = data.name;
            var cityId = data.sys.id;
            var cityCountry = data.sys.country;  
            addCity(cityName, cityCountry, cityId);


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
    

    }).catch(function(){
        alert("Unable To Find That Place - try again");
    });
    
}

var addCity = function(cityName, cityCountry, cityId){
    cityObj = {
        "name":cityName,
        "country":cityCountry,
        "id":cityId  
    }

    // check if the city is allready there if it is then replace and prepend
    for(i = 0; i<cityList.length; i++){
        if(cityList[i].id === cityId){
            cityList.splice(i,1);
        }
    }

    cityList.push(cityObj);
    localStorage.setItem("cityList", JSON.stringify(cityList));
    renderCities(cityList);  
};


var renderCities = function(cList){
    cityListEl = document.getElementById("cityHistory");
    cityListEl.innerHTML = "";

    for(city of cList){
    
        cityEl = document.createElement("li");
        cityEl.setAttribute("class", "list-group-item")
        cityEl.setAttribute("data-id", city.id)
        cityEl.textContent = city.name + ", " + city.country;
        cityListEl.prepend(cityEl);
    }
};




// function to build the current weather card
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

    // get icon for weather
    var iconcode = cityObj.weather[0].icon;
    var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";

    
    // convert temperature to celcius and farenheit
    var tC = cityObj.main.temp - 273.15
    var tK = (cityObj.main.temp - 273.15)*9/5+32
    var tempStr = tC.toFixed(1) + "&#176C / " + tK.toFixed(1) + "&#176F";


    //Build a dom element for the Now card
    var cardEl = document.createElement("div"); 
    cardEl.setAttribute("class", "card");
   
    // build a big ugly chunk of html..
    var htmlStr = `<div class = "card-body">
        <h2 id="city-now" class = "card-title">${cityObj.name} : ${moment.unix(cityObj.dt).format("MMM Do YYYY")}</h5>
        <img src="${iconurl}" alt="">
        <p class="card-text">Temperature: ${tempStr}</p>
        <p class="card-text">Humidity: ${cityObj.main.humidity}% relative </p>
        <p class="card-text">Wind Speed: ${cityObj.wind.speed}m/s <span id ="arrow" style="--angle: ${cityObj.wind.deg}deg">&#8679;</span>  </p>
        <p class="card-text">UV Index:  <span class = "badge ${uvclass}">${UVindex}</span> </p>
    </div>`;

    cardEl.innerHTML = htmlStr;   

    // Attach to the today card element
    var todayEl =  document.querySelector("#today");
    
    todayEl.appendChild(cardEl);
    
};

var populateForecast = function(fcastObj){
    
    //Build a dom element for the forecast card
    var cardEl = document.createElement("div"); 
    cardEl.setAttribute("class", "card");

    // get the timeline
    hrsList = fcastObj.list;

    
    // cut the timeline in chunks of 8 
    var timeChunks = [];
    var i = 0;
    var chSize = 8;
    
    while(i < hrsList.length){
        timeChunks.push(hrsList.slice(i, chSize+i));
        i += chSize;    
    }

    for(chunk of timeChunks){
        cardEl = populateForecastCard(chunk);
        document.getElementById("forecastcards").appendChild(cardEl);
    };   
    document.getElementById("five-days").innerHTML = "<h2>5 day forecast</h2>"
};


// function to build a forecast weather card
var populateForecastCard = function(chunkObj){
    //Build a dom element for the forecast card
    var cardEl = document.createElement("div"); 
    cardEl.setAttribute("class", "card");

    // dig out varoius data from the API chunk
    //find the next 2pm..
    for(i=0; i<chunkObj.length; i++){
        
        time= chunkObj[i]
        
        if(moment.unix(time.dt).format("h:a") ===  "2:pm"){  
            //console.log("----Found 2Pm");
            twoPmEl = chunkObj[i];

        };
    };

    dateStr = moment.unix(twoPmEl.dt).format("MMM Do");

    //build a html elment for each our of the chunk
    var rowEl = document.createElement("div");
    rowEl.setAttribute("class", "hr-meteogram");
    for(time of chunkObj){
        var hrCol = document.createElement("div");
        hrCol.setAttribute("class", "hr-meteogram-el")
        
        hrCol.innerHTML = 
        `
        <div>
            ${moment.unix(time.dt).format("h")}</br>
            ${moment.unix(time.dt).format("a")}</br>
            ${((time.main.temp-273.15)*9/5+32).toFixed(0) + "&#176"} </br> 
            <img src="${"http://openweathermap.org/img/w/" + time.weather[0].icon + ".png"}" alt=""></br>  
            <span id ="arrow" style="--angle: ${time.wind.deg}deg">&#8679;</span> </br>
            ${Math.round((time.wind.speed)*1.94384)}.kt
            
        </div>
        `
        
        rowEl.appendChild(hrCol)

    }

    // build a big html monster -- just decided to try it for this project..
    
    htmlStr = `
    <div class="card bg-primary text-light" style="width: 12rem;">
        <div class="card-body">
            <div class = "row" >
                <h5 class="col card-title">${dateStr} 2pm</h5>
            </div>
            <div class = "row">
                <div class="col">
                   
                    ${((twoPmEl.main.temp-273.15)*9/5+32).toFixed(1) + "&#176F"}  
                    <img src="${"http://openweathermap.org/img/w/" + twoPmEl.weather[0].icon + ".png"}" alt="">   
                    Humidity: ${twoPmEl.main.humidity}% rel.                    
                </div>
            
            </div>
            <div class = "row">
                ${rowEl.outerHTML}
            </div>           
        </div>
    </div>
    `
    cardEl.innerHTML = htmlStr;
    return cardEl
}






var handleSearchClick = function(){
    var cityName = document.getElementById("search-input").value    
    
    // clear the old data
    document.getElementById("today").innerHTML = "";
    document.getElementById("forecastcards").innerHTML = "";
    document.getElementById("five-days").innerHTML = "";
    
    
    getData(cityName);

}


// Finish liene .....
var handleListClick = function(event){
    
    
}


// Main program exceutions
renderCities(cityList);

document.getElementById("search-btn").addEventListener("click",handleSearchClick);

document.getElementById("cityHistory").addEventListener("click", handleListClick);
