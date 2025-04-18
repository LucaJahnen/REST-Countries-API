const root = document.querySelector("#root");

// toggle between dark and light mode
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

// search for countriess
const form: HTMLFormElement = document.querySelector(".search-form");
form.addEventListener("submit", async (e: SubmitEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const value = formData.get("search") as string;
    const resp = await makeRequest(`name/${value.toLowerCase()}?fullText=true&fields=flags,name,population,region,capital`);
    if(resp !== undefined) {
        root.innerHTML = "";
        const formattedCountry = formatResp(resp[0]);
        const htmlCard = renderCard(formattedCountry);
        root.innerHTML = htmlCard;
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
        root.innerHTML = `
        <div class='error-info'>
            <h3>404</h3>
            <h4>Oops!</h4>
            <p>The country you're looking for could not be found. Make sure your spelling is correct.</p>
        </div>`
    }
}

// display all countries when input is empty
const searchInput = document.querySelector("#search") as HTMLInputElement | null;
searchInput.addEventListener("input", (e: Event) => {
    if(searchInput && searchInput.value === "") {
        root.innerHTML = "";
        displayAllCountries();
    }
})

let allCountries: Response[];
const displayAllCountries = async () => {
    root.innerHTML = "";
    form.style.display = "flex";
    searchInput.value = "";
    allCountries = await makeRequest("all?fields=flags,name,population,region,capital");
    renderPlaceholders(allCountries);
}

displayAllCountries();

// select a region
const optionContainer: HTMLDivElement = document.querySelector(".option-container");
const selectButton: HTMLButtonElement = document.querySelector(".select-region");
const chevronDown: HTMLElement = selectButton.querySelector("ion-icon");
let visible: boolean = false;
const options = optionContainer.querySelectorAll("button");

options.forEach(option => {
    option.addEventListener("click", () => {
        showCountriesByRegion(option.textContent.toLowerCase());
        selectButton.querySelector("span").textContent = option.textContent;
    });
})

const toggleVisibility = (event: MouseEvent) => {
    event.stopPropagation()
    visible = !visible;
    if(visible) {
        optionContainer.style.visibility = "visible";
        optionContainer.style.opacity = "1";
        optionContainer.style.transform = "translateY(0)";

        chevronDown.style.transform = "rotate(180deg) translateY(-50%)";
    } else {
        optionContainer.style.visibility = "hidden";
        optionContainer.style.opacity = "0";
        optionContainer.style.transform = "translateY(-1rem)";

        chevronDown.style.transform = "rotate(0) translateY(-50%)";
    }
}

document.body.addEventListener("click", () => {
    visible = false;
    optionContainer.style.visibility = "hidden";
    optionContainer.style.opacity = "0";
    optionContainer.style.transform = "translateY(-1rem)";

    chevronDown.style.transform = "rotate(0) translateY(-50%)";
});
selectButton.addEventListener("click", toggleVisibility);
optionContainer.addEventListener("click", toggleVisibility);

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
    resp.forEach((country: Response) => {
        const formattedCountry = formatResp(country);
        const htmlCard = renderCard(formattedCountry);
        root.innerHTML += htmlCard;
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

async function formatDetailedResp(resp: Response) {
    const lastIndex = Object.values(resp.name.nativeName).length - 1
    const nativeName = Object.values(resp.name.nativeName)[lastIndex].common
    const borderCountries = await Promise.all(resp.borders.map(async (borderCountry: string) => {
            const countryName = await makeRequest("alpha/" + borderCountry + "?fields=name");
            const name = countryName.name.common;
            return `<button onclick="renderDetailedCountry('${name}')">${name}</button>`;
        })
    )

    return {
        nativeName: nativeName,
        borderCountries: Array.isArray(borderCountries) && borderCountries.length !== 0 ? borderCountries.join("") : "No border countries"
    }
}

const renderCard = (obj: FormattedCountry) => {
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

    return template;
}

const renderDetailedCountry = async (name: string) => {
    const resp = await makeRequest(`name/${name.toLowerCase()}?fullText=true&fields=flags,name,nativeName,population,region,subregion,capital,tld,currencies,languages,borders`);
    const obj: Response = resp[0];
    const formattedObj = await formatDetailedResp(resp[0]);
    form.style.display = "none";

    const template = `
    <div class="detailed-card">
        <button class="back-button" onclick="displayAllCountries()">
            <ion-icon name="arrow-back-outline"></ion-icon>
            <span>Back</span>
        </button>
        <div class="main-card">
            <img src="${obj.flags.svg}" alt="Flag of ${obj.name.common}">
            <section>
                <h1>${obj.name.common}</h1>
                <p><span>Native Name:</span> ${formattedObj.nativeName}</p>
                <p><span>Top level domain:</span> ${obj.tld.join(", ")}</p>
                <p><span>Population:</span> ${obj.population.toLocaleString("en-US")}</p>
                <p><span>Currencies:</span> ${Object.values(obj.currencies).map((currency: { name: string }) => currency.name).join(", ")}</p>
                <p><span>Region:</span> ${obj.region}</p>
                <p><span>Languages:</span> ${Object.values(obj.languages).join(", ")}</p>
                <p><span>Sub Region:</span> ${obj.subregion ?? "No data"}</p>
                <p><span>Capital:</span> ${obj?.capital?.join(", ")}</p>
            </section>
            <div>
                <p><span>Border Countries:</span>${formattedObj.borderCountries}</p>
            </div>
        </div>
    </div>
    `

    root.innerHTML = template;
}

let placeholders = document.querySelectorAll(".card-placeholder");
const renderPlaceholders = (countries: Response[]) => {
    countries.forEach(card => {
        const placeholder = document.createElement("div");
        placeholder.className = "card-placeholder";
        placeholder.style.minHeight = "200px";
        placeholder.dataset.name = card.name.common;
        root.appendChild(placeholder);
    });

    placeholders = document.querySelectorAll(".card-placeholder");
    placeholders.forEach(el => {
        observer.observe(el);
    });
}

const observer = new IntersectionObserver(
(entries, obs) => {
        entries.forEach(entry => {
        if (entry.isIntersecting) {
            const placeholder = entry.target as HTMLElement;
            const name = placeholder.dataset.name;
            const cardData = allCountries.find(c => c.name.common === name);
            if (cardData) {
                const formatted = formatResp(cardData);
                const cardEl = renderCard(formatted);
                const element = document.createElement("div");
                element.innerHTML = cardEl;
                placeholder.replaceWith(element);
                obs.unobserve(entry.target);
            }
        }
        });
    },
    {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
    }
);