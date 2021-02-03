// GIVEN a weather dashboard with form inputs, search for a city
// and I am presented with current and future conditions for that city and that city is added to the search history. 
// WHEN I view current weather conditions for that city
// THEN I am presented with 
//the city name, 
//the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index
// WHEN I view the UV index,
// and I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
// WHEN I view future weather conditions for that city
// THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, and the humidity
// WHEN I click on a city in the search history, I am again presented with current and future conditions for that city
// WHEN I open the weather dashboard and I am presented with the last searched city forecast



//Open Weather Maps API Key
var apiKey = "b22d3845004eda68f16f6a4a91abf224";
var currentCity = "";
var lastCity = "";

// AJAX .fail command: https://www.tjvantoll.com/2015/09/13/fetch-and-errors/
var handleErrors = (response) => {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

var getCurrentConditions = (event) => {
    
    let city = $('#search-city').val();
    currentCity= $('#search-city').val();
   
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + apiKey;
    fetch(queryURL)
    .then(handleErrors)
    .then((response) => {
        return response.json();
    })
    .then((response) => {
        
        saveCity(city);
        $('#search-error').text("");
        
        let currentWeatherIcon="https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";
        
        let currentTimeUTC = response.dt;
        let currentTimeZoneOffset = response.timezone;
        let currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60;
        let currentMoment = moment.unix(currentTimeUTC).utc().utcOffset(currentTimeZoneOffsetHours);
        
        renderCities();
        getFiveDayForecast(event);
        
        $('#header-text').text(response.name);
        let currentWeatherHTML = `
            <h3>${response.name} ${currentMoment.format("(MM/DD/YY)")}<img src="${currentWeatherIcon}"></h3>
            <ul class="list-unstyled">
                <li>Temperature: ${response.main.temp}&#8457;</li>
                <li>Humidity: ${response.main.humidity}%</li>
                <li>Wind Speed: ${response.wind.speed} mph</li>
                <li id="uvIndex">UV Index:</li>
            </ul>`;
        
        $('#current-weather').html(currentWeatherHTML);
        let latitude = response.coord.lat;
        let longitude = response.coord.lon;
        let uvQueryURL = "api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&APPID=" + apiKey;
        
        uvQueryURL = "https://cors-anywhere.herokuapp.com/" + uvQueryURL;
        fetch(uvQueryURL)
        .then(handleErrors)
        .then((response) => {
            return response.json();
        })
        .then((response) => {
            let uvIndex = response.value;
            $('#uvIndex').html(`UV Index: <span id="uvVal"> ${uvIndex}</span>`);
            if (uvIndex>=0 && uvIndex<3){
                $('#uvVal').attr("class", "uv-favorable");
            } else if (uvIndex>=3 && uvIndex<8){
                $('#uvVal').attr("class", "uv-moderate");
            } else if (uvIndex>=8){
                $('#uvVal').attr("class", "uv-severe");
            }
        });
    })
}
var getFiveDayForecast = (event) => {
    let city = $('#search-city').val();
    let queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&APPID=" + apiKey;
    // API
    fetch(queryURL)
        .then (handleErrors)
        .then((response) => {
            return response.json();
        })
        .then((response) => {
        // HTML template
        let fiveDayForecastHTML = `
        <h2>5-Day Forecast:</h2>
        <div id="fiveDayForecastUl" class="d-inline-flex flex-wrap ">`;
        

        for (let i = 0; i < response.list.length; i++) {
            let dayData = response.list[i];
            let dayTimeUTC = dayData.dt;
            let timeZoneOffset = response.city.timezone;
            let timeZoneOffsetHours = timeZoneOffset / 60 / 60;
            let thisMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);
            let iconURL = "https://openweathermap.org/img/w/" + dayData.weather[0].icon + ".png";
            
            if (thisMoment.format("HH:mm:ss") === "11:00:00" || thisMoment.format("HH:mm:ss") === "12:00:00" || thisMoment.format("HH:mm:ss") === "13:00:00") {
                fiveDayForecastHTML += `
                <div class="weather-card card m-2 p0">
                    <ul class="list-unstyled p-3">
                        <li>${thisMoment.format("MM/DD/YY")}</li>
                        <li class="weather-icon"><img src="${iconURL}"></li>
                        <li>Temp: ${dayData.main.temp}&#8457;</li>
                        <br>
                        <li>Humidity: ${dayData.main.humidity}%</li>
                    </ul>
                </div>`;
            }
        }
        
        fiveDayForecastHTML += `</div>`;
        $('#five-day-forecast').html(fiveDayForecastHTML);
    })
}

//  city to localStorage
var saveCity = (newCity) => {
    let cityExists = false;
    // local storage
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage["cities" + i] === newCity) {
            cityExists = true;
            break;
        }
    }
    if (cityExists === false) {
        localStorage.setItem('cities' + localStorage.length, newCity);
    }
}

var renderCities = () => {
    $('#city-results').empty();
    
    if (localStorage.length===0){
        if (lastCity){
            $('#search-city').attr("value", lastCity);
        } else {
            $('#search-city').attr("value", "Denver");
        }
    } else {
        
        let lastCityKey="cities"+(localStorage.length-1);
        lastCity=localStorage.getItem(lastCityKey);

        $('#search-city').attr("value", lastCity);
       
        for (let i = 0; i < localStorage.length; i++) {
            let city = localStorage.getItem("cities" + i);
            let cityEl;
        
            if (currentCity===""){
                currentCity=lastCity;
            }
            

            if (city === currentCity) {
                cityEl = `<button type="button" class="list-group-item list-group-item-action active">${city}</button></li>`;
            } else {
                cityEl = `<button type="button" class="list-group-item list-group-item-action">${city}</button></li>`;
            } 
            
            $('#city-results').prepend(cityEl);
        }
        
        if (localStorage.length>0){
            $('#clear-storage').html($('<a id="clear-storage" href="#">clear</a>'));
        } else {
            $('#clear-storage').html('');
        }
    }
    
}

$('#search-button').on("click", (event) => {
event.preventDefault();
currentCity = $('#search-city').val();
getCurrentConditions(event);
});

// event listener
$('#city-results').on("click", (event) => {
    event.preventDefault();
    $('#search-city').val(event.target.textContent);
    currentCity=$('#search-city').val();
    getCurrentConditions(event);
});

// localStorage event listener
$("#clear-storage").on("click", (event) => {
    localStorage.clear();
    renderCities();
});

renderCities();

getCurrentConditions();



// var apiKey="b22d3845004eda68f16f6a4a91abf224";

// //Api key: b22d3845004eda68f16f6a4a91abf224

// function oneDay(city){

// // button.addEventlistener("click",function() {
// var url="https://api.openweathermap.org/data/2.5/weather?q="+city+"&appid="+ apiKey;
//     //api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}
// console.log(url)
//     fetch(url)
//     .then(response => response.json())
    // .then(data => 
    //     {
    //         console.log(data)

    //     }
    // )

    // .then(function(data){
    //     console.log(data)
    //     var mylon=data.coord.lon;
    //     console.log(mylon)
    //     var temp =data.main.temp;

    //     var mylat=data.coord.lat;
    //     console.log(mylat)
        /*
        <div id='onedaycontent'>
            <p>CityName Icon</p>
            <p>Temp: 200</p>
            <p>Hum: </p>
        </div>
        */

    //    //1. create varaibles
    //    var d=document.createElement("div");
    //    //<div></div>
    //    var p1=document.createElement("p");
    //    var p2=document.createElement("p");
    //    //2. style it
    //    d.setAttribute("id","onedaycontent");
    //    //<div id="onedaycontent"></div>
    //    p1.textContent="Temp :"+temp;
    //    //3. stick it togehter (parent child)
    //    d.appendChild(p1);
    //    //4. stick to html page #onedayarea
    //    document.querySelector("#onedayarea").appendChild(d)



     

        //http://api.openweathermap.org/data/2.5/uvi?lat={lat}&lon={lon}&appid={API key}

    //     var uvUrl="http://api.openweathermap.org/data/2.5/uvi?lat="+mylat+"&lon="+mylon+"&appid="+apiKey;
    //     console.log(uvUrl)
    //     fetch(uvUrl)
    //     .then(response => response.json())
         
    //     .then(function(uvdata) {
    //         console.log(uvdata)

    //     })
        
        


    // })

    

// .catch(err => alert("wrong city name!"))

// }
// }

// function fiveDay(){
    //api.openweathermap.org/data/2.5/forecast?q={city name}&appid={API key}
    //1. build url
    //2. call fetch and return assocaited obj
    //3. grab the data needed
    //4. dynamically append to html (display to page)

// }

