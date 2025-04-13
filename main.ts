const form: HTMLFormElement = document.querySelector(".search-form");
form.addEventListener("submit", e => {
    e.preventDefault();
})

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
        console.log(error.message)
    }
}

const getAllCountries = async () => {
    const resp = await makeRequest("all");
    for(let i = 10; i < 20; i++) {
        const formattedResp = formatResp(resp[i]);
        renderCard(formattedResp);
    }
    console.log(resp);
}

getAllCountries();

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
    <section" class="card">
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

    const root = document.querySelector("#root");
    root.innerHTML += template;
}