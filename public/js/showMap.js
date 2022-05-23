mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/cort0/cl3ebgrmz000114p5jn8m5wy7', // style URL
  center: farm.geometry.coordinates, // starting position [lng, lat]
  zoom: 11, // starting zoom
});

new mapboxgl.Marker()
  .setLngLat(farm.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h5 class='text-capitalize my-3'>${farm.name}</h5><p>${farm.city}-${farm.district}-${farm.CAP}</p>`
    )
  )
  .addTo(map);
