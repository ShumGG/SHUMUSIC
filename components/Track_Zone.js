import React from "react";
import { StyleSheet, Dimensions, View, StatusBar, Image, AppState } from "react-native";
import TrackPlayer from  "react-native-track-player";
import TextTicker from "react-native-text-ticker"; 
import SliderTrack from "./Slider_Track";
import Lycrics from "../components/Lycrics";
import Player_Controls from "../components/Player_Controls";
import { Fetch_Last_Song, Fetch_Last_Song_Duration, Fetch_Options } from "../helpers/Fetch_options";
import AsyncStorage from "@react-native-community/async-storage";
import { AppContext } from "../context/AppProvider";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

class Track_Zone extends React.Component {
    
    state = {
        playing: "",
        tracks: "",
        current_track_id: "",
        current_track: "",
        cover: "",
        title: "",
        artist: "",
        first_id_song: "",
        last_id_song: "",
        next_song: false,
        repeat: false,
        repeat_song_id: "",
        queue: false, 
        last_song: "",
        last_song_duration: "",
        duration: "",
        appstate: AppState.currentState,
        show_icon: "",
    }
    
    track_changed = "";

    componentDidMount () {
        AppState.addEventListener("change", this.save_song_position);
        this.track_changed = TrackPlayer.addEventListener("playback-track-changed", this.get_actual_track);
        this.init();
    }

    static getDerivedStateFromProps(nextProps) {
        return {
            show_icon: nextProps.show_icon,
        };
    }

    componentWillUnmount() {
        this.track_changed.remove();
    }

    save_song_position = (nextAppState) => {
         if (this.state.appstate.match(/active/) && nextAppState === "active") {
            return;
        }else {
            this.save_position();
        }
    }

    init = async() => {
        try {
            let last_song = await Fetch_Last_Song();
            let last_song_duration = await Fetch_Last_Song_Duration();
            let {option} = await Fetch_Options();
            if (last_song === null) {
                let tracks = await TrackPlayer.getQueue();
                let current_track_id = await TrackPlayer.getCurrentTrack();
                let {title} = await TrackPlayer.getTrack(current_track_id);
                let {current_track, cover, artist} = await this.get_info_track(tracks, title);
                let first_id_song = tracks[0].id;
                let last_id_song = tracks[tracks.length - 1].id;
                await AsyncStorage.setItem("last_song", JSON.stringify(current_track));
                this.setState({
                    tracks: tracks,
                    current_track: current_track,
                    cover: cover,
                    artist: artist,
                    first_id_song: first_id_song,
                    last_id_song: last_id_song,
                    last_song: current_track,
                });
            }else {
                let tracks = await TrackPlayer.getQueue();
                let {current_track_id, current_track, cover, artist} = await this.get_info_track(tracks, last_song);
                if (current_track_id === "") {
                    let current_track = await TrackPlayer.getCurrentTrack();
                    let {cover, title, artist} = await TrackPlayer.getTrack(current_track);
                    await AsyncStorage.setItem("last_song", JSON.stringify(title));
                    this.setState({
                        tracks: tracks,
                        cover: cover,
                        current_track: title,
                        artist: artist,
                        repeat: (option === 2) ? true : false,
                        first_id_song: tracks[0].id,
                        last_id_song: tracks[tracks.length - 1].id,
                        repeat_song_id: current_track,
                        last_song: title, 
                    });
                }else {
                    let first_id_song = tracks[0].id;
                    let last_id_song = tracks[tracks.length - 1].id;
                    await TrackPlayer.skip(current_track_id);  
                    await TrackPlayer.seekTo(last_song_duration);
                    this.setState({
                        tracks: tracks,
                        current_track: current_track,
                        cover: cover,
                        artist: artist,
                        repeat: (option === 2) ? true : false,
                        first_id_song: first_id_song,
                        last_id_song: last_id_song,
                        repeat_song_id: current_track_id,
                        last_song: last_song,
                    });
                }
            }
        }catch(error) {
            alert(error);
        }
    }

    get_info_track = async (tracks_queue, last_song) => {
        let tracks = tracks_queue;
        let current_track_id = tracks.filter(function(tracks){return tracks.title === last_song}).map(function(tracks) {return tracks.id}).toString();
        let current_track = tracks.filter(function(tracks){return tracks.title === last_song}).map(function(tracks) {return tracks.title}).toString();
        let cover = tracks.filter(function(tracks){return tracks.title === last_song}).map(function(tracks) {return tracks.cover}).toString();
        let artist = tracks.filter(function(tracks){return tracks.title === last_song}).map(function(tracks) {return tracks.artist}).toString();    
        let info_track = {current_track_id, current_track, cover, artist};
        return info_track;
    }

    get_actual_track = async () => { //this function will run when track changes either automatically or pressing next
        try {

            let selected_song = await this.props?.get_selected_song();
            let status = await TrackPlayer.getState();
            let tracks = await TrackPlayer.getQueue();
            let current_song = await TrackPlayer.getCurrentTrack();
            if (status === 3|| status === 6 || status === 8) { //six (buffering) three (playing)
                if (this.state.repeat && !this.state.next_song && selected_song === "") { //if user want to repeat a track
                    console.log("holahola");
                    await TrackPlayer.pause();
                    await TrackPlayer.skip(this.state.repeat_song_id);
                    TrackPlayer.play();
                }else if (this.state.repeat && !this.state.next_song && selected_song != "") {
                    let {title} = await TrackPlayer.getTrack(current_song);
                    let {current_track_id, current_track, cover, artist} = await this.get_info_track(tracks, title);
                    await AsyncStorage.setItem("last_song", JSON.stringify(current_track));
                    await AsyncStorage.setItem("last_song_duration", JSON.stringify(0));
                    this.props?.selected_song("");
                    this.setState({
                        current_track_id: current_track_id, 
                        current_track: current_track, 
                        cover: cover, 
                        artist: artist,
                        repeat_song_id: current_song,
                        last_song_duration: 0,
                        next_song: false,
                    });
                }else {
                    let {title} = await TrackPlayer.getTrack(current_song);
                    let {current_track_id, current_track, cover, artist} = await this.get_info_track(tracks, title);
                    await AsyncStorage.setItem("last_song", JSON.stringify(current_track));
                    await AsyncStorage.setItem("last_song_duration", JSON.stringify(0));
                    this.props?.selected_song("");
                    this.setState({
                        current_track_id: current_track_id, 
                        current_track: current_track, 
                        cover: cover, 
                        artist: artist,
                        repeat_song_id: current_song,
                        last_song_duration: 0,
                        next_song: false,
                    });
                }
            }else {
                return;
            }
        }catch(error) {
            alert(error);
        }
    }

    update_next_song = () => {
        this.setState({next_song: true});
    }

    repeat_song = (repeat_song_id = "") => {
        this.setState((prevState) => ({repeat: !prevState.repeat, repeat_song_id: repeat_song_id}));
    }
    
    repeat_queue = () => {
        this.setState((prevState) => ({queue: !prevState.queue}));
    }

    save_position = async() => {
        let position = await TrackPlayer.getPosition();
        await AsyncStorage.setItem("last_song_duration", JSON.stringify(position));
    }
    
    render() {

        if (this.state.last_song === "") {
            return null;
        }else {
            const props = {
                tracks: this.props?.tracks,
                first_id_song: this.state.first_id_song,
                last_id_song: this.state.last_id_song,
                last_song_duration: this.state.last_song_duration,
                update_next_song: this.update_next_song.bind(this),
                repeat_song: this.repeat_song.bind(this),
                repeat_queue: this.repeat_queue.bind(this),
                playing: this.props?.playing,
                update_playing: this.props?.update_playing,
                notch: this.props?.notch,
           }
            return (
                <AppContext.Consumer>
                    {({action: {tracks_playlist, get_tracks_playlist, get_shuffle, set_shuffle, set_prev_screen, get_prev_screen,}}) => (
                    <View style = {{backgroundColor: "white", height: Dimensions.get("window").height - StatusBar.currentHeight - 95}}> 
                        <View style = {this.styles.contianer}>
                            <View style = {this.styles.cover_container}>
                                {
                                    (this.state.cover != "") ?
                                        <View>
                                            <Image source = {{uri: "file:///"+this.state?.cover}} style = {this.styles.cover}></Image>
                                            <Lycrics></Lycrics>
                                        </View>
                                    : 
                                        <View>
                                            <Image source = {require("../assets/default_image.jpg")} style = {this.styles.cover}></Image>
                                            <Lycrics></Lycrics>
                                        </View>
                                }
                                <View style = {this.styles.text_ticker}>
                                    <TextTicker
                                        style={{fontSize: RFValue(30, Dimensions.get("window").height), color: "black", textAlign: "center"}}
                                        loop
                                        repeatSpacer = {10}
                                        marqueeDelay = {500}
                                        bounceDelay = {1000}
                                        scrollSpeed = {250}>
                                        {this.state.current_track}
                                    </TextTicker>
                                    <TextTicker
                                        style={{fontSize: RFValue(20, Dimensions.get("window").height), color: "black", textAlign: "center"}}
                                        loop
                                        repeatSpacer = {10}
                                        marqueeDelay = {500}
                                        bounceDelay = {1000}
                                        scrollSpeed = {250}>
                                        {this.state.artist}
                                    </TextTicker>
                                </View>
                            </View>
                            <View style = {this.styles.controllers}>
                                <SliderTrack></SliderTrack>
                                <Player_Controls 
                                    tracks_playlist = {tracks_playlist} 
                                    get_tracks_playlist = {get_tracks_playlist} 
                                    get_shuffle = {get_shuffle} 
                                    set_shuffle = {set_shuffle} 
                                    set_prev_screen = {set_prev_screen}
                                    get_prev_screen = {get_prev_screen}
                                    {...props}>
                                </Player_Controls>
                            </View>
                        </View>
                    </View>
                    )}
                </AppContext.Consumer>
            )
        }
    }

    styles = StyleSheet.create({
        contianer: {
            flex: 1,
        },
        cover_container: {
            alignItems: "center", 
            paddingTop: 15
        },
        cover: {
            width: RFPercentage(40),
            height: RFPercentage(40),
            borderRadius: 200,
            alignSelf: "center",
        },
        text_ticker: {
            justifyContent: "center", 
            alignItems: "center", 
            alignSelf: "center", 
            paddingTop: 20
        },
        controllers: {
            flex: 1,
            justifyContent: "space-around",
        },
    });
}

export default Track_Zone;