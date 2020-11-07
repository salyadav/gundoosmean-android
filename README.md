Merge gundoosmean-client code to cordova application structure --> src contains the gundoosmean-client code

Basic folder structure created using:

`cordova create gundoosmean-android`

Merge package.json from gundoosmean-client to package.json here

Add cordova plugins:

 1. `cordova plugin add cordova-plugin-device`
 2. `cordova plugin add cordova-plugin-whitelist`
 3. `cordova plugin add cordova-android`

Save the plugin setting:

`cordova plugin save`

To remove platform:
(In order to rebuild ios platform)

`cordova platform rm ios`

To add platform: 

`cordova platform add ios`

To point `dist` folder built by the parcel build command to `www` publish folder mandated for android app to pick from:

`ln -s dist www`


To reproduce for the first time in local:

`npm install`

`npm run build`

`cordova run android`
