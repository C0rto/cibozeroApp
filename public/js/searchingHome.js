var contInput = document.getElementById('continput');
var gInput = document.getElementById('input-group');
var input = document.getElementById('searchtext');
var button = document.getElementById('icon-src');
var logo = document.getElementById('logo');
var results = document.getElementById('results');
var redBg = document.getElementById('header');

var element = [redBg, contInput, gInput, button, logo, results];

input.addEventListener(
  'focus',
  function () {
    for (var i = 0; i < element.length; i++) {
      element[i].classList.add('focus' + i);
    }
  },
  false
);

input.addEventListener(
  'blur',
  function () {
    for (var i = 0; i < element.length; i++) {
      element[i].classList.remove('focus' + i);
    }
  },
  false
);

input.addEventListener(
  'keyup',
  function () {
    if (results.childNodes.length === 0) {
      results.classList.remove('visible');
    } else {
      results.classList.add('visible');
    }
  },
  false
);

/* jquery for autocomplete*/

jQuery(document).ready(function ($) {
  $('#searchtext').keyup(function () {
    getAutoCompleteValues($('#searchtext').val());
  });
});

function getAutoCompleteValues(val) {
  $.ajax({
    dataType: 'jsonp',
    jsonp: 'cb',
    cache: 'false',
    // jsonpCallback: "callback",
    url:
      'http://autocomplete.wunderground.com/aq?query=' + val + '&format=json',
    // cache: false,
    success: function (data) {
      // alert(data);
      if (val == '') {
        $('#results').html('');
        $('#results').removeClass('result');
      } else {
        $('#results').html('');
        $('#results').addClass('result');
        for (var i = 0; i < 8; i++) {
          var city = data.RESULTS[i]['name'];
          $('#results').append('<li><a href="#">' + city + '</a></li>');
        }
      }
    },
  });
}
