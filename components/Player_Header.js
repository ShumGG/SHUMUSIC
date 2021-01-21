import React from "react";
import { Image, View, StyleSheet, Text, SafeAreaView } from "react-native";
import { MaterialIcons } from '@expo/vector-icons'; 
import TextTicker from "react-native-text-ticker";
import TrackPlayer from "react-native-track-player";
import { TouchableHighlight } from "react-native";
import { Fetch_Last_Song } from "../helpers/Fetch_options";

class Player_Header extends React.Component{

    state = {
        tracks: "",
        cover: "",
        title: "",
        playing: "",
        show_icon: "",
        last_song: "",
    }

    track_changed = "";

    componentDidMount() {
        this.track_changed = TrackPlayer.addEventListener("playback-track-changed", this.get_actual_track);
        this.init();
    }

    componentWillUnmount() {
        this.track_changed.remove();
    }

    static getDerivedStateFromProps(nextProps) {
        return {
            playing: nextProps.playing,
            show_icon: nextProps.show_icon,
        };
    }

    init = async() => {
        try {
            let last_song = await Fetch_Last_Song();
            if (last_song === null) {
                let tracks = await TrackPlayer.getQueue();
                let current_track_id = await TrackPlayer.getCurrentTrack();
                let {title} = await TrackPlayer.getTrack(current_track_id);
                let {current_track, cover, artist} = await this.get_info_track(tracks, title);
                this.setState({
                    tracks: tracks,
                    cover: cover,
                    title: current_track,
                    artist: artist,
                    last_song: last_song
                });
            }else {
                let tracks = await TrackPlayer.getQueue();
                let {current_track_id, current_track, cover, artist} = await this.get_info_track(tracks, last_song);
                if (current_track_id === "") { //this is for when the user deletes a song that was the last listen
                    let current_track = await TrackPlayer.getCurrentTrack();
                    let {cover, title, artist} = await TrackPlayer.getTrack(current_track);
                    this.setState({
                        tracks: tracks,
                        cover: cover,
                        title: title,
                        artist: artist,
                        last_song: title, 
                    });
                }else { 
                    TrackPlayer.skip(current_track_id);
                    this.setState({
                        tracks: tracks,
                        cover: cover,
                        title: current_track,
                        artist: artist,
                        last_song: last_song
                    });
                }
            }
        }catch(error) {
            alert(error);
        }
    }
    
    get_info_track = async (tracks_queue, current_track_title) => {
        let tracks = tracks_queue;
        let current_track_id = tracks.filter(function(tracks){return tracks.title === current_track_title}).map(function(tracks) {return tracks.id}).toString();
        let current_track = tracks.filter(function(tracks){return tracks.title === current_track_title}).map(function(tracks) {return tracks.title}).toString();
        let cover = tracks.filter(function(tracks){return tracks.title === current_track_title}).map(function(tracks) {return tracks.cover}).toString();
        let artist = tracks.filter(function(tracks){return tracks.title === current_track_title}).map(function(tracks) {return tracks.artist}).toString();    
        let info_track = {current_track_id, current_track, cover, artist};
        return info_track;
    }

    get_actual_track = async () => { //this function will run when track changes either automatically or pressing next
        
        let status = await TrackPlayer.getState();
        if (status === 2) {
            return;
        }else {
            let tracks = await TrackPlayer.getQueue();
            let current_track_id = await TrackPlayer.getCurrentTrack();
            let {title} = await TrackPlayer.getTrack(current_track_id);
            let {current_track, cover, artist} = await this.get_info_track(tracks, title);
            this.setState({
                cover: cover, 
                title: current_track, 
                artist: artist,
            });
        }
    }

    play_music = () => {
        TrackPlayer.play();
        this.props?.update_playing();
    }

    pause = () => {
        TrackPlayer.pause();
        this.props.update_playing();
    } 

    render() {
        if (this.state.last_song === "") {
            return null;
        }else {
            return (
                <TouchableHighlight onPress = {() => this.props?.show_hide_icon()}>
                    <View style = {this.styles.container(this.state.show_icon)}>
                        <View style = {{marginLeft: 15}}>
                    {
                        (this.state.cover != "") ? <Image source = {{uri:"file:///"+this.state.cover}} style={{ width: 55, height: 55, borderRadius: 50}}></Image>
                        : <Image source = {require("../assets/default_image.jpg")} style={{ width: 55, height: 55, borderRadius: 50}}></Image>
                    }
                    </View>
                    <View style = {this.styles.track_container}>
                        {
                            (this.state.show_icon) ? 
                            <TextTicker
                                style ={{fontSize: 24, color: "black", textAlign: "center", justifyContent: "center"}}
                                loop
                                repeatSpacer = {10}
                                marqueeDelay = {500}
                                bounceDelay = {1000}
                                scrollSpeed = {250}>
                                {this.state.title}
                            </TextTicker>  : 
                            <Text style = {this.styles.title} numberOfLines = {1}>{this.state.title}</Text>
                        }
                    </View>
                    <View style = {{marginRight: 15}}>
                    {
                        (this.state.show_icon) ?
                            (!this.state.playing) ? 
                            <MaterialIcons name = "play-arrow" size = {50} color = "black" onPress = {this.play_music}/>
                            : <MaterialIcons name = "pause" size = {50} color = "black" onPress = {this.pause} />
                    : null}
                    </View>
                    </View>
                </TouchableHighlight>
            )
        }
    }

    styles = StyleSheet.create({
        container: () => ({
            flexDirection: "row",
            padding: 5, 
            alignItems: "center", 
            backgroundColor: "white", 
            height: 95,
            borderTopWidth: 1,
            borderTopColor: "black",
            elevation: 10,
        }), 
        track_container: {
            flex: 1, 
            padding: 20, 
            alignItems: "center"
        },
        title: {
            fontSize: 24,
            color: "black", 
            textAlign: "center", 
            justifyContent: "center"
        }
    });
}

export default Player_Header;