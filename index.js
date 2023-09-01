const API_URL = "https://restcountries.com/v3.1/all";
const FIELDS =
  "name,cca3,currencies,capital,region,population,continents,flags";

const filter = document.querySelector(".filter");
const gridContainer = document.querySelector(".grid-container");
const searchInput = document.getElementById("search");
const modal = document.querySelector(".modal");

//* variables
let countries = [];
let filteredCountries = [];
let search = null;
let continent = "All";

//* api functions
const fetchData = async (apiURL) => {
  try {
    const response = await fetch(apiURL);
    return await response.json();
  } catch (error) {
    console.error("Error fetching data", error);
    throw error;
  }
};

const getCountries = async () => {
  try {
    const apiURL = `${API_URL}?fields=${FIELDS}`;
    const data = await fetchData(apiURL);

    return data.sort((a, b) => {
      const nameA = a.name.common.toLowerCase();
      const nameB = b.name.common.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  } catch (error) {
    return [];
  }
};

//* render functions

const renderCountryList = () => {
  // use fragment to temporary build the list
  const fragment = document.createDocumentFragment();

  filteredCountries.forEach((country) => {
    // destructure
    const {
      name,
      flags,
      cca3,
      capital,
      population,
      currencies,
      region,
      continents,
    } = country;

    // change currencies from object to array
    const currencyList = Object.keys(currencies).map((code) => {
      const { name } = currencies[code];
      return `${name} (${code})`;
    });

    const gridItem = document.createElement("div");
    gridItem.classList.add("grid-item");
    gridItem.addEventListener("click", onGridItemClick);

    gridItem.innerHTML = `
    <a href="${flags.svg}">
      <img
        src="${flags.svg}"
        alt="${name.common} (${cca3})"
      />
    </a>
    <div>
      <h3>${name.common}</h3>

      <p>
        <label>Capital</label>
        ${capital.join(", ")}
      </p>
      <p>
        <label>Population</label>
        ${population.toLocaleString("en")}
      </p>
      <p>
        <label>Currencies</label>
        ${currencyList.join(", ")}
      </p>
      <p>
        <label>Region</label>
        ${region}
      </p>
      <p>
        <label>Continent</label>
        ${continents.join(", ")}
      </p>
    </div>`;

    fragment.appendChild(gridItem);
  });

  // add the virtual list to DOM
  gridContainer.replaceChildren(fragment);
};

const renderFilterList = () => {
  const optionList = filter.querySelector(".options");

  // get the continents from countries and sort alphabetically
  let continents = countries.flatMap((c) => c.continents).sort();

  // prepend 'All' and remove duplicates
  continents = ["All", ...new Set(continents)];

  continents.forEach((continent) => {
    const option = document.createElement("div");
    option.textContent = continent;
    option.addEventListener("click", onFilterOptionClick);

    optionList.appendChild(option);
  });
};

//* event handlers

const loadCountries = async () => {
  countries = await getCountries();
  filteredCountries = countries;
  renderCountryList();
  renderFilterList();
};

const handleEscapeKey = (e) => {
  if (e.key === "Escape") {
    modal.classList.remove("show");
  }
};

const applyFilters = () => {
  filteredCountries = countries;

  if (search !== null) {
    filteredCountries = filteredCountries.filter((country) => {
      // name, capital, code
      const name = country.name.common.toLowerCase();
      const capital = country.capital.join(", ").toLowerCase();
      const code = country.cca3.toLowerCase();

      return (
        name.includes(search) ||
        capital.includes(search) ||
        code.includes(search)
      );
    });
  }

  if (continent !== "All") {
    filteredCountries = filteredCountries.filter((country) => {
      return country.continents.includes(continent);
    });
  }
};

const onGridItemClick = (e) => {
  e.preventDefault();
  if (e.target.tagName === "IMG") {
    const { src, alt } = e.target;

    const img = modal.querySelector("img");
    const dismiss = modal.querySelector("[data-dismiss]");
    const caption = modal.querySelector("figcaption");

    img.src = src;
    img.alt = alt;
    caption.textContent = alt;
    dismiss.addEventListener("click", onDismissClick);

    modal.classList.add("show");
  }
};

const onDismissClick = () => {
  modal.classList.remove("show");
};

const onFilterOptionClick = (e) => {
  continent = e.target.textContent;

  // Change the selected filter
  const button = filter.querySelector("button");
  button.textContent = continent;

  // apply the search filter to filtered countries
  applyFilters();

  // re-render country list
  renderCountryList();
};

const onFilterButtonClick = () => {
  filter.classList.toggle("open");
};

const onSearchInput = () => {
  search = searchInput.value.trim().toLowerCase();

  // apply the search keyword to filtered countries
  applyFilters();

  // re-render country list
  renderCountryList();
};

//* event listeners

document.addEventListener("DOMContentLoaded", loadCountries);
document.addEventListener("keydown", handleEscapeKey);
filter.addEventListener("click", onFilterButtonClick);
searchInput.addEventListener("input", onSearchInput);