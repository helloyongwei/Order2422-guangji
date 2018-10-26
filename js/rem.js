/**100像素对应1rem */
(function () {
  if (!window.addEventListener) {
    return;
  }
  var html = document.documentElement;

  function setFont() {
    var cliWidth = html.clientWidth;
    html.style.fontSize = 100 * (cliWidth / 640) + 'px';
  }
  document.addEventListener('DOMContentLoaded', setFont, false);
})();