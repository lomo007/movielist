'use strict'

const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

const dataPanel = document.querySelector('#data-panel')


function renderMovieList(data) {
  let rawHTML = ''    //這個位置很重要, 每次要印出電影清單前, 先清空再開始forEach倫次印出
  data.forEach(item => {
    rawHTML += `
      <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img
              src="${POSTER_URL + item.image}">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More
              </button>
              <button class="btn btn-danger btn-remove" data-id="${item.id}">x</button>
            </div>
          </div>
        </div>
  `
  });

  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDescription = document.querySelector('#movie-modal-description')
  const modalDate = document.querySelector('#movie-modal-date')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    //console.log(data)
    modalTitle.innerText = data.title
    modalDate.innerText = data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

function removeFromFavorite(id) {
  if (!movies) return

  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) return

  movies.splice(movieIndex, 1)

  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies)
}


dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove')) {
    removeFromFavorite(Number(event.target.dataset.id))
    console.log('hi')
  }
})

renderMovieList(movies)
