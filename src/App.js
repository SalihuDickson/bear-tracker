import React from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
  Data,
} from "@react-google-maps/api";

import { formatRelative } from "date-fns";
import "@reach/combobox/styles.css";
import mapStyles from "./mapStyles";
import axios from "axios";
import ListItem from "./ListItem";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
} from "@reach/combobox";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};
const center = {
  lat: 43.653225,
  lng: -79.383186,
};
const options = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true,
};

const cleanText = (text) => {
  const regex = / {2,}/g;
  const entryText = text.replaceAll(regex).trim();
  return entryText;
};

function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyC0GC-f0AZrGzmO1kvTp959t6Grx9zUYmo",
    libraries,
  });

  const panTo = React.useCallback((coordinates) => {
    if (!coordinates) return;

    mapRef.current.panTo({ lat: coordinates[1], lng: coordinates[0] });
    mapRef.current.setZoom(13);
  }, []);

  const [markers, setMarkers] = React.useState([]);
  const [selected, setSelected] = React.useState(null);

  const handleMapClick = React.useCallback(
    (e) =>
      setMarkers((state) => [
        ...state,
        {
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
          time: new Date(),
        },
      ]),
    []
  );

  const mapRef = React.useRef();
  const handleMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  if (loadError) return "Error loading maps";
  if (!isLoaded) return "Loading Maps";

  return (
    <div className="App">
      <h1>
        Bears{" "}
        <span role="img" aria-label="tent">
          ⛺
        </span>{" "}
      </h1>

      <Search panTo={panTo} />
      <Locate panTo={panTo} />

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={8}
        center={center}
        options={options}
        onClick={handleMapClick}
        onLoad={handleMapLoad}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.time.toISOString}
            position={{ lat: marker.lat, lng: marker.lng }}
            icon={{
              url: "./bear.svg",
              scaledSize: new window.google.maps.Size(30, 30),
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(15, 15),
            }}
            onClick={() => {
              setSelected(marker);
            }}
          />
        ))}
        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div>
              <h2>Bear Spotting!!</h2>
              <p>Spotted {formatRelative(selected.time, new Date())}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

const Locate = ({ panTo }) => {
  return (
    <button
      className="locate"
      onClick={() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            panTo([position.coords.longitude, position.coords.latitude]);
          },
          (err) => alert(err)
        );
      }}
    >
      <img src="compass.svg" alt="compass - locate me" />
    </button>
  );
};

const Search = ({ panTo }) => {
  const [value, setValue] = React.useState("");
  const [searchArr, setSearchArr] = React.useState([]);
  const [status, setStatus] = React.useState(0);
  const [selectedCoordinates, setSelectedCoordinates] = React.useState(0);

  React.useEffect(() => {
    if (!value) return;
    setTimeout(async () => {
      const text = cleanText(value);

      try {
        const url = `https://app.geocodeapi.io/api/v1/autocomplete?text=${text}&apikey=ff70b730-bcba-11ec-9f62-1f92c61543d2`;
        const encodedURL = encodeURI(url);

        const response = await axios.get(encodedURL);
        const { features } = response.data;

        setStatus(response.status);
        setSearchArr(features);
      } catch (err) {
        console.log(err);
      }
    }, 400);
  }, [value]);

  React.useEffect(() => {
    panTo(selectedCoordinates);
  }, [selectedCoordinates]);

  return (
    <div className="search">
      <Combobox>
        <ComboboxInput
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          placeholder="enter an address"
        />
        <ComboboxPopover>
          {status >= 200 &&
            status <= 399 &&
            searchArr[0] &&
            searchArr.map(({ geometry: { coordinates }, properties }) => (
              <ListItem
                coordinates={coordinates}
                properties={properties}
                setSelectedCoordinates={setSelectedCoordinates}
                setValue={setValue}
                setStatus={setStatus}
              />
            ))}
        </ComboboxPopover>
      </Combobox>
    </div>
  );
};

export default App;
