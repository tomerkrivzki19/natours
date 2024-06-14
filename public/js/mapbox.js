// this is a js fille that we are going to intregate into our html and then will run on the client side
// console.log('hello from the client side :D');

//create a export that will take the array of  locations:
export const displayMap = (location) => {
  // L => export as namespace L = > the package of the leaflet package
  var map = L.map('map', { zoomControl: false }); //to disable + - zoom
  // var map = L.map('map', { zoomControl: false }).setView([31.111745, -118.113491], );

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    crossOrigin: '',
  }).addTo(map);

  //a distract of all the cordinates to the map package usinng foreach + settings for the display and output
  const points = [];
  location.forEach((loc) => {
    points.push([loc.coordinates[1], loc.coordinates[0]]);
    L.marker([loc.coordinates[1], loc.coordinates[0]])
      .addTo(map)
      .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
        autoClose: false,
      })
      .openPopup();
  });

  const bounds = L.latLngBounds(points).pad(0.5);
  map.fitBounds(bounds);

  map.scrollWheelZoom.disable(); //to disable zoom by mouse wheel
};
