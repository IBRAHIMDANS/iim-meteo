import React from "react";
import axios from "axios";
import Cities from "./cities";

type State = {
    is_focus: boolean,
    loading: boolean,
    search: string,
    cities: any[]
}

type Props = {
    onUpdate?: (result: any[]) => any|Promise<any>;
    onSelect?: (result: any) => any|Promise<any>;
}

class MapPanel extends React.Component<Props, State>{
    constructor(props: any) {
        super(props);

        // @ts-ignore
        this.cancel_search = null;

        this.state = {
            loading: false,
            is_focus: false,
            search: "",
            cities: [],
        }
    }

    render() {
        const classnames: string[] = ["map-search"];

        if (this.state.is_focus || this.state.loading || this.state.cities.length > 0){
            classnames.push("active");
        }

        return (
            <div className={classnames.join(" ")}>
                <form className={"search-container"}>
                    <input placeholder={"Rechercher une ville"} type={"search"} onBlur={() => this.blur()} onFocus={() => this.focus()} value={this.state.search} onChange={(evt) => this.updateSearch(evt)}/>
                </form>
                <Cities cities={this.state.cities}/>
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
        const result = await axios.get("https://nominatim.openstreetmap.org/search?format=json&city="+encodeURI(evt.target.value), {
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
}

export default MapPanel;