import React from "react";
import Play_List_Component from "../components/Play_List_Component";

class Play_List extends React.Component {
    render() {
        return(
            <Play_List_Component {...this.props}></Play_List_Component>
        )
    }
}

export default Play_List;