function getMessage(a, b){
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
      //not every object is array, but works for now
    case 'object':
      if(typeof(b)=='object'){
        return('Общая площадь артефактов сжатия: ' + square(a, b) + ' пикселей');
      }
      else{
        return('Количество красных точек во всех строчках изображения: ' + sum(a));
      }
      break;
  }
};
// going to add square and sum functions soon
function square(aa, bb){
  var len= (aa.length >= bb.length) ? aa.length-1 : bb.length-1;
  var result = 0;
  for(len; len >= 0; len--){
    result += aa[len] * bb[len];
  };
  return result;
};
function sum(aa){
  var result = 0;
  for(len = 0; len < aa.length; len++){
    result += aa[len];
  };
  return result;  
};
