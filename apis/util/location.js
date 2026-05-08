require('dotenv').config()
const fetch = require('node-fetch');
const API_KEY = process.env.MAP_APIKEY
const MAP_API = "https://maps.googleapis.com/maps/api/geocode/json"

exports.getLocation = async (loc) => {
  try {
    const { lat, lng } = loc
    await fetch(MAP_API + `?latlng=${lat},${lng}&key=${API_KEY}`).then((response) => {
      console.log(response);
    })
  } catch (error) {
    console.log('Error caugh fetching user lcoation :: ' + error);
    return error
  }
}