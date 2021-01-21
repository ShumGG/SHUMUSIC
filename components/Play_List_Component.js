import React from "react";
import Tracks from "./Tracks";

class Play_List_Component extends React.Component{

    state = {
        sorted_tracks: "",
    }

    componentDidMount() {
        this.sort_tracks();
    }

    sort_tracks = async() => {
        let tracks = [...this.props.tracks];
        let sorted = tracks.sort((a,b) => {
            return a.title.toUpperCase().localeCompare(b.title.toUpperCase());
        });
        this.setState({sorted_tracks: sorted});
    }

    render() {
        if (this.state.sorted_tracks === "") {
            return null;
        }else {
            const props = {
                route: "play_list", 
                tracks: this.state.sorted_tracks,
                update_pressed: this.props?.update_pressed,
                play_selected_music: this.props?.play_selected_music,
                navigation: this.props?.navigation,
            }
            return(
                <Tracks {...props}></Tracks>
            )
        }
    }

}

export default Play_List_Component;