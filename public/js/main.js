/*=============== CHANGE BACKGROUND HEADER ===============*/
function scrollHeader() {
  const header = document.getElementById('header');
  // When the scroll is greater than 80 viewport height, add the scroll-header class to the header tag
  if (this.scrollY >= 80) header.classList.add('scroll-header');
  else header.classList.remove('scroll-header');
}
window.addEventListener('scroll', scrollHeader);

/*=============== ACTICE LINK ON PAGE ===============*/

$(document).ready(function () {
  let path = window.location.pathname;
  $('.nav__link').each(function () {
    if (path === $(this).attr('href')) {
      $(this).addClass('active-link');
    }
  });
});

$(document).ready(function () {
  let path = window.location.pathname;
  document.addEventListener('click', function handleClick(heart) {
    if (path === $(this)) {
      heart.target.classList.toggle('fav-icon-on');
    }
  });
});
