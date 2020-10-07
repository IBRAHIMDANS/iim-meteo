import React from "react";
import axios from "axios";
import {GeoJSON, Map, TileLayer} from "react-leaflet";
import Cities from "./cities";

type State = {
    select: any|null,
    lat: number,
    long: number,
    is_focus: boolean,
    loading: boolean,
    search: string,
    cities: any[]
}

type Props = {
    onUpdate?: (result: any[]) => any|Promise<any>;
    onSelect?: (result: any) => any|Promise<any>;
}

class WeatherMap extends React.Component<Props, State>{
    constructor(props: any) {
        super(props);

        // @ts-ignore
        this.cancel_search = null;

        this.state = {
            lat: 48.8589507,
            long: 2.2770205,
            select: null,
            loading: false,
            is_focus: false,
            search: "",
            cities: [],
        }
    }

    geoJSONStyle() {
        return {
            color: 'black',
            weight: 1,
            fillOpacity: 0.5,
            fillColor: 'red',
        }
    }

    renderSelection(){
        if (!this.state.select){
            return null;
        }

        return <GeoJSON id="geojson" style={this.geoJSONStyle} data={this.state.select.geojson}/>;
    }

    render() {
        const classnames: string[] = ["map-search"];

        if (this.state.is_focus || this.state.loading || this.state.cities.length > 0){
            classnames.push("active");
        }

        return (
            <div className={"app"}>
                <Map id="map" center={[this.state.lat,this.state.long]} zoom={5} className={"map"}>
                    <TileLayer url="https://tile.openstreetmap.bzh/br/{z}/{x}/{y}.png"/>
                    {this.renderSelection()}
                </Map>
                <div className={classnames.join(" ")}>
                    <form className={"search-container"}>
                        <input placeholder={"Rechercher une ville"} type={"search"} onBlur={() => this.blur()} onFocus={() => this.focus()} value={this.state.search} onChange={(evt) => this.updateSearch(evt)}/>
                    </form>
                    <Cities onSelect={(information) => this.select(information)} loading={this.state.loading} cities={this.state.cities}/>
                </div>
            </div>
        )
    }

    componentDidMount() {
        // @ts-ignore
       // this.map = L.map("map");
    }

    blur(){
        this.setState({
            is_focus: false
        });

        return this;
    }

    focus(){
        this.setState({
            is_focus: true
        });

        return this;
    }

    cancelSearch(){
        // @ts-ignore
        if (this.cancel_search !== null){
            // @ts-ignore
            this.cancel_search();

            // @ts-ignore
            this.cancel_search = null;
        }
    }

    async updateSearch(evt: React.ChangeEvent<HTMLInputElement>){
        const query: string = evt.target.value.trim().toLowerCase();

        if (query === this.state.search){
            return this;
        }

        this.cancelSearch();

        if (query.length <= 0){
            this.setState({
                search: query,
                loading: false,
                cities: []
            })
            return this;
        }

        this.setState({
            search: query,
            loading: true,
        })

        // @ts-ignore
        const result = await axios.get("https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&city="+encodeURI(evt.target.value), {
            cancelToken: new axios.CancelToken((cancel_search) => {
                // @ts-ignore
                this.cancel_search = cancel_search;
            })
        });

        const filter = result.data.filter((item: any) => (
            item.display_name.split(',').length > 1
        )).sort(function(a: any,b: any){
            return b.importance - a.importance;
        });

        this.setState({
            cities: filter,
            loading: false,
        })

        if (typeof this.props.onUpdate === "function"){
            this.props.onUpdate(filter);
        }

        // @ts-ignore
        this.cancel_search = null;

        return this;
    }

    select(information: any){
        console.log(information);
        this.setState({
            select: information,
            long: Number(information.lon),
            lat: Number(information.lat),
        })

        return this;
    }
}

export default WeatherMap;