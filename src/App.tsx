import React from "react";
import "./app.css";
import { Map, TileLayer } from 'react-leaflet'
import { Weather } from "./components";
import MapPanel from "./components/map/panel";

function App() {
  return (
    <div className="app">
      <Map center={[48.8589507,2.2770205]} zoom={19} className={"map"}>
        <TileLayer url="https://tile.openstreetmap.bzh/br/{z}/{x}/{y}.png"/>
      </Map>
        <MapPanel/>
      <Weather />
    </div>
  );
}

export default App;
