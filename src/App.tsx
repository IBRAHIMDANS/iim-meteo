import React from "react";
import "./app.css";
import { Map, TileLayer } from 'react-leaflet'
import { Weather } from "./components";
import MapPanel from "./components/map/map";

function App() {
  return (
    <div className="app">
        <MapPanel/>
      <Weather />
    </div>
  );
}

export default App;
