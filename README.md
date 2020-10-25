# Weather Dashboard
This is a weather dashbord page that shows the current weaterh anf forecast for a city or place of your choice.

## OpenWeater API
The openweathermap API is used for this page, for it to work you need to get your own API key (I have yet to learn to serve it up for you..)
### API key HowTo:
Go to https://openweathermap.org to Get Started and Register, when you receive an API key, modify the "config_api-replace_.js file in ASSETS/js by inserting your key and rename it to config.js 

To see the page "in action" a version on a GitHub privat repo copy which is identical is published here:

## Features
### Search
* You can search for a city, and if it exists (i.e. can be found by openweather) The current weather and forecast is shown. 
* The search is added to the top of the search history and saved in local storage for future visits. 
    * You can re-visit your viewed places by clicking on the city in the history.
    * When a city is re-vistited it is placed at the top of your search history
    * Duplicates are removed from the list, the latest search is placed at the top   
### Current Weather


