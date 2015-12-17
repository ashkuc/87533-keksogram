'use strict';

var templateNode = document.querySelector('#picture-template');

(function() {
  var divPictures = document.querySelector('.pictures');

  var divFilters = document.querySelector('.filters');

  var filtersRadio = document.querySelectorAll('.filters-radio');

  var picturesArray = [];

  var activefilter = 'filter-popular';

  for (var i = 0; i < filtersRadio.length; i++) {
    filtersRadio[i].onclick = function(event) {
      var clickedElementID = event.target.id;
      changeFilter(clickedElementID);
    };
  }

  var changeFilter = function(id) {
    if (activefilter === id) {
      return;
    }
    activefilter = id;
    switch (id) {
      case 'filter-popular':
        picturesArray = picturesArray.sort(function(pic1, pic2) {
          return pic2.likes - pic1.likes;
        });
        break;
      case 'filter-discussed':
        picturesArray = picturesArray.sort(function(pic1, pic2) {
          return pic2.comments - pic1.comments;
        });
        break;
      case 'filter-new':
        picturesArray = picturesArray.sort(function(pic1, pic2) {
          return new Date(pic2.date) - new Date(pic1.date);
        });
        break;
    }

    showPictures(picturesArray);

  };

  var hideFilters = function() {
    divFilters.classList.remove('visible');
    divFilters.classList.add('hidden');
  };

  var showFilters = function() {
    divFilters.classList.remove('hidden');
    divFilters.classList.add('visible');
  };

  //Создание нового экземпляра по шаблону
  var newPictureTemplate = function(item) {
    var newTemplate = templateNode.content.children[0].cloneNode(true);
    var image = new Image();

    image.onload = function() {
      image.height = image.width = 182;
      newTemplate.replaceChild(image, newTemplate.querySelector('img'));
    };

    image.onerror = function() {
      newTemplate.classList.add('picture-load-failure');
    };

    image.src = item.url;

    newTemplate.querySelector('.picture-comments').textContent = item.comments;
    newTemplate.querySelector('.picture-likes').textContent = item.likes;

    return newTemplate;
  };

  var showPictures = function(pictures) {
    divPictures.innerHTML = '';

    var dFragment = document.createDocumentFragment();

    pictures.forEach( function(item) {
      var pictureTemp = newPictureTemplate(item);
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
        showPictures(pictures);
      }
    };
    divPictures.classList.add('pictures-loading');
  };

  hideFilters();
  var testpath = 'https://raw.githubusercontent.com/ashkuc/87533-keksogram/master/data/pictures.json';
  getPicturesRequest(testpath);
  showFilters();

})();
