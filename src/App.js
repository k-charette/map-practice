import React, { useState } from 'react'
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
  MarkerClusterer
} from '@react-google-maps/api'
import { formRelative } from 'date-fns'
import mapStyles from './mapStyles'

const App = () => {

  const [markers, setMarkers] = useState([])

  const libraries = ["places"]
  const mapContainerStyle = {
    width: '100vw',
    height: '100vh'
  }
  const center = { 
    lat: 35.689487,
    lng: 139.691711
  }

  const options = {
    styles: mapStyles,
    disableDefaultUI: true,
    zoomControl: true,
  }

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API,
    libraries
  })


  if (loadError) return "Error loading maps"
  if(!isLoaded) return "Loading Maps"
  return (
    <div>
      <h1> Sightings </h1>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={9}
          center={center}
          options={options}
          onClick={(event) => {
            setMarkers(current => [...current, {
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
              time: new Date()
            }])
          }
        }
        >

          {
            markers.map((marker) => 
              <Marker 
                key={marker.time.toISOString()} 
                position={{lat: marker.lat, lng: marker.lng}} 
              />)
          }
        </GoogleMap>
    </div>
  );
}

export default App;
