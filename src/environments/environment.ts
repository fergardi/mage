// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  hmr: false,
  firebase: {
    apiKey: 'AIzaSyCSVr_n7Ced40pw2qHEhnr3G09UILvB_zc',
    authDomain: 'mage-c4259.firebaseapp.com',
    databaseURL: 'https://mage-c4259.firebaseio.com',
    projectId: 'mage-c4259',
    storageBucket: 'mage-c4259.appspot.com',
    messagingSenderId: '210042498621',
    appId: '1:210042498621:web:c4a21bc796b32d8bf40454',
  },
  mapbox: {
    style: 'mapbox://styles/fergardi/ckacdomo73idr1is4dkj2kfil',
    token: 'pk.eyJ1IjoiZmVyZ2FyZGkiLCJhIjoiY2lxdWl1enJiMDAzaWh4bTNwY3F6MnNwdiJ9.fPkJoOfrARPtZWCj1ehyCQ',
    lat: 42.618060799999995,
    lng: -5.5508992,
    zoom: 12,
    pitch: 60,
  },
  functions: {
    url: 'http://localhost:5001/mage-c4259/europe-west1/api',
  },
  overpass: {
    url: 'http://overpass-api.de/api/interpreter',
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
