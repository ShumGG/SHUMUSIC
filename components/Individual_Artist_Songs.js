import React from "react";
import Tracks from "./Tracks";

class Individual_Artist_Songs extends React.Component {

    render() {
        const {artists_songs, cover, original_queue} = this.props.route.params;
        const props = {
            route: "artist",
            update_pressed: this.props?.update_pressed,
            play_selected_music: this.props?.play_selected_music,
            tracks: artists_songs, 
            cover: cover, 
            original_queue: original_queue,
            navigation: this.props?.navigation,
        }
        return (
            <Tracks {...props}></Tracks>
        )
    }
}

export default Individual_Artist_Songs;