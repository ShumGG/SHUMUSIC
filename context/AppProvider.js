import React, { Component } from "react";
import { Fetch_Shuffle } from "../helpers/Fetch_options";

export const AppContext = React.createContext();

export class AppProvider extends Component {

    song = "";
    screen = "tracks";
    prev_screen = [];
    queue = "";
    shuffle = "";
    current_track = "";

    componentDidMount() {
        this.set_init_shuffle();
    }

    selected_song = (page) => {
        this.song = page;
    }

    get_selected_song = async() => {
        return this.song;
    }

    tracks_playlist = (page) => {
        this.screen = page;
    }

    get_tracks_playlist = async() => {
        return this.screen;
    }

    set_prev_screen = (page) => {
        this.prev_screen = page;
    }

    get_prev_screen = () => {
        return this.prev_screen;
    }

    set_init_shuffle = async() => {
        this.shuffle = await Fetch_Shuffle();
    }

    set_shuffle = (shuffle_option) => {
        this.shuffle = shuffle_option;
    }

    get_shuffle = () => {
        return this.shuffle;
    }

    render () {
        const select = {
            action: {
                selected_song: this.selected_song.bind(this),
                get_selected_song: this.get_selected_song.bind(this),
                tracks_playlist: this.tracks_playlist.bind(this),
                get_tracks_playlist: this.get_tracks_playlist.bind(this),
                set_prev_screen: this.set_prev_screen.bind(this),
                get_prev_screen: this.get_prev_screen.bind(this),
                set_shuffle: this.set_shuffle.bind(this),
                get_shuffle: this.get_shuffle.bind(this),
            }
        }
        return (
            <AppContext.Provider value = {select}>
                {this.props.children}
            </AppContext.Provider>
        )
    }
}