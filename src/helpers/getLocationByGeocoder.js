import axios from "axios";

export const getLocationByGeocoder = async (latitude, long, lang) => {
  const apiKey = process.env.GOOGLE_MAP_KEY;
  // Replace 'YOUR_API_KEY' with your actual API key
  const apiUrl = "https://maps.googleapis.com/maps/api/geocode/json";
  //const apiurl2 = "https://maps.googleapis.com/maps/api/geocode/json?latlng=37.4224764,-122.0842499&language=en&key=AIzaSyBcp5NIkZAijd0FdltFwQ36x7O0RYx4B0Y";

  const lat = latitude; // Replace with your latitude
  const lng = long; // Replace with your longitude

  // Define parameters for the reverse geocoding API request
  const params = {
    latlng: `${lat},${lng}`,
    language: `en`,
    key: apiKey,
  };
  //console.log(params);
  // Make the request to the Geocoding API
  let locationData = [];

  await axios
    .get(apiUrl, { params })
    .then((response) => {
      // console.log(response.data.results);
      // Check if the response is successful
      if (response.data.status === "OK") {
        // const result = response.data;

        let city_name = null;
        let country_name = null;
        let formated_address = null;
        let sublocality_level_1 = "";

        city_name = findCityNameBylocality(response.data.results);
        if (city_name) {
          //console.log("first");
          //console.log(`City: ${city_name}`);
        } else {
          //console.log("second");
          city_name = findCityNameByarealavel(response.data.results);
          //console.log(`City: ${city_name}`);
        }
        country_name = findCountry(response.data.results);
        formated_address = findFormateddAddress(response.data.results);
        sublocality_level_1 = findSubLocality1(response.data.results);

        // console.log(`country: ${country_name}`);
        // Now, you can use city_name and state_name as needed
        // console.log(`City: ${city_name}`);
        // console.log(`State: ${country_name}`);
        locationData["country"] = country_name;
        locationData["city"] = city_name;
        locationData["formatedaddress"] = formated_address;
        if (sublocality_level_1 == null) {
          locationData["sublocality_level_1"] = city_name + "," + country_name;
        } else {
          locationData["sublocality_level_1"] =
            sublocality_level_1 + "," + city_name + "," + country_name;
        }
      } else {
        console.error("Reverse Geocoding API request failed.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  // Helper function to extract the city name from the API response
  function findCityNameBylocality(results) {
    for (const result of results) {
      for (const component of result.address_components) {
        if (component.types.includes("locality")) {
          return component.long_name;
        }
      }
    }
    return null;
  }
  function findCityNameByarealavel(results) {
    for (const result of results) {
      for (const component of result.address_components) {
        if (component.types.includes("administrative_area_level_1")) {
          return component.long_name;
        }
      }
    }
    return null;
  }

  function findCountry(results) {
    for (const result of results) {
      for (const component of result.address_components) {
        if (component.types.includes("country")) {
          return component.long_name;
        }
      }
    }
    return null;
  }
  function findFormateddAddress(results) {
    for (const result of results) {
      return result.formatted_address;
    }
    return null;
  }

  function findSubLocality1(results) {
    for (const result of results) {
      for (const component of result.address_components) {
        if (component.types.includes("sublocality_level_1")) {
          return component.long_name;
        }
      }
    }
    return null;
  }

  return locationData;
};
