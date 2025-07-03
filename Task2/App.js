const My_Api = 'https://rickandmortyapi.com/api';

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

document.addEventListener('DOMContentLoaded', function() {
  const path = window.location.pathname.split('/').pop();
  
  if (path === 'Characters.html') {
    initCharactersPage();
  } else if (path === 'Character-details.html') {
    initCharacterDetailsPage();
  } else if (path === 'Locations.html') {
    initLocationsPage();
  } else if (path === 'Locations-details.html') {
    initLocationDetailsPage();
  } else if (path === 'Episodes.html') {
    initEpisodesPage();
  } else if (path === 'Episodes-details.html') {
    initEpisodeDetailsPage();
  }
});


function initCharactersPage() {  
  const state = {
    page: 1,
    searchQuery: '',
    hasMore: true
  };

  const container = document.querySelector('.characters__cards');
  const loadMoreBtn = document.querySelector('.button-characters');
  const searchInput = document.querySelector('.input-characters');
  const filters = {
  page: 1,
  searchQuery: '',
  name: '',
  type: '',
  dimension: '',
  hasMore: true
};

  function initFilters() {
    const speciesContainer = document.querySelector('.characters__filtercontainer:nth-child(2)');
    const genderContainer = document.querySelector('.characters__filtercontainer:nth-child(3)');
    const statusContainer = document.querySelector('.characters__filtercontainer:nth-child(4)');
    
    if (speciesContainer) {
      const button = speciesContainer.querySelector('.characters__button');
      createDropdown(
        speciesContainer, 
        button,
        ['Human', 'Alien', 'Humanoid', 'Mythological', 'Unknown'],
        'Species',
        value => {
          filters.species = value;
          filters.page = 1;
          loadCharacters();
        }
      );
    }

    if (genderContainer) {
      const button = genderContainer.querySelector('.characters__button');
      createDropdown(
        genderContainer,
        button,
        ['Male', 'Female', 'Genderless', 'Unknown'],
        'Gender',
        value => {
          filters.gender = value;
          filters.page = 1;
          loadCharacters();
        }
      );
    }

    if (statusContainer) {
      const button = statusContainer.querySelector('.characters__button');
      createDropdown(
        statusContainer,
        button,
        ['Alive', 'Dead', 'Unknown'],
        'Status',
        value => {
          filters.status = value;
          filters.page = 1;
          loadCharacters();
        }
      );
    }
  }

  function createDropdown(container, button, options, title, callback) {
    if (!container || !button) return;

    const oldDropdown = container.querySelector('.dropdown-menu');
    if (oldDropdown) oldDropdown.remove();

    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown-menu';
    dropdown.style.display = 'none';
    
    const allItem = document.createElement('div');
    allItem.className = 'dropdown-item';
    allItem.textContent = 'All';
    allItem.addEventListener('click', () => {
      button.querySelector('p').textContent = title;
      callback('');
      dropdown.style.display = 'none';
    });
    dropdown.appendChild(allItem);

    options.forEach(option => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.textContent = option;
      item.addEventListener('click', () => {
        button.querySelector('p').textContent = `${title}: ${option}`;
        callback(option);
        dropdown.style.display = 'none';
      });
      dropdown.appendChild(item);
    });

    container.appendChild(dropdown);
    
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu !== dropdown) menu.style.display = 'none';
      });
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });
  }

  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.style.display = 'none';
    });
  });

  initFilters();
  async function loadCharacters() {
    try {
      const response = await axios.get(`${My_Api}/character`, {
        params: {
          page: filters.page,
          species: filters.species,
          gender: filters.gender,
          status: filters.status
        }
      });
      
      renderCharacters(response.data.results);
      filters.hasMore = !!response.data.info.next;
      updateLoadMoreButton();
    } catch (error) {
      console.error('Error loading characters:', error);
    }
  }


  function renderCharacters(characters) {
    if (state.page === 1) container.innerHTML = '';
    
    characters.forEach(character => {
      const card = document.createElement('div');
      card.className = 'characters__card';
      card.innerHTML = `
        <img src="${character.image}" alt="${character.name}" class="image-characters">
        <div class="characters__texts">
          <h3 class="name-character">${character.name}</h3>
          <p class="species-character">${character.species}</p>
        </div>
      `;
      card.addEventListener('click', () => {
        window.location.href = `Character-details.html?id=${character.id}`;
      });
      container.appendChild(card);
    });
  }

  function updateLoadMoreButton() {
    if (loadMoreBtn) {
      loadMoreBtn.style.display = state.hasMore ? 'block' : 'none';
    }
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      filters.page++;
      loadCharacters();
    });
  } 

  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      state.page = 1;
      state.searchQuery = e.target.value.trim();
      loadCharacters();
    }, 300));
  }

  loadCharacters();
}

function initCharacterDetailsPage() {  
  const urlParams = new URLSearchParams(window.location.search);
  const characterId = urlParams.get('id');
  
  const backButton = document.querySelector('.button-charactersdetails__head');
  if (backButton) {
    backButton.addEventListener('click', () => window.history.back());
  }

  async function loadCharacterDetails() {
    try {
      const characterResponse = await axios.get(`${My_Api}/character/${characterId}`);
      const character = characterResponse.data;
      
      const episodeUrls = character.episode;
      const episodeIds = episodeUrls.map(url => url.split('/').pop());
      const episodesResponse = await axios.get(`${My_Api}/episode/${episodeIds.join(',')}`);
      const episodes = Array.isArray(episodesResponse.data) ? 
        episodesResponse.data : [episodesResponse.data];
      
      renderCharacterDetails(character, episodes);
      
    } catch (error) {
      console.error('Error loading character details:', error);
    }
  }

  function renderCharacterDetails(character, episodes) {

    const logoContainer = document.querySelector('.charactersdetails__main');
    if (logoContainer) {
      logoContainer.innerHTML = `<img src="${character.image}" alt="${character.name}" 
        class="logo-charactersdetails__head">
        <h3 class="header-charactersdetails__head">"${character.name}"</h3>
        `;
    }
    
    document.querySelector('.header-charactersdetails__head').textContent = character.name;
    
    const infoItems = [
      { title: 'Gender', value: character.gender },
      { title: 'Status', value: character.status },
      { title: 'Species', value: character.species },
      { title: 'Origin', value: character.origin.name },
      { title: 'Type', value: character.type || 'Unknown' },
      { title: 'Location', 
      value: character.location.name,
      id: character.location.url.split('/').pop() }
    ];
    
    const infoContainer = document.querySelector('.charactersdetails__list');
    infoContainer.innerHTML = infoItems.map(item => `
      <li class="charactersdetails__link" ${item.title === 'Location' ? `data-location-id="${item.id}"` : ''}>
        <div class="charactersdetails__texts">
          <h3 class="type-characterdetails">${item.title}</h3>
          <p class="desc-characterdetails">${item.value}</p>
        </div>
        ${item.title === 'Location' ? '<img class="icon-charactersdetails__link" src="images/icons/characters-details/arrow.svg">' : ''}
      </li>
    `).join('');
    addLocationClickHandlers();
    renderEpisodes(episodes);
  }

  function addLocationClickHandlers() {
  document.querySelectorAll('.charactersdetails__link[data-location-id]').forEach(link => {
    link.addEventListener('click', (e) => {
      if (!e.target.classList.contains('icon-charactersdetails__link')) {
        const locationId = link.getAttribute('data-location-id');
        if (locationId) {
          window.location.href = `Locations-details.html?id=${locationId}`;
        }
      }
    });
  });
}
  function renderEpisodes(episodes) {
    const episodesContainer = document.querySelector('.charactersdetails__column:nth-child(2) .charactersdetails__list');
    if (!episodesContainer) return;
    
   episodesContainer.innerHTML = episodes.map(episode => {
    const episodeId = episode.url.split('/').pop();
    return `
      <li class="charactersdetails__link" data-episode-id="${episodeId}">
        <div class="charactersdetails__texts">
          <h3 class="type-characterdetails">${episode.episode}</h3>
          <p class="desc-characterdetails">${episode.name}</p>
          <p class="date-characterdetails">${episode.air_date}</p>
        </div>
        <img class="icon-charactersdetails__link" src="images/icons/characters-details/arrow.svg">
      </li>
    `;
  }).join('');
    addEpisodeClickHandlers();
}

function addEpisodeClickHandlers() {
  document.querySelectorAll('.charactersdetails__link[data-episode-id]').forEach(link => {
    link.addEventListener('click', (e) => {
      if (!e.target.classList.contains('icon-charactersdetails__link')) {
        const episodeId = link.getAttribute('data-episode-id');
        window.location.href = `Episodes-details.html?id=${episodeId}`;
      }
    });
  });
}
  if (characterId) {
    loadCharacterDetails();
  }
}

function initLocationsPage() {
  
  const state = {
    page: 1,
    searchQuery: '',
    hasMore: true
  };

  const container = document.querySelector('.locations__cards');
  const loadMoreBtn = document.querySelector('.button-characters');
  const searchInput = document.querySelector('.input-locations');

 const filters = {
  page: 1,
  searchQuery: '',
  name: '',
  type: '',
  dimension: '',
  hasMore: true
};

function initFilters() {
  const typeContainer = document.querySelector('.locations__filtercontainer:nth-child(2)');
  const dimensionContainer = document.querySelector('.locations__filtercontainer:nth-child(3)');
  
  if (typeContainer) {
    const button = typeContainer.querySelector('.locations__button');
    createDropdown(
      typeContainer,
      button,
      ['Planet', 'Cluster', 'Space station', 'Microverse', 'TV', 'Resort'],
      'Type',
      value => {
        filters.type = value;
        filters.page = 1;
        loadLocations();
      }
    );
  }

  if (dimensionContainer) {
    const button = dimensionContainer.querySelector('.locations__button');
    createDropdown(
      dimensionContainer,
      button,
      ['Dimension C-137', 'Post-Apocalyptic', 'Replacement Dimension', 'Fantasy Dimension'],
      'Dimension',
      value => {
        filters.dimension = value;
        filters.page = 1;
        loadLocations();
      }
    );
  }
}

function createDropdown(container, button, options, title, callback) {
  if (!container || !button) return;

  const oldDropdown = container.querySelector('.dropdown-menu');
  if (oldDropdown) oldDropdown.remove();

  const dropdown = document.createElement('div');
  dropdown.className = 'dropdown-menu';
  dropdown.style.display = 'none';
  
  const allItem = document.createElement('div');
  allItem.className = 'dropdown-item';
  allItem.textContent = 'All';
  allItem.addEventListener('click', () => {
    button.querySelector('p').textContent = title;
    callback('');
    dropdown.style.display = 'none';
  });
  dropdown.appendChild(allItem);

  options.forEach(option => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.textContent = option;
    item.addEventListener('click', () => {
      button.querySelector('p').textContent = `${title}: ${option}`;
      callback(option);
      dropdown.style.display = 'none';
    });
    dropdown.appendChild(item);
  });

  container.appendChild(dropdown);
  
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      if (menu !== dropdown) menu.style.display = 'none';
    });
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  });
}

document.addEventListener('click', () => {
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.style.display = 'none';
  });
});
initFilters()

  async function loadLocations() {
  try {
    const params = {
      page: filters.page,
    };
    if (filters.searchQuery) {
      params.name = filters.searchQuery;
    }
    if (filters.type) params.type = filters.type;
    if (filters.dimension) params.dimension = filters.dimension;

    const response = await axios.get(`${My_Api}/location`, { params });
    
    renderLocations(response.data.results);
    filters.hasMore = !!response.data.info.next;
    updateLoadMoreButton();
  } catch (error) {
    console.error('Error loading locations:', error);
  }
}

  function renderLocations(locations) {
    if (state.page === 1) container.innerHTML = '';
    
    locations.forEach(location => {
      const card = document.createElement('div');
      card.className = 'locations__card';
      card.innerHTML = `
        <div class="locations__texts">
          <h3 class="dimension-locations">${location.name}</h3>
          <p class="type-locations">${location.type}</p>
        </div>
      `;
      card.addEventListener('click', () => {
        window.location.href = `Locations-details.html?id=${location.id}`;
      });
      container.appendChild(card);
    });
  }

  function updateLoadMoreButton() {
    if (loadMoreBtn) {
      loadMoreBtn.style.display = state.hasMore ? 'block' : 'none';
    }
  }

  if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', () => {
    filters.page++;
    loadLocations();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      state.page = 1;
      state.searchQuery = e.target.value.trim();
      loadLocations();
    }, 300));
  }

  loadLocations();
}

function initLocationDetailsPage() {
  
  const urlParams = new URLSearchParams(window.location.search);
  const locationId = urlParams.get('id');
  
  const backButton = document.querySelector('.button-locationsdetails__head');
  if (backButton) {
    backButton.addEventListener('click', () => window.history.back());
  }

  async function loadLocationDetails() {
    try {
      const response = await axios.get(`${My_Api}/location/${locationId}`);
      renderLocationDetails(response.data);
      
      if (response.data.residents.length > 0) {
        const residentIds = response.data.residents.map(url => 
          url.split('/').pop()
        );
        const residentsResponse = await axios.get(
          `${My_Api}/character/${residentIds.join(',')}`
        );
        renderResidents(Array.isArray(residentsResponse.data) ? 
          residentsResponse.data : [residentsResponse.data]);
      }
    } catch (error) {
      console.error('Error loading location details:', error);
    }
  }

  function renderLocationDetails(location) {
    document.querySelector('.header-locationsdetails__head').textContent = location.name;
    
    document.querySelector('.locationsdetails__subheader').innerHTML = `
      <div class="locationsdetails__subtext">
        <h3 class="type-locationsdetails">Type</h3>
        <p class="desc-locationsdetails">${location.type}</p>
      </div>
      <div class="locationsdetails__subtext">
        <h3 class="type-locationsdetails">Dimension</h3>
        <p class="desc-locationsdetails">${location.dimension}</p>
      </div>
    `;
  }

  function renderResidents(residents) {
    const container = document.querySelector('.locationsdetails__cards');
    if (!container) return;
    
    container.innerHTML = '';
    
    residents.forEach(character => {
      const card = document.createElement('div');
      card.className = 'locationsdetails__card';
      card.innerHTML = `
        <img src="${character.image}" alt="${character.name}" class="image-locationsdetails">
        <div class="locationsdetails__texts">
          <h3 class="name-locationsdetails">${character.name}</h3>
          <p class="species-locationsdetails">${character.species}</p>
        </div>
      `;
      card.addEventListener('click', () => {
        window.location.href = `Character-details.html?id=${character.id}`;
      });
      container.appendChild(card);
    });
  }

  if (locationId) loadLocationDetails();
}

function initEpisodesPage() {
  
  const state = {
    page: 1,
    searchQuery: '',
    hasMore: true
  };

  const container = document.querySelector('.episodes__cards');
  const loadMoreBtn = document.querySelector('.button-characters');
  const searchInput = document.querySelector('.input-episodes');

  async function loadEpisodes() {
    try {
      const response = await axios.get(`${My_Api}/episode`, {
        params: {
          page: state.page,
          name: state.searchQuery
        }
      });
      
      renderEpisodes(response.data.results);
      state.hasMore = !!response.data.info.next;
      updateLoadMoreButton();
    } catch (error) {
      console.error('Error loading episodes:', error);
    }
  }

  function renderEpisodes(episodes) {
    if (state.page === 1) container.innerHTML = '';
    
    episodes.forEach(episode => {
      const card = document.createElement('div');
      card.className = 'episodes__card';
      card.innerHTML = `
        <div class="episodes__texts">
          <h3 class="name-episodes">${episode.name}</h3>
          <p class="date-episodes">${episode.air_date}</p>
          <h4 class="episode-episodes">${episode.episode}</h4>
        </div>
      `;
      card.addEventListener('click', () => {
        window.location.href = `Episodes-details.html?id=${episode.id}`;
      });
      container.appendChild(card);
    });
  }

  function updateLoadMoreButton() {
    if (loadMoreBtn) {
      loadMoreBtn.style.display = state.hasMore ? 'block' : 'none';
    }
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      state.page++;
      loadEpisodes();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      state.page = 1;
      state.searchQuery = e.target.value.trim();
      loadEpisodes();
    }, 300));
  }

  loadEpisodes();
}

function initEpisodeDetailsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const episodeId = urlParams.get('id');
  
  const backButton = document.querySelector('.button-episodesdetails__head');
  if (backButton) {
    backButton.addEventListener('click', () => window.history.back());
  }

  async function loadEpisodeDetails() {
    try {
      const episodeResponse = await axios.get(`${My_Api}/episode/${episodeId}`);
      const episode = episodeResponse.data;
      
      const characterIds = episode.characters.map(url => url.split('/').pop());
      const charactersResponse = await axios.get(`${My_Api}/character/${characterIds.join(',')}`);
      const characters = Array.isArray(charactersResponse.data) ? charactersResponse.data : [charactersResponse.data];
      renderEpisodeDetails(episode, characters);
    } catch (error) {
      console.error('Error loading episode details:', error);
    }
  }

  function renderEpisodeDetails(episode, characters) {
    document.querySelector('.header-episodesdetails__head').textContent = episode.name;
    
    document.querySelector('.episodesdetails__subheader').innerHTML = `
      <div class="episodesdetails__subtext">
        <h3 class="type-episodesdetails">Episode</h3>
        <p class="desc-episodesdetails">${episode.episode}</p>
      </div>
      <div class="episodesdetails__subtext">
        <h3 class="type-episodesdetails">Date</h3>
        <p class="desc-episodesdetails">${episode.air_date}</p>
      </div>
    `;
    renderCharacters(characters);
  }

  function renderCharacters(characters) {
    const container = document.querySelector('.episodesdetails__cards');
    if (!container) return;
    
    container.innerHTML = '';
    
    characters.forEach(character => {
      const card = document.createElement('div');
      card.className = 'episodesdetails__card';
      card.innerHTML = `
        <img src="${character.image}" alt="${character.name}" class="image-episodesdetails">
        <div class="episodesdetails__texts">
          <h3 class="name-episodesdetails">${character.name}</h3>
          <p class="species-episodesdetails">${character.species}</p>
        </div>
      `;
      card.addEventListener('click', () => {
        window.location.href = `Character-details.html?id=${character.id}`;
      });
      container.appendChild(card);
    });
  }

  if (episodeId) {
    loadEpisodeDetails();
  }
}
 
