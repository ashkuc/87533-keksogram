var getMessage = new function(a, b){
  switch (typeof(a)){
    case 'boolean':
      if(a){
        return('Переданное GIF-изображение анимировано и содержит '+b+' кадров');
      }
      else{
        return('Переданное GIF-изображение не анимировано');
      }
      break;
    case 'number':
      return('Переданное SVG-изображение содержит ' + a + ' объектов и ' + (b * 4) + ' аттрибутов');
      break;
    case 'object':
      if(typeof(b)=='object'){
        return('Общая площадь артефактов сжатия: [square] пикселей');
      }
      else{
        return('Количество красных точек во всех строчках изображения: [sum]');
      }
      break;
  }
};
// going to add square and sum functions soon
var square = new function(aa, bb){};
var square = new function(aa){};
