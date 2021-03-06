import React, { useState, useCallback, useRef } from 'react'
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from '@react-google-maps/api'
import { formatRelative } from 'date-fns'

import usePlacesAutoComplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from '@reach/combobox'
import '@reach/combobox/styles.css'

import mapStyles from './mapStyles'

const App = () => {

  const [markers, setMarkers] = useState([])
  const [selected, setSelected] = useState(null)

  const onMapClick = useCallback((event) => {
    setMarkers(current => [...current, {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
        time: new Date()
      },
    ])
  }, [])

  const mapRef = useRef()

  const onMapLoad = useCallback((map) => {
    mapRef.current = map
  }, [])

  const panTo = useCallback(({lat, lng}) => {
    mapRef.current.panTo({lat, lng})
    mapRef.current.setZoom(15)
  }, [])

  const libraries = ["places"]
  const mapContainerStyle = {
    width: '100vw',
    height: '100vh'
  }
  const center = { 
    lat: 42.519539,
    lng: -70.896713
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

  if (loadError) return "Error loading map"
  if(!isLoaded) return "Loading Map"

  return (
    <div>
      <h1> Sightings </h1>

      <Search 
        panTo={panTo}
      />
      <GetPosition 
        panTo={panTo}
      />
    
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={15}
          center={center}
          options={options}
          onClick={onMapClick}
          onLoad={onMapLoad}
        >
          {
            markers.map((marker) => 
              <Marker 
                key={marker.time.toISOString()} 
                position={{lat: marker.lat, lng: marker.lng}} 
                icon={{
                  url: '/bunny.svg',
                  scaledSize: new window.google.maps.Size(30,30),
                  origin: new window.google.maps.Point(0, 0),
                  anchor: new window.google.maps.Point(15, 15)
                }}
                onClick={() => {
                  setSelected(marker)
                }}
              />)
          }

          {selected ? (
          <InfoWindow position={{ lat: selected.lat, lng: selected.lng }} onCloseClick={() => setSelected(null)}>
            <div>
              <h2>Bunny Spotted!</h2>
              <p>Spotted { formatRelative(selected.time, new Date()) }</p>
            </div>
          </InfoWindow>) : null}
        </GoogleMap>
    </div>
  );
}

const GetPosition = ({ panTo }) => {
  return (
    <button className='position' onClick={() => {
      navigator.geolocation.getCurrentPosition((position) => {
        panTo({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      }, () => null );
    }}>
        <img style={{height: '50px', width: '200px'}} alt='compass' src='compass.svg'/>
    </button>
  )
}

const Search = ({ panTo }) => {
  const { 
      ready, 
      value, 
      suggestions: {status, data}, 
      setValue, 
      clearSuggestions
    } = usePlacesAutoComplete({
    requestOptions: {

      //TODO For now set to Salem, MA location, change to based on where the user is located
      location: { lat: () => 42.519539, lng: () => -70.896713 },
      radius: 200 * 1000,
    }
  })

  return (
    <div className='search'>
      <Combobox
        aria-labelledby="search"
        // receives a prop onSelect that will later receieve the address the user has selected 
        onSelect={ async (address) => {
          setValue(address, false)
          clearSuggestions()
          
          try {
            const results = await getGeocode({ address })
            const { lat, lng } = await getLatLng(results[0])
            panTo({ lat, lng })

          } catch {
            console.log('Error')
          }
        }}
      >
        <ComboboxInput 
          style={{width: '400px', height: '40px', fontSize: '18px'}}
          value={value} 
          onChange={(e) => {
            setValue(e.target.value)
          }}
          disabled={!ready}
          placeholder="Enter an address"
        />
        <ComboboxPopover>
          <ComboboxList>
            {status === "OK" && data.map(({id, description }) => ( 
              <ComboboxOption key={id} value={description}/> 
            ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  )
}

export default App;
