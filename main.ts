const root = document.querySelector("#root");

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

interface Response {
    flags: { svg: string };
    name: { common: string };
    population: number;
    region: string;
    capital: string;
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
        capital: resp.capital[0]
    }
}

const renderCard = async (obj: FormattedCountry) => {
    const template = `
    <section class="card">
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
    root.innerHTML += template;
}