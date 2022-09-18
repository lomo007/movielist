'use strict'

const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12
let currentPage = 1

const movies = []
let filtredMovies = []

const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')
const modeChangeSwitch = document.querySelector('#change-mode')

function renderMovieList(data) {
  console.log(dataPanel.dataset.mode)
  if (dataPanel.dataset.mode === 'card-mode') {
    let rawHTML = ''    //這個位置很重要每次印出清單前, 先清空再開始forEach倫次印出
    data.forEach(item => {
      rawHTML += `
      <div class="col-sm-3 mt-3">
          <div class="mb-2">
            <div class="card">
              <img
              src="${POSTER_URL + item.image}">
              <h5 class="card-title m-3">${item.title}</h5>
              <div class="card-footer mt-3">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More
                </button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>
  `
    });
    dataPanel.innerHTML = rawHTML
  } else if (dataPanel.dataset.mode === 'list-mode') {
    let rawHTML = `<ul class="list-group col-sm-12 mb-2">`
    data.forEach(item => {
      rawHTML += `
      <li class="list-group-item d-flex justify-content-between">
        <h5>${item.title}</h5>
        <div>
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More
        </button>
        <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </li>
     `
    })
    rawHTML += `</ul>`
    dataPanel.innerHTML = rawHTML
  }
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let page = 1;
  let rawHTML = `<li class="page-item"><a class="page-link active" href="#" data-page="${page}">1</a></li>`
  for (page + 1; page < numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page + 1}">${page + 1}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

paginator.addEventListener('click', function onPaginatorClicked(event) {
  const page = Number(event.target.dataset.page)
  const paginatorA = document.querySelectorAll('#paginator a')
  paginatorA.forEach(pA => pA.classList.remove('active'))
  event.target.classList.add('active')
  currentPage = page
  console.log(currentPage)
  renderMovieList(getMoviesByPage(currentPage))
})

function getMoviesByPage(page) {
  const data = filtredMovies.length ? filtredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDescription = document.querySelector('#movie-modal-description')
  const modalDate = document.querySelector('#movie-modal-date')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results

    modalTitle.innerText = data.title
    modalDate.innerText = data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

function addToFavorite(id) {
  const movie = movies.find(movie => movie.id === Number(id))
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []

  if (list.some(movie => movie.id === id)) {
    return alert('此電影已經在收藏清單中!')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function changeDisplayMode(displayMode) {
  if (dataPanel.dataset.mode === displayMode) return
  dataPanel.dataset.mode = displayMode
}

modeChangeSwitch.addEventListener('click', function onSwitchClicked(event) {
  if (event.target.matches('#card-mode-button')) {
    changeDisplayMode('card-mode')
    renderMovieList(getMoviesByPage(currentPage))
  } else if (event.target.matches('#list-mode-button')) {
    changeDisplayMode('list-mode')
    renderMovieList(getMoviesByPage(currentPage))
  }
})

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(event.target.dataset.id)
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filtredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword)
  )

  if (filtredMovies.length === 0) {
    return alert('Cannot find moviess with keyword: ' + keyword)
  }
  currentPage = 1
  renderPaginator(filtredMovies.length)
  renderMovieList(getMoviesByPage(currentPage))
})

axios.get(INDEX_URL).then(response => {
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(currentPage))
})
  .catch(err => console.log(err))


