var width = 630;
var height = 360;
var difference = 2;
var interveralID = 0;
//document.getElementById("img1").style.width=width;

function increase() {
  clearInterval(interveralID);
  interveralID = setInterval(expand, 10);
}
function decrease() {
  clearInterval(interveralID);
  interveralID = setInterval(shrink, 10);
}
function expand() {
  if (width < 700 && height < 400) {
    width = width + difference;
    document.getElementById("img1").style.width = width;
    console.log(width);
  } else {
    clearInterval(interveralID);
  }
}
function shrink() {
  if (width > 700 && height > 400) {
    width = width - difference;
    document.getElementById("img1").style.width = width;
    console.log(width);
  } else {
    clearInterval(interveralID);
  }
}
