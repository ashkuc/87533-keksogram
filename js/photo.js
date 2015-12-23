function Photo(data) {
  this._data = data;

 };

Photo.prototype.render = function() {
	var templateNode = document.querySelector('#picture-template');
    var newTemplate = templateNode.content.children[0].cloneNode(true);
    var image = new Image();

    image.onload = function() {
      image.height = image.width = 182;
      newTemplate.replaceChild(image, newTemplate.querySelector('img'));
    };

    image.onerror = function() {
      newTemplate.classList.add('picture-load-failure');
    };

    image.src = this._data.url;

    newTemplate.querySelector('.picture-comments').textContent = this._data.comments;
    newTemplate.querySelector('.picture-likes').textContent = this._data.likes;

    return newTemplate;
 }
