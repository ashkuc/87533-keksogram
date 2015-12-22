/*globals Photo*/

'use strict';

(function() {
  var divPictures = document.querySelector('.pictures');

  var divFilters = document.querySelector('.filters');

  var filtersRadio = document.querySelectorAll('.filters-radio');

  var picturesArray = [];

  var filteredPictures;

  var activefilter = 'filter-popular';

  var monthInMilSec = 1000 * 60 * 60 * 24 * 60;

  var picturesPerPage = 12;

  var scrollTimeout;

  var currentPage = 0;

  for (var i = 0; i < filtersRadio.length; i++) {
    filtersRadio[i].onclick = function(event) {
      var clickedElementID = event.target.id;
      changeFilter(clickedElementID);
    };
  }

  var changeFilter = function(id, force) {
    if (activefilter === id && !force) {
      return;
    }
    divPictures.innerHTML = '';
    currentPage = 0;
    filteredPictures = picturesArray.slice(0);
    activefilter = id;
    switch (id) {
      case 'filter-popular':
        filteredPictures = picturesArray.sort(function(pic1, pic2) {
          return pic2.likes - pic1.likes;
        });
        break;

      case 'filter-discussed':
        filteredPictures = picturesArray.sort(function(pic1, pic2) {
          return pic2.comments - pic1.comments;
        });
        break;

      case 'filter-new':
        filteredPictures = picturesArray.filter(function(pic1) {
          return Math.abs(new Date() - new Date(pic1.date)) / monthInMilSec < 3;
        });
        filteredPictures = filteredPictures.sort(function(pic1, pic2) {
          return new Date(pic2.date) - new Date(pic1.date);
        });
        break;
    }

    showPictures(filteredPictures, 0);
  };

  //Обработчики на собтия страницы
  window.addEventListener('load', addPicturePage);

  window.addEventListener('resize', addPicturePage);

  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
      addPicturePage();
    }, 100);
  });

  function addPicturePage() {
    var clientHeight = document.documentElement.offsetHeight;
    var picturesRect = document.querySelector('.pictures').getBoundingClientRect();

    if (picturesRect.height <= clientHeight + window.scrollY) {
      if (currentPage < Math.ceil(filteredPictures.length / picturesPerPage)) {
        showPictures(filteredPictures, ++currentPage);
      }
    }
  }

  //Спрятать фильтры
  var hideFilters = function() {
    divFilters.classList.remove('visible');
    divFilters.classList.add('hidden');
  };

  //Показать фильтры
  var showFilters = function() {
    divFilters.classList.remove('hidden');
    divFilters.classList.add('visible');
  };

  var showPictures = function(pictures, pageNumber) {

    var dFragment = document.createDocumentFragment();

    var arrBegin = pageNumber * picturesPerPage;
    var arrEnd = arrBegin + picturesPerPage;

    pictures = pictures.slice(arrBegin, arrEnd);

    pictures.forEach( function(item) {
      var newPhoto = new Photo(item);
      var pictureTemp = Photo.render();
      dFragment.appendChild(pictureTemp);
    });

    divPictures.appendChild(dFragment);
  };

  var getPicturesRequest = function(path) {
    var xhr = new XMLHttpRequest();

    xhr.open('GET', path, true);
    xhr.send();

    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4) {
        return;
      }
      if (xhr.status !== 200) {
        divPictures.classList.remove('pictures-loading');
        divPictures.classList.add('pictures-failure');
      } else {
        divPictures.classList.remove('pictures-loading');
        var pictures = JSON.parse(xhr.responseText);
        picturesArray = pictures;
        changeFilter('filter-popular', true);

        showFilters();
      }
    };
    divPictures.classList.add('pictures-loading');
  };

  hideFilters();
  var testpath = 'data/pictures.json';
  getPicturesRequest(testpath);


})();
