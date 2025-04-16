const root = document.querySelector("#root");

const toggleButton: HTMLButtonElement = document.querySelector(".toggle-theme");
const body = document.body;
const icon = toggleButton.querySelector("ion-icon") as HTMLElement & { name: string };
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

if(prefersDarkMode) {
    body.classList.add("dark");
    icon.name = "moon";
}

toggleButton.addEventListener("click", () => {
    if(body.classList.contains("dark")) {
        body.classList.remove("dark");
        icon.name = "moon-outline";
    } else {
        body.classList.add("dark");
        icon.name = "moon";
    }
})

const form: HTMLFormElement = document.querySelector(".search-form");
form.addEventListener("submit", async (e: SubmitEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const value = formData.get("search") as string;
    const resp = await makeRequest(`name/${value.toLowerCase()}?fullText=true`);
    if(resp !== undefined) {
        root.innerHTML = "";
        const formattedCountry = formatResp(resp[0]);
        renderCard(formattedCountry);
    }
})

const makeRequest = async (query: string) => {
    const url: string = "https://restcountries.com/v3.1/";
    try {
        const response = await fetch(url + query);
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        return json
    } catch (error) {
        console.log(error.message);

        root.innerHTML = `<div class='error-info'>
                <h3>404</h3>
                <h4>Oops!</h4>
                <p>The country you're looking for could not be found. Make sure your spelling is correct.</p>
            </div>`
    }
}

const getAllCountries = async () => {
    root.innerHTML = "";
    form.style.display = "flex";
    const resp = await makeRequest("all");
    resp.forEach(country => {
        const formattedCountry = formatResp(country);
        renderCard(formattedCountry);
    })
}

getAllCountries();

const searchInput = document.querySelector("#search") as HTMLInputElement | null;

searchInput.addEventListener("input", (e: Event) => {
    if(searchInput && searchInput.value === "") {
        root.innerHTML = "";
        getAllCountries();
    }
})

const optionContainer: HTMLDivElement = document.querySelector(".option-container");
const selectButton: HTMLButtonElement = document.querySelector(".select-region");
let visible: boolean = false;
const options = optionContainer.querySelectorAll("button");

options.forEach(option => {
    option.addEventListener("click", () => {
        showCountriesByRegion(option.textContent.toLowerCase());
        selectButton.querySelector("span").textContent = option.textContent;
    });
})

const changeVisibility = (event: MouseEvent) => {
    event.stopPropagation()
    visible = !visible;
    if(visible) {
        optionContainer.style.visibility = "visible";
    } else {
        optionContainer.style.visibility = "hidden";
    }
}

document.body.addEventListener("click", () => {
    visible = false;
    optionContainer.style.visibility = "hidden";
});
selectButton.addEventListener("click", changeVisibility);
optionContainer.addEventListener("click", changeVisibility);

interface FormattedCountry {
    flag: string;
    name: string;
    population: string;
    region: string;
    capital: string;
}

interface FormattedDetailedCountry {
    flag: string,
    name: string,
    nativeName: string,
    population: string,
    region: string,
    subRegion: string,
    capital: string[],
    topLevelDomain: string[],
    currencies: Object[],
    languages: string,
    borderCountries: string[]
}

interface NativeName {
    common: string;
}

interface Response {
    flags: { svg: string };
    name: { common: string, nativeName: NativeName[] };
    population: number;
    region: string;
    subregion: string;
    capital: string[];
    borders: string[];
    tld: string[];
    currencies: Object[];
    languages: Object[];
}

const showCountriesByRegion = async (query: string) => {
    const resp = await makeRequest("region/" + query);
    root.innerHTML = "";
    resp.forEach(country => {
        const formattedCountry = formatResp(country);
        renderCard(formattedCountry);
    })
}

function formatResp(resp: Response): FormattedCountry {
    return {
        flag: resp.flags.svg,
        name: resp.name.common,
        population: resp.population.toLocaleString("en-US"),
        region: resp.region,
        capital: resp.capital?.[0] ?? "No data"
    }
}

function formatDetailedResp(resp: Response[]): FormattedDetailedCountry {
    const lastIndex = Object.values(resp[0].name.nativeName).length - 1
    const nativeName = Object.values(resp[0].name.nativeName)[lastIndex].common

    return {
        flag: resp[0].flags.svg,
        name: resp[0].name.common,
        nativeName: nativeName,
        population: resp[0].population.toLocaleString("en-US"),
        region: resp[0].region,
        subRegion: resp[0].subregion ?? "No data",
        capital: resp[0].capital,
        topLevelDomain: resp[0].tld ?? ["No data"],
        currencies: Object.values(resp[0].currencies).map((currency: { name: string }) => currency.name),
        // currencies: Object.values(resp[0].currencies),
        languages: Object.values(resp[0].languages).join(", "),
        borderCountries: resp[0].borders
    }
}

const renderCard = async (obj: FormattedCountry) => {
    const template = `
    <section class="card">
        <button class="tab-button" onclick='renderDetailedCountry("${obj.name}")'>
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

    root.innerHTML += template;
}

const renderDetailedCountry = async (name: string) => {
    let obj = await makeRequest(`name/${name.toLowerCase()}?fullText=true`);
    obj = formatDetailedResp(obj);
    form.style.display = "none";

    let borderCountries = obj.borderCountries ? await Promise.all(obj.borderCountries.map(async (borderCountry: string) => {
            const countryName = await makeRequest("alpha/" + borderCountry);
            const name = countryName[0].name.common;
            return `<button onclick="renderDetailedCountry('${name}')">${name}</button>`;
        })
    ) : "No border countries"

    if(Array.isArray(borderCountries)) {
        borderCountries = borderCountries.join("");
    }

    const template = `
    <div class="detailed-card">
        <button class="back-button" onclick="getAllCountries()">
            <ion-icon name="arrow-back-outline"></ion-icon>
            <span>Back</span>
        </button>
        <div class="main-card">
            <img src="${obj.flag}" alt="Flag of ${obj.name}">
            <section>
                <h1>${obj.name}</h1>
                <p>Native Name: ${obj.nativeName}</p>
                <p>Top level domain: ${obj.topLevelDomain.join(", ")}</p>
                <p>Population: ${obj.population}</p>
                <p>Currencies: ${obj.currencies.join(", ")}</p>
                <p>Region: ${obj.region}</p>
                <p>Languages: ${obj.languages}</p>
                <p>Sub Region: ${obj.subRegion}</p>
                <p>Capital: ${obj.capital.join(", ")}</p>
            </section>
            <div>
                <p><span>Border Countries:</span>${borderCountries}</p>
            </div>
        </div>
    </div>
    `

    root.innerHTML = template;
}