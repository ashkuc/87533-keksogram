/* global Resizer: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

(function() {
  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  var filterCookie;
  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  window.addEventListener('resizerchange', resizerChangeHandler);

  function resizerChangeHandler() {
    //Ограничения на перетаскивание
    if (currentResizer) {
      if (currentResizer.getConstraint().x < 0) {
        currentResizer.setConstraint(0);
      }

      if (currentResizer.getConstraint().x > currentResizer._image.naturalWidth - currentResizer.getConstraint().side) {
        currentResizer.setConstraint(currentResizer._image.naturalWidth - currentResizer.getConstraint().side);
      }

      if (currentResizer.getConstraint().y < 0) {
        currentResizer.setConstraint(currentResizer.getConstraint().x, 0);
      }

      if (currentResizer.getConstraint().y > currentResizer._image.naturalHeight - currentResizer.getConstraint().side) {
        currentResizer.setConstraint(currentResizer.getConstraint().x, currentResizer._image.naturalHeight - currentResizer.getConstraint().side);
      }

      resizeForm['resize-x'].value = parseInt(currentResizer.getConstraint().x, 10);
      resizeForm['resize-y'].value = parseInt(currentResizer.getConstraint().y, 10);
      resizeForm['resize-size'].value = parseInt(currentResizer.getConstraint().side, 10);
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  var resizeXField = document.getElementById('resize-x');

  var resizeYField = document.getElementById('resize-y');

  var resizeSideField = document.getElementById('resize-size');

  var resizeSubmitButton = document.getElementById('resize-fwd');

  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */
  function renewResizeFormLimits() {
    if (typeof currentResizer !== 'undefined') {
      resizeXField.max = currentResizer._image.naturalWidth - resizeSideField.value;
      resizeYField.max = currentResizer._image.naturalHeight - resizeSideField.value;
      resizeSideField.max = Math.min(currentResizer._image.naturalWidth, currentResizer._image.naturalHeight);
      resizeFormIsValid();
      return this.id;
    }
  }

  function resizeFormIsValid() {
    if (resizeXField.validity.valid && resizeYField.validity.valid && resizeSideField.validity.valid) {
      resizeSubmitButton.disabled = false;
      return true;
    } else {
      resizeSubmitButton.disabled = true;
      return false;
    }
  }

  resizeXField.addEventListener('keyup', renewResizeFormLimits);

  resizeYField.addEventListener('keyup', renewResizeFormLimits);

  resizeSideField.addEventListener('keyup', renewResizeFormLimits);

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];

  resizeForm.addEventListener('change', function(event) {
    resizeFormChangeHandler(event.target);

    currentResizer.redraw();
  });

  function resizeFormChangeHandler(target) {
    var element = target;

    //Границы для X
    if (element.name === 'x') {
      if (+element.value <= 0) {
        element.value = 0;
        currentResizer.setConstraint(+element.value);
      } else if (+element.value + currentResizer.getConstraint().side <= currentResizer._image.naturalWidth) {
        currentResizer.setConstraint(+element.value);
      } else {
        element.value = currentResizer._image.naturalWidth - currentResizer.getConstraint().side;
        currentResizer.setConstraint(+element.value);
      }
    }

    //Границы для Y
    if (element.name === 'y') {
      if (+element.value <= 0) {
        element.value = 0;
        currentResizer.setConstraint(+resizeForm['resize-x'].value, +element.value);
      } else if (+element.value + currentResizer.getConstraint().side <= currentResizer._image.naturalHeight) {
        currentResizer.setConstraint(+resizeForm['resize-x'].value, +element.value);
      } else {
        element.value = currentResizer._image.naturalHeight - currentResizer.getConstraint().side;
        currentResizer.setConstraint(+resizeForm['resize-x'].value, +element.value);
      }
    }

    //Границы для size
    if (element.name === 'size') {
      if (+element.value <= 0) {
        element.value = 0;
        currentResizer.setConstraint(+resizeForm['resize-x'].value, +resizeForm['resize-y'].value, +element.value);
      } else if (+element.value <= Math.min(currentResizer._image.naturalWidth - resizeForm['resize-x'].value,
                 currentResizer._image.naturalHeight - resizeForm['resize-y'].value)) {
        currentResizer.setConstraint(+resizeForm['resize-x'].value, +resizeForm['resize-y'].value, +element.value);
      } else {
        element.value = Math.min(currentResizer._image.naturalWidth - resizeForm['resize-x'].value,
                        currentResizer._image.naturalHeight - resizeForm['resize-y'].value);
        currentResizer.setConstraint(+resizeForm['resize-x'].value, +resizeForm['resize-y'].value, +element.value);
      }
    }
  }

  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  var selectedFilter;

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  function daysAfterBirth(birthDate) {
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    var today = Date.now();
    var diffInDays = Math.round(Math.abs((today - birthDate.getTime()) / (oneDay)));
    return diffInDays;
  }

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  uploadForm.onchange = function(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.onload = function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');
        };

        hideMessage();
      }

      fileReader.readAsDataURL(element.files[0]);
    } else {
      // Показ сообщения об ошибке, если загружаемый файл, не является
      // поддерживаемым изображением.
      showMessage(Action.ERROR);
    }
  };

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.onreset = function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  };

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.onsubmit = function(evt) {
    evt.preventDefault();

    if (resizeFormIsValid()) {
      filterImage.src = currentResizer.exportImage().src;

      filterCookie = docCookies.getItem('filter-cookie');
      filterCookie = filterCookie || 'none';
      filterImage.className = 'filter-image-preview filter-' + filterCookie;

      document.getElementById('upload-filter-' + filterCookie).checked = true;

      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  };

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.onreset = function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  };

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.onsubmit = function(evt) {
    evt.preventDefault();

    selectedFilter = selectedFilter || filterCookie;

    docCookies.setItem('filter-cookie', selectedFilter, 24 * 60 * 60 * 1000 * daysAfterBirth(new Date(2015, 8, 9)), '/');
    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  };

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.onchange = function() {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;
    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
  };

  cleanupResizer();
  updateBackground();
})();
