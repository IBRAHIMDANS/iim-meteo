import React from "react";

type State = {

}

type Props = {
    cities: null|any[]
}

class Cities extends React.Component<Props, State>{
    constructor(props: any) {
        super(props);

        this.state = {

        }
    }

    render() {
        return (
            <ul className={"cities"}>
                {(this.props.cities || []).map(i => (
                    <li key={i.osm_id}><strong>{i.display_name.split(',')[0].trim()}</strong><span>{i.display_name.split(',')[1].trim()}</span></li>
                ))}
            </ul>
        )
    }
}

export default Cities;