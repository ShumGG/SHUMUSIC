import React from "react";
import Tracks from "../components/Tracks";

class Tracks_List extends React.Component{
    render () {
        return (
            <Tracks route = {"tracks"} {...this.props}></Tracks>
        )
    }
}

export default Tracks_List;