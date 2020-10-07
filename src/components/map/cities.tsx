import React from "react";
type Props = {
    onSelect?: (result: any) => any|Promise<any>;
    loading: boolean,
    cities: null|any[]
}

class Cities extends React.Component<Props, any>{
    constructor(props: any) {
        super(props);

        this.state = {

        }
    }

    render() {
        const classnames = ["cities"];

        if (this.props.loading){
            classnames.push("loading");
        }

        return (
            <ul className={classnames.join(" ")}>
                {(this.props.cities || []).map(i => (
                    <li onClick={() => this.select(i)} key={i.osm_id}><strong>{i.display_name.split(',')[0].trim()}</strong><span>{i.display_name.split(',')[1].trim()}</span></li>
                ))}
            </ul>
        )
    }

    select(informations: any){
        if (typeof this.props.onSelect === "function"){
            this.props.onSelect(informations);
        }

        // TODO
        /*
            informations = {
                "place_id": 54183558,
                "licence": "Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright",
                "osm_type": "node",
                "osm_id": 4545578227,
                "boundingbox": ["48.871008", "48.911008", "2.2212078", "2.2612078"],
                "lat": "48.891008",
                "lon": "2.2412078",
                "display_name": "La Défense, Courbevoie, Nanterre, Hauts-de-Seine, Île-de-France, France métropolitaine, 92400, France",
                "class": "place",
                "type": "suburb",
                "importance": 0.5102976004383595,
                "icon": "https://nominatim.openstreetmap.org/images/mapicons/poi_place_village.p.20.png",
                "geojson": {
                    "type": "Point",
                    "coordinates": [2.2412078, 48.891008]
                }
            }
         */

        return this;
    }
}

export default Cities;