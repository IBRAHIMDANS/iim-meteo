import React from "react";
import axios from "axios";
import Cities from "./cities";
import {Map, TileLayer} from "react-leaflet";

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
            lat: 2.2770205,
            long: 48.8589507,
            select: null,
            loading: false,
            is_focus: false,
            search: "",
            cities: [],
        }
    }

    renderSelection(){
        if (!this.state.select){
            return null;
        }

        if (this.state.select.geojson.type === "Point"){

        }

        console.log(this.state.select);

        return null;
    }

    render() {
        const classnames: string[] = ["map-search"];

        if (this.state.is_focus || this.state.loading || this.state.cities.length > 0){
            classnames.push("active");
        }

        return (
            <div className={"app"}>
                <Map center={[this.state.long,this.state.lat]} zoom={19} className={"map"}>
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
        if (information.geojson.type === "Point"){
            this.setState({
                select: information,
                long: information.geojson.coordinates[0],
                lat: information.geojson.coordinates[1],
            })
        }

        return this;
    }
}

export default WeatherMap;