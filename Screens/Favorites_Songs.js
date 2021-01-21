import React from "react";
import Favorite_Songs_Components from "../components/Favorite_Songs_Component";

class Favorites_Songs extends React.Component {
    render() {
        return(
            <Favorite_Songs_Components {...this.props}></Favorite_Songs_Components>
        )
    }
}

export default Favorites_Songs;