import React from "react";
import axios from "axios";
import L from "leaflet";
import Cities from "./cities";

/*
<Map id="map" center={[this.state.lat,this.state.long]} zoom={5} className={"map"}>
    <TileLayer url="https://tile.openstreetmap.bzh/br/{z}/{x}/{y}.png"/>
    {this.renderSelection()}
</Map>
 */

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
    map: null|L.Map = null;
    cancel_search: null|(() => void) = null;
    geojson: null|L.GeoJSON = null;

    constructor(props: any) {
        super(props);

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

        return null;
        //return <GeoJSON id="geojson" style={this.geoJSONStyle} data={this.state.select.geojson}/>;
    }

    render() {
        const classnames: string[] = ["map-search"];

        if (this.state.is_focus || this.state.loading || this.state.cities.length > 0){
            classnames.push("active");
        }

        return (
            <div className={"app"}>
                <div id={"map"} className={"map"}></div>
                <div className={classnames.join(" ")}>
                    <form className={"search-container"}>
                        <input placeholder={"Rechercher une ville"} type={"search"} onBlur={() => this.blur()} onFocus={() => this.focus()} value={this.state.search} onChange={(evt) => this.updateSearch(evt)}/>
                    </form>
                    <Cities onSelect={(information) => this.select(information)} loading={this.state.loading} cities={this.state.cities}/>
                </div>
            </div>
        )
    }

    componentDidUpdate(props: Props, state: State) {
        if (this.state.long !== state.long || this.state.lat !== state.lat && this.map !== null){
            this.map!.setView([this.state.lat,this.state.long], 13);
        }
    }

    componentDidMount() {
        const map = L.map("map").setView([this.state.lat,this.state.long], 13);

        L.tileLayer('https://tile.openstreetmap.bzh/br/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // @ts-ignore
        this.map = map;
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
        const result = await axios.get("https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&q="+encodeURI(evt.target.value), {
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
        this.setState({
            select: information,
            long: Number(information.lon),
            lat: Number(information.lat),
        })

        if (this.geojson !== null){
            this.geojson.remove();
            this.geojson = null;
        }

        if (this.map !== null){
            this.geojson = new L.GeoJSON(information.geojson,{
                style: this.geoJSONStyle
            });

            this.geojson.addTo(this.map);

            const converted = information.boundingbox.map((i: any) => Number(i));

            const bounds = [
                [converted[0],converted[1]],
                [converted[2],converted[3]],
            ]

            //@ts-ignore
            this.map.fitBounds(bounds);
        }

        return this;
    }
}

export default WeatherMap;