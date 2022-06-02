console.clear();

const slideBtn = document.getElementById('slide');
const closeBtn = document.getElementById('close');
const geoBtn = document.getElementById('geo');

slideBtn.addEventListener('click', (e) => {
  let parent = e.target.parentNode.parentNode;
  Array.from(e.target.parentNode.parentNode.classList).find((element) => {
    if (element !== 'slide-up') {
      parent.classList.add('slide-up');
      document.getElementById('close').classList.remove('closing-slide');
    } else {
      closeBtn.parentNode.classList.add('slide-up');
      parent.classList.remove('slide-up');
      document.getElementById('close').classList.add('closing-slide');
    }
  });
});

closeBtn.addEventListener('click', (e) => {
  let parent = e.target.parentNode;
  Array.from(e.target.parentNode.classList).find((element) => {
    if (element !== 'slide-up') {
      parent.classList.add('slide-up');
      document.getElementById('close').classList.add('closing-slide');
    } else {
      slideBtn.parentNode.parentNode.classList.add('slide-up');
      document.getElementById('close').classList.remove('closing-slide');
      parent.classList.remove('slide-up');
    }
  });
});

$('.map_btn').click(function (e) {
  app.preloader.show();
  getLocation();
});
