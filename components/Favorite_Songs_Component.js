import React from "react";
import Tracks from "./Tracks";

class Favorite_Songs_Components extends React.Component{
    render() {
        return(
            <Tracks route = "favorites" {...this.props}></Tracks>
        )
    }
}

export default Favorite_Songs_Components;