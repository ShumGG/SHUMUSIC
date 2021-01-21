import React from "react";
import Individual_Artist_Songs from "../components/Individual_Artist_Songs";

class Artist_Songs extends React.Component {
    render() {
        return(
            <Individual_Artist_Songs {...this.props}></Individual_Artist_Songs>
        )
    }
}

export default Artist_Songs;