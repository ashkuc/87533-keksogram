'use strict';

(function() {
    var divPictures = document.querySelector('.pictures');

    var templateNode = document.querySelector('#picture-template');

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
    }

    pictures.forEach( function(item){
        var pictureTemp = newPictureTemplate(item);
        divPictures.appendChild(pictureTemp);
    });
})();
