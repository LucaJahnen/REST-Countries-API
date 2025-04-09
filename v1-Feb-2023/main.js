import { switchToDark, makeButtonsDark, switchToLight, makeInputDark, observeRoot, animateDetailedCards } from "./animation.js";

const url = "https://restcountries.com/v3.1/"

const exampleCountries = [ "germany", "United States", "brazil", "iceland", "afghanistan", "ireland", "Albania", "Algeria" ];

const createCountry = (flag, name, population, region, capital) => {
  return { flag, name, population, region, capital };
}

const createDetailedCountry = (flag, name, nativeName, population, region, subRegion, capital, topLevelDomain, currencies, languages, borderCountries) => {
  return { flag, name, nativeName, population, region, subRegion, capital, topLevelDomain, currencies, languages, borderCountries };
}

function request(str) {
  return fetch(url + str)
 .then((resp) => {
   if(!resp.ok) {
     displayError(resp.status, resp.statusText);
  } 
    return resp.json();
  })
  .catch((error) => {
    console.log(error)
  })
}

function formatResp(resp) {
  return createCountry(resp[0].flags.svg, resp[0].name.common, resp[0].population, resp[0].region, resp[0].capital[0]);
}

function formatDetailedResp(resp) {
  return createDetailedCountry(resp[0].flags.svg, resp[0].name.common, Object.values(resp[0].name.nativeName)[0].common, resp[0].population, resp[0].region, resp[0].subregion, resp[0].capital[0], resp[0].tld[0], resp[0].currencies, Object.values(resp[0].languages), resp[0].borders);
}

function renderExamples() {
  exampleCountries.forEach(async (country) => {
  const resp = await request("name/" + country + "?fullText=true")
  const currentCountry = formatResp(resp)
  renderCard(currentCountry)
    })
  }
renderExamples()


function renderCard(obj) {
  const root = document.querySelector("#root");
  obj.population = obj.population.toLocaleString("en-us");
  let bg;
  if(darkMode === true) {
    bg = "hsl(209, 23%, 22%)"
  } else {
    bg = "white"
  } 
  const template = `
   <section style="background-color: ${bg} " class="card">
   <button class="tab-button">
      <img class="card-img" src="${obj.flag}" alt="Flag of ${obj.name}" />
      <div class="text-wrapper">
      <h2 class="card-heading">${obj.name}</h2>
      <p><span>Population:</span> ${obj.population}</p>
      <p><span>Region:</span> ${obj.region}</p>
      <p><span>Capital:</span> ${obj.capital}</p>
    </div>
  </button>
  </section> 
  `
  const div = document.createElement("div");
  div.innerHTML = template;
  div.title = obj.name;
  document.querySelector("#root").insertAdjacentElement("beforeend", div);
  showDetails(div)
}

const main = document.querySelector("main") ;
const mainHTML = main.innerHTML;
async function renderDetails(obj) {
  window.scrollTo(0, 0);
  main.innerHTML = "";
  obj.population = obj.population.toLocaleString("en-us");
  obj.currencies = Object.values(obj.currencies).map((obj) => {
      return Object.values(obj)[0]
    }).join(", ")
  let countries = `<button class="border-country">none</button>`;
  if(obj.borderCountries !== undefined) {
  countries = obj.borderCountries.map(async (country) => {
    let countryName = await request("alpha/" + country);
    let name = countryName[0].name.common
    return `<button class="border-country" >${name}</button>`
  })
  countries = await Promise.all(countries.map((country) => {
    return country;
  }))
  countries = countries.join("");
  }
  obj.languages = obj.languages.join(", ");
  const template = `
  <section class="detailed-country">
  <button class="btn-back"><ion-icon name="arrow-back"></ion-icon>Back</button>
  <div class="country-container">
  <img class="detailed-flag" src=${obj.flag} alt="flag of ${obj.name}">
  <div>
    <h2 class="detailed-heading">${obj.name}</h2>
    <div class="text-container">
    <p><span>Native name: </span>${obj.nativeName}</p>
    <p><span>Population: </span>${obj.population}</p>
    <p><span>Region: </span>${obj.region}</p>
    <p><span>Sub Region: </span>${obj.subRegion}</p>
    <p><span>Capital: </span>${obj.capital}</p>
    <p id="tld"><span>Top Level Domain: </span>${obj.topLevelDomain}</p>
    <p><span>Currencies: </span>${obj.currencies}</p>
    <p><span>Languages: </span>${obj.languages}</p>
    </div>
    <div class="border-countries-container" >
    <h3>Border Countries:</h3>
    ${countries}
    </div>
    </div>
    </div>
  </section>`
  const div = document.createElement("div") ;
  div.innerHTML = template;
  main.insertAdjacentElement("beforeend", div);
  redirect();
  goBack();
  animateDetailedCards();
  if(darkMode === false) {
    makeButtonsLight(true)
  } else {
    makeButtonsDark(true)
  }
}

function goBack() {
  const btnBack = document.querySelector(".btn-back");
  btnBack.addEventListener("click", function() {
      main.innerHTML = mainHTML;
      if(darkMode === true) {
        makeInputDark();
      }
      renderExamples()
      searchCountry();
      filterCountries();
      observeRoot();
  })
}

function redirect() {
  const borderCountriesContainer = document.querySelector(".border-countries-container");
  borderCountriesContainer.addEventListener("click", async (e) => {
    if(e.target.tagName === "BUTTON" && e.target.innerText !== "none") {
        const text = e.target.innerText;
        const resp = await request("name/" + text + "?fullText=true");
        const country = formatDetailedResp(resp)
        renderDetails(country)
    }
  })
};

function debounce(cb, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb(...args);
    }, delay);
  }
}

const updateDebounceText = debounce(async () => {
  const search = document.querySelector(".search");
  const root = document.querySelector("#root");
  
  if(search.value === "") {
    root.innerHTML = "";
    renderExamples();
  } else {
    const value = search.value;
    const resp = await request("name/" + value + "?fullText=true");
    const searchedCountry = formatResp(resp);
    root.innerHTML = "";
    renderCard(searchedCountry);
  }
}); 

function searchCountry() {
  const search = document.querySelector(".search");
  search.addEventListener("input", updateDebounceText);
}
searchCountry();

function preventReload() {
  const form = document.querySelector(".form");
  form.addEventListener("submit", function(e) {
    e.preventDefault();
  })
}
preventReload();

function displayError(status, statusText) {
  let root = document.querySelector("#root");
  const template = `
  <section class="error-container">
    <h1 class="error-heading">${status}</h1>
    <p class="error-message">${statusText}</p>
  </section>`
  const div = document.createElement("div") ;
  div.innerHTML = template;
  root.innerHTML = ""
  root.insertAdjacentElement("beforeend", div);
}

function filterCountries() {
  const dropwdownWrapper = document.querySelector(".dropdown-wrapper");
  const options = document.querySelector(".options");
  const root = document.querySelector("#root");
  let visible = false;
      
  function check() {
    gsap.to(".options", {
      opacity: visible ? "0" : "1", 
      visibility: visible ? "hidden" : "visible"
    })
    visible = !visible; 
  }
      
  dropwdownWrapper.addEventListener("click", check);
  dropwdownWrapper.addEventListener("focus", check);
  options.addEventListener("click", async (e) => {
    if(e.target.tagName == "BUTTON") {
      const continentCountries = await request("region/" + e.target.innerText);
      root.innerHTML = "";
      continentCountries.forEach((country) => {
        const resp = [];
        resp.push(country);
        if(resp[0].capital === undefined) {
          resp[0].capital = [ "none" ];
        }
        const formattedCountry = formatResp(resp);
        renderCard(formattedCountry)
      })
    }
  })
}
filterCountries();

function showDetails(el) {
  el.addEventListener("click", async function() {
    const resp = await request("name/" + el.title + "?fullText=true");
    if(resp[0].capital === undefined) {
      resp[0].capital = [ "none" ];
    }
    const country = formatDetailedResp(resp);
    renderDetails(country)
  })
}

const themeSwitch = document.querySelector(".theme-switch");
let darkMode = false;
themeSwitch.addEventListener("click", function() {
  if(darkMode === false) {
    switchToDark();
  } else {
    switchToLight();
  }
  darkMode = !darkMode;
})