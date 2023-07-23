import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";


const API_KEY = `38389373-066e0672115b08bfa137732cd`;
const URL = "https://pixabay.com/api/";

async function fetchPhoto(q, page, perPage) {
    const url = `${URL}?key=${API_KEY}&q=${q}&page=${page}&per_page=${perPage}&image_type=photo&orientation=horizontal&safesearch=true`;
    const response = await axios.get(url);
    return response.data;          
};

const refs = {
    searchForm: document.querySelector('.search-form'),
    gallery: document.querySelector('.gallery'),
    btnLoadMore: document.querySelector('.load-more'),
};

const { searchForm, gallery, btnLoadMore } = refs;

const paramsForNotify = {
    position: 'center-center',
    timeout: 3000,
    width: '400px',
    fontSize: '24px'
};

const perPage = 40;
let page = 1;
let keyOfSearchPhoto = '';

btnLoadMore.classList.add('is-hidden');

searchForm.addEventListener('submit', onSubmitForm);

function onSubmitForm(event) {
    event.preventDefault();

    gallery.innerHTML = '';
    page = 1;
    const { searchQuery } = event.currentTarget.elements;
    keyOfSearchPhoto = searchQuery.value
        .trim()
        .toLowerCase()
        .split(' ')
        .join('+');

    if (keyOfSearchPhoto === '') {
        Notify.info('Enter your request, please!', paramsForNotify);
        return;
    }

    fetchPhoto(keyOfSearchPhoto, page, perPage)
        .then(data => {
            const searchResults = data.hits;
            if (data.totalHits === 0) {
                Notify.failure('Sorry, there are no images matching your search query. Please try again.', paramsForNotify);
            } else {
                Notify.info(`Hooray! We found ${data.totalHits} images.`, paramsForNotify);
                createMarkup(searchResults);
                lightbox.refresh();

            };
            if (data.totalHits > perPage) {
                btnLoadMore.classList.remove('is-hidden');
            };
        })
        .catch(onFetchError);

    btnLoadMore.addEventListener('click', onClickLoadMore);

    event.currentTarget.reset();
};

function onClickLoadMore() {
    page += 1;
    fetchPhoto(keyOfSearchPhoto, page, perPage)
        .then(data => {
            const searchResults = data.hits;
            const numberOfPage = Math.ceil(data.totalHits / perPage);
            
            createMarkup(searchResults);
            if (page === numberOfPage) {
                btnLoadMore.classList.add('is-hidden');
                Notify.info("We're sorry, but you've reached the end of search results.", paramsForNotify);
                btnLoadMore.removeEventListener('click', onClickLoadMore);
                window.removeEventListener('scroll', showLoadMorePage);
            };
            lightbox.refresh();
        })
        .catch(onFetchError);
};


function createMarkup(searchResults) {
    const arrPhotos = searchResults.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
        return `<div class="photo-card">
        <div class="img_wrap">
            <a class="gallery_link" href="${largeImageURL}">
                <img src="${webformatURL}" alt="${tags}" width="230" loading="lazy" />
            </a>
        </div>
        <div class="info">
            <p class="info-item">
            <b>Likes: ${likes}</b>
            </p>
            <p class="info-item">
            <b>Views: ${views}</b>
            </p>
            <p class="info-item">
            <b>Comments: ${comments}</b>
            </p>
            <p class="info-item">
            <b>Downloads: ${downloads}</b>
            </p>
        </div>
        </div>`
    });
    gallery.insertAdjacentHTML("beforeend", arrPhotos.join(''));
};

function onFetchError() {
    Notify.failure('Oops! Something went wrong! Try reloading the page or make another choice!', paramsForNotify);
};


function showLoadMorePage() {
    if (checkIfEndOfPage()) {
        onClickLoadMore();
    };
};

function checkIfEndOfPage() {
  return (
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight
  );
}

let lightbox = new SimpleLightbox('.img_wrap a', { 
                captionsData: 'alt',
                captionDelay: 250,
    });