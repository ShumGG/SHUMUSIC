import React from "react";
import Artists_Songs_Grouped from "../components/Artists_Songs_Grouped";

class Artists_Screen extends React.Component {
    render() {
        return(
            <Artists_Songs_Grouped {...this.props}></Artists_Songs_Grouped>
        )
    }
}

export default Artists_Screen;