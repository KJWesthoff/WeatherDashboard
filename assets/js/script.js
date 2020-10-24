
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
        <h5 id="city-now" class = "card-title">${cityObj.name} : ${moment.unix(cityObj.dt).format("MMM Do YYYY")}</h5>
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

    // log out time
    for(chunk of timeChunks){
        for(time of chunk){
                stamp = moment.unix(time.dt).format("MMM Do YYYY / h:a");
                console.log(stamp);
            }
        console.log("----- Next day -----------" );    
    }


    console.log(timeChunks[2]);

    for(chunk of timeChunks){
        cardEl = populateForecastCard(chunk);
        document.getElementById("forecastcards").appendChild(cardEl);
    };   
};


// function to build a forecast weather card
var populateForecastCard = function(chunkObj){
    //Build a dom element for the forecast card
    var cardEl = document.createElement("div"); 
    cardEl.setAttribute("class", "card");

    // dig out varoius data from the API chunk
    dateStr = moment.unix(chunkObj[6].dt).format("MMM Do");

    console.log(chunkObj[6]);

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

    console.log(rowEl)
    
    
    // build a big html monster -- just decided to try it for this project..
    
    htmlStr = `
    <div class="card" style="width: 12rem;">
        <div class="card-body">
            <div class = "row">
                <h5 class="col card-title">${dateStr}</h5>
            </div>
            <div class = "row">
                <div class="col">
                    ${moment.unix(chunkObj[2].dt).format("h:a")}
                    ${((chunkObj[2].main.temp-273.15)*9/5+32).toFixed(1) + "&#176F"}  
                    <img src="${"http://openweathermap.org/img/w/" + chunkObj[2].weather[0].icon + ".png"}" alt="">                       
                </div>
                
    

                <div class="col">
                    ${moment.unix(chunkObj[6].dt).format("h:a")}
                    ${((chunkObj[6].main.temp-273.15)*9/5+32).toFixed(1) + "&#176F"}  
                    <img src="${"http://openweathermap.org/img/w/" + chunkObj[6].weather[0].icon + ".png"}" alt="">  
                </div>

            </div>
            <div class = "row">
                ${rowEl.outerHTML}
            </div>


            <div class = "row">
           
            </div>  
        </div>
    </div>
    `
    cardEl.innerHTML = htmlStr;

    return cardEl


}

//helper functions..







var handleSearchClick = function(){
    var cityName = document.getElementById("search-input").value    
    getData(cityName);
}




document.getElementById("search-btn").addEventListener("click",handleSearchClick);

