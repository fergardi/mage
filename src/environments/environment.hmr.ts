// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  hmr: true,
  firebase: {
    apiKey: "AIzaSyB1gh6k7CJMncQkBqZXaeAI6LlQqogCQHU",
    authDomain: "mage-b1c51.firebaseapp.com",
    projectId: "mage-b1c51",
    storageBucket: "mage-b1c51.appspot.com",
    messagingSenderId: "766088785551",
    appId: "1:766088785551:web:b21858c3eb360e138c8afa",
    measurementId: "G-C151MDL529"
  },
  mapbox: {
    style: 'mapbox://styles/fergardi/ckacdomo73idr1is4dkj2kfil',
    token: 'pk.eyJ1IjoiZmVyZ2FyZGkiLCJhIjoiY2lxdWl1enJiMDAzaWh4bTNwY3F6MnNwdiJ9.fPkJoOfrARPtZWCj1ehyCQ',
    lat: 42.599892,
    lng: -5.571730,
    zoom: 12,
    pitch: 80,
  },
  functions: {
    url: 'http://localhost:5001/mage-b1c51/europe-west1/api',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
