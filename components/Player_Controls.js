import React from "react";
import { View, StyleSheet, Text, Dimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import TrackPlayer from "react-native-track-player";
import { Fetch_Favorites, Fetch_Options, Fetch_Shuffle } from "../helpers/Fetch_options";
import AsyncStorage from "@react-native-community/async-storage";

class Player_Controls extends React.Component {

    constructor(props) {
        super(props);
    }
    
    state = {
        playing: "",
        random_tracks: "",
        tracks: this.props?.tracks,
        first_id_song: this.props?.first_id_song,
        last_id_song: this.props?.last_id_song,
        queue_length: this.props?.queue_length,
        next_id_song: "", //this song will be played next when the shuffle is neither off or on
        icon: 0,
        shuffle: "",
        favorite: false,
        queue: false, 
        selected_artist: false,
        screen: "",
        artist: "",
    } 
    
    track_changed = "";
    play_remote = "";
    pause_remote = "";
    next_remote = "";
    previous_remote = "";
    queue_ended = "";
    interruption_remote = "";
    
    componentDidMount() {
        this.track_changed = TrackPlayer.addEventListener("playback-track-changed", () => {this.get_favorite() ; this.queue_changed();});
        this.play_remote = TrackPlayer.addEventListener("remote-play", this.play_music);
        this.pause_remote = TrackPlayer.addEventListener("remote-pause", this.pause);
        this.next_remote = TrackPlayer.addEventListener("remote-next", this.next_song);
        this.previous_remote = TrackPlayer.addEventListener("remote-previous", this.previous_song);
        this.queue_ended = TrackPlayer.addEventListener("playback-queue-ended", this.get_queue_option);
        this.interruption_remote = TrackPlayer.addEventListener("remote-duck", this.pause);
        this.init();
    }

    init = async() => {
        let {option} = await Fetch_Options();
        let shuffle = await Fetch_Shuffle();
        let screen = await this.props?.get_tracks_playlist();
        this.get_favorite();
        this.get_queue_option();
        this.setState({icon: option, shuffle: shuffle, screen: screen});
    }

    componentWillUnmount() {
        this.track_changed.remove();
        this.play_remote.remove();
        this.pause_remote.remove();
        this.next_remote.remove();
        this.previous_remote.remove();
        this.queue_ended.remove();
        this.interruption_remote.remove();
    }


    static getDerivedStateFromProps(nextProps) {
        return {
            playing: nextProps.playing,
        };
    }

    get_queue_option = async() => {
        status = await TrackPlayer.getState(); //0 queue reached final dont do anything, 1 repeat queue, 2 repeat song
        if (status === 1) {
            if (this.state.icon === 1 && this.state.shuffle || this.state.icon === 0 && this.state.shuffle) {
                let current_track = await TrackPlayer.getCurrentTrack();
                this.change_queue(current_track);
            }else if (this.state.icon === 1 && !this.state.shuffle) {
                let tracks = await TrackPlayer.getQueue();
                TrackPlayer.skip(tracks[0].id);
            }else if (this.state.icon === 2 && !this.state.shuffle) {
                let current_track = await TrackPlayer.getCurrentTrack();
                await TrackPlayer.skip(current_track);
                TrackPlayer.play();
            }else {
                TrackPlayer.seekTo(0);
                await AsyncStorage.setItem("last_song_duration", JSON.stringify(0));
                this.pause();
            }
        }else {
            return;
        }
    }

    random_queue = (tracks, current_track) => {
        let queue = tracks;
        let random_tracks = queue.filter(tracks => tracks.id != current_track);
        let random_queue = random_tracks.slice().sort(() => {return Math.random() - 0.5});
        return random_queue;
    }
    
    remove_songs = (tracks, current_track) => {
        let queue = tracks;
        let remove_songs = queue.filter(function(queue){return queue.id != current_track}).map(function(queue) {return queue.id});
        return remove_songs; 
    }

    shuffle = async () => {
        let shuffle = !this.state.shuffle;
        this.props?.set_shuffle(shuffle);
        let current_track = await TrackPlayer.getCurrentTrack();
        this.setState((prevState) => ({shuffle: !prevState.shuffle}));
        this.change_queue(current_track);
        await AsyncStorage.setItem("shuffle", JSON.stringify(shuffle));
    }

    change_queue = async (current_track) => {
        if (this.state.shuffle) {
            let tracks = this.state.tracks;
            let random_tracks = await this.random_queue(tracks, current_track);
            let remove_songs = this.remove_songs(tracks, current_track);
            await TrackPlayer.remove(remove_songs);
            await TrackPlayer.add(random_tracks);
            this.setState({
                first_id_song: current_track,
                last_id_song: random_tracks[random_tracks.length - 1].id,
                change_queue: false,
            });
        }else {
            let tracks = this.state.tracks;
            let default_queue = this.get_default_queue(tracks, current_track);
            let remove_songs = this.remove_songs(tracks, current_track);
            await TrackPlayer.remove(remove_songs);
            await TrackPlayer.add(default_queue);
            this.setState({
                first_id_song: default_queue[0].id, 
                last_id_song: default_queue[default_queue.length - 1].id,
                next_id_song: current_track,
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

    next_song = async () => {
        
        let status = await TrackPlayer.getState();
        
        if (status === TrackPlayer.STATE_PAUSED) {
            await TrackPlayer.skipToNext();
            this.play_music();
        }else {
            let current_track = await TrackPlayer.getCurrentTrack();
            let last_id_song = this.state.last_id_song;
            if (this.state.shuffle) { 
                if (current_track === last_id_song) {
                    this.reset_random(current_track);
                }else {
                    this.props?.update_next_song();
                    TrackPlayer.skipToNext();
                }
            }else {
                if (current_track === last_id_song) {
                    this.reset_player();
                }else {
                    this.props?.update_next_song();
                    TrackPlayer.skipToNext();
                }
            }
        }
    }
    
    reset_random = async (current_track) => {
        try {
            let tracks = this.state.tracks;
            let random_queue = tracks.slice().sort(() => {return Math.random() - 0.5});
            if (random_queue[0].id === current_track) {
                this.reset_random();
            }else {
                this.props?.update_next_song();
                await TrackPlayer.reset();
                await TrackPlayer.add(random_queue);
                TrackPlayer.play();
                this.setState({
                    random_tracks: random_queue, 
                    first_id_song: random_queue[0].id, 
                    last_id_song: random_queue[random_queue.length - 1].id
                });
            }
        }catch(error) {
            alert(error);
        }
    }

    reset_player = async () => {
        try {
            let tracks = [...this.state.tracks];
            await TrackPlayer.reset();
            TrackPlayer.add(tracks);
            TrackPlayer.play();
            this.setState({first_id_song: tracks[0].id, last_id_song: tracks[tracks.length - 1].id});
        }catch (error) {
            alert(error);
        }
    }

    previous_song = async() => {
          
        let status = await TrackPlayer.getState();

        if (status === TrackPlayer.STATE_PAUSED) {
            await TrackPlayer.skipToPrevious();
            this.play_music();
        }else {
            let current_track = await TrackPlayer.getCurrentTrack();
            let current_queue = await TrackPlayer.getQueue();
            let first_id_song = this.state.first_id_song;
            
            if (this.state.shuffle) {
                if (current_track === first_id_song) {
                    TrackPlayer.skip(first_id_song);
                }else {
                    let seconds = await TrackPlayer.getPosition();
                    (Math.floor(seconds) > 3) ? TrackPlayer.seekTo(0) : this.return_song();
                }
            }else {
                if (current_track === first_id_song) {
                    TrackPlayer.skip(current_queue[current_queue.length - 1].id);
                }else {
                    let seconds = await TrackPlayer.getPosition();
                    (Math.floor(seconds) > 3) ? TrackPlayer.seekTo(0) : this.return_song();
                }
            }
        }
    }   

    return_song = async() => {
        let seconds = await TrackPlayer.getPosition();
        if (Math.floor(seconds <= 3)) {
            this.props?.update_next_song();
            TrackPlayer.skipToPrevious();
        }else {
            return;
        }
    }

    get_default_queue = (tracks, current_track) => { 
        let tracks_ = tracks;
        let current_track_position = tracks_.findIndex(tracks_ => tracks_.id === current_track);
        let new_queue;
        if (current_track_position === tracks.length - 1) {
            new_queue = tracks.filter(tracks => tracks.id != current_track);
        }else {
            new_queue = tracks.filter(tracks => tracks.id != current_track);
            let next_id_song = tracks[current_track_position + 1].id;
            while (new_queue[0].id != next_id_song) {
                new_queue.push(new_queue.shift());
            }
        }
        return new_queue;
    }

    repeat = async (icon) => {
        if (icon === 0) {
            this.props.repeat_queue();
            this.props.repeat_song();
            let options = {option: 0, repeat_song_id: ""};
            await AsyncStorage.setItem("options", JSON.stringify(options));    
            this.setState({icon: icon});
        }else {
            this.props.repeat_queue();
            let options = {option: 1, repeat_song_id: ""}
            await AsyncStorage.setItem("options", JSON.stringify(options));
            this.setState({icon: icon});
        }
    }
    
    repeat_track = async () => {
        let current_track = await TrackPlayer.getCurrentTrack();
        this.props.repeat_song(current_track);
        let options = {option: 2, repeat_song_id: current_track}
        await AsyncStorage.setItem("options", JSON.stringify(options));
        this.setState({icon: 2});
    }

    get_favorite = async() => {
        let favorites = await Fetch_Favorites();
        let current_track_id = await TrackPlayer.getCurrentTrack();
        let {title} = await TrackPlayer.getTrack(current_track_id);
        if (favorites === null) {
            return;
        }else {
            let favorite_song = favorites.filter(tracks => tracks === title);
            if (favorite_song.length > 0) {
                this.setState({favorite: true});
            }else {
                this.setState({favorite: false});
            }
        }
    }
    
    save_favorite = async() => {
        let favorites = await Fetch_Favorites();
        let current_track_id = await TrackPlayer.getCurrentTrack();
        let {title} = await TrackPlayer.getTrack(current_track_id);
        if (favorites === null) {
            let favorites_array = [];
            favorites_array.push(title);
            await AsyncStorage.setItem("favorites", JSON.stringify(favorites_array));
            this.setState((prevState) => ({favorite: !prevState.favorite}));
        }else {
            favorites.push(title);
            await AsyncStorage.setItem("favorites", JSON.stringify(favorites));
            this.setState((prevState) => ({favorite: !prevState.favorite}));
        }
    }

    delete_favorite = async() => {
        let favorites = await Fetch_Favorites();
        let current_track_id = await TrackPlayer.getCurrentTrack();
        let {title} = await TrackPlayer.getTrack(current_track_id);
        let favorite_song = favorites.findIndex(tracks => tracks === title);
        favorites.splice(favorite_song, 1);
        await AsyncStorage.setItem("favorites", JSON.stringify(favorites));
        this.setState((prevState) => ({favorite: !prevState.favorite}));
    }

    queue_changed = async() => { //this method is used to know if the user is playing an artist's songs or the queue's songs (tracks - playlist)
        let screen = this.state.screen;
        let artist = this.state.artist;
        let actual_screen = await this.props?.get_tracks_playlist();
        let current_queue = await TrackPlayer.getQueue();
        if (actual_screen === "artist") {
            if (artist === current_queue[0].artist) {
                return;
            }else {
                this.update_queue(current_queue, "artist");
            }
        }else {
            if (screen === actual_screen) {
                return;
            }else {
                if (actual_screen === "play_list") {
                    this.update_queue(current_queue, "play_list");
                }else if (actual_screen === "tracks") {
                    this.update_queue(current_queue, "tracks");
                }else if (actual_screen === "favorites") {
                    this.update_queue(current_queue, "favorites");
                }else {
                    return;
                }
            }
        }
    }

    update_queue = async(queue, screen) => {
        if (this.state.shuffle) {
            let prev_screen = await this.props?.get_prev_screen();
            let current_queue = queue;
            let original_queue = prev_screen;
            let original = this.sort_queue(current_queue, original_queue);
            let actual_screen = screen;
            this.setState({screen: actual_screen, tracks: original, first_id_song: current_queue[0].id, last_id_song: current_queue[current_queue.length - 1].id, artist: current_queue[0].artist});
        }else {
            let current_queue = queue;
            let actual_screen = screen;
            let first_id_song = current_queue[0].id;
            let last_id_song = current_queue[current_queue.length - 1].id;
            this.setState({screen: actual_screen, tracks: current_queue, first_id_song: first_id_song, last_id_song: last_id_song, artist: ""});
        }
    }
    
    sort_queue = (queue, prev_screen) => {
        let current_queue = queue;
        let original_queue = prev_screen;
        let order = new Map(); //create a map
        let sorted;
        original_queue.forEach((id, index) => order.set(id, index)); //for each id in its index insert in order the id and the index of this one
        sorted = current_queue.slice().sort((a, b) => order.get(a.id) - order.get(b.id)); //then using slice for a copy of sorted array, sort takes two parameter to compare 
        return sorted;
    }

    render() {
      
        const ordered_repeat = [
            {key: 0, icon: <MaterialIcons name = "repeat" size = {30} color = "black" onPress = {() => this.repeat(1)}/>},
            {key: 1, icon: <MaterialIcons name = "repeat" size = {30} color = "#1E90FF" onPress = {this.repeat_track}/>},
            {key: 2, icon: <MaterialIcons name = "repeat-one" size = {30} color = "#1E90FF" onPress = {() => this.repeat(0)}/>}
        ];
          
        return (
            <>
                <View style = {this.styles.icons_container}>
                    {
                    ordered_repeat.map((icon, id) => {
                        if (icon.key === this.state.icon) {
                        return (
                            <View key = {id}>{icon.icon}</View>
                        );
                        }
                    })
                    }
                    <Text style = {{textAlign: "center"}}>
                        {
                            (this.state.favorite) ? 
                            <MaterialIcons name = "favorite" size = {30} color = "red" onPress = {this.delete_favorite}/>
                            : 
                            <MaterialIcons name = "favorite" size = {30} color = "gray" onPress = {this.save_favorite}/>
                        }
                    </Text>
                    {
                        (this.state.shuffle) ? <MaterialIcons name = "shuffle" size = {30} color = "#1E90FF" onPress = {this.shuffle}/>
                        : <MaterialIcons name = "shuffle" size = {30} color = "black" onPress = {this.shuffle}/>
                    }
                </View>
                <View style = {this.styles.controllers}>
                    <MaterialIcons name = "skip-previous" size = {50} color = "black" onPress = {this.previous_song}/>
                    {
                        (!this.state.playing) ? 
                        <MaterialIcons name = "play-arrow" size = {80} color = "black" onPress = {this.play_music}/>
                        : <MaterialIcons name = "pause" size = {80} color = "black" onPress = {this.pause}/>
                    }
                    <MaterialIcons name = "skip-next" size = {50} color = "black" onPress = {this.next_song}/>
                </View>
            </>
        )
    }

    styles = StyleSheet.create({
        controllers: {
            flexDirection: "row",
            justifyContent: "center",
            justifyContent: "space-around",
            alignItems: "center",
            marginTop: 20,
            marginVertical: (this.props?.notch) ? - Dimensions.get("window").height * 0.045 : null,
        },
        icons_container: {
            flexDirection: "row", 
            justifyContent: "space-around",
            alignItems: "center",
            paddingLeft: 10,
            paddingRight: 10,
            marginTop: 5,
        },
    });

}

export default Player_Controls;
