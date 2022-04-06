/* eslint-disable */
export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoia2llbnlpZXAiLCJhIjoiY2wxM251bmpmMDB6OTNsbnYxeG9qNjBmOCJ9.qgT1sQb8ByZkbWBqmA2aqg';
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/kienyiep/cl0oqkyea005s14jzuf0l6zzp', // style URL
    scrollZoom: false,
    // center: [-118.113491, 34.111745], // starting position [lng, lat]
    // zoom: 9, // starting zoom
    // interactive: false,
  });
  // allow the map to figure the location or position of the map to be displayed.
  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((loc) => {
    //create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // add a new marker inside the mapbox
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom', // the bottom of the pin will be located at the exact GPS location
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    // Add popup
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}:  ${loc.description}</p>`)
      .addTo(map);
    //extend the map bound to include the current location
    bounds.extend(loc.coordinates);
  });

  // fitBound will execute the moving and the zooming
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
