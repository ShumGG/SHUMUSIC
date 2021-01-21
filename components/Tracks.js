import React from "react";
import { Image, StyleSheet, Text, View, ImageBackground, Dimensions, Keyboard} from "react-native";
import { FlatList, TextInput } from "react-native-gesture-handler";
import { TouchableOpacity } from "react-native";
import TrackPlayer from "react-native-track-player";
import TextTicker from "react-native-text-ticker"; 
import { AppContext } from "../context/AppProvider";
import { MaterialIcons } from '@expo/vector-icons'; 
import { Feather } from '@expo/vector-icons'; 
import { RFValue } from "react-native-responsive-fontsize";
import { Fetch_Favorites } from "../helpers/Fetch_options";

class Tracks extends React.Component {

    state = {
        tracks: this.props?.tracks,
        route: this.props?.route,
        cover: this.props?.cover,
        original_queue: this.props?.original_queue,
        first_id_song: this.props?.tracks[0].id,
        search: false,
        favorites_songs: "",
    }   

    text_input = React.createRef();
    focused = "";
    focus_navigation = "";
    track_changed = "";
    artist_changed = false;
    keyboard = false;

    componentDidMount = () => {
        this.props?.navigation.addListener("focus", this.get_favorites);
        Keyboard.addListener("keyboardDidShow", this.showed_keyboard);
    }

    play_selected_music = async(item, selected_song, tracks_playlist, get_tracks_playlist, set_prev_screen, get_shuffle) => {
        if (this.state.route === "artist") {
            this.play_artist(item, selected_song, tracks_playlist);
        }else if (this.state.route === "tracks") {
            selected_song("tracks");
            this.change_queue_to_tracks(item, tracks_playlist, get_tracks_playlist, set_prev_screen, get_shuffle);
        }else if (this.state.route === "artist") {
            selected_song("play_list");
            this.change_queue_to_play_list(item, tracks_playlist, get_tracks_playlist, set_prev_screen, get_shuffle);
        }else {
            selected_song("favorites");
            this.change_queue_to_play_favorites(item, tracks_playlist, get_tracks_playlist, set_prev_screen, get_shuffle);
        }
    }

    get_time = (duration) => {
        let min = Math.floor(Number(duration)/60000);
        let seconds = Math.round(((Number(duration)/60000 % 1)) * 60).toString();
        (seconds >= 0 && seconds <= 9) ? seconds = "0" + seconds.toString() : null;
        let time = min + ":" + seconds;
        return time;
    }    
    
    play_artist = async(item, selected_song, tracks_playlist) => {
        tracks_playlist("artist");
        selected_song("artist");
        let tracks = await TrackPlayer.getQueue();
        if (tracks.filter((tracks) => tracks.id === item.id).length > 0 && !this.artist_changed) {
            this.artist_changed = true;
            let original_queue = [...this.state.original_queue];
            let artist_songs = [];
            original_queue.map((tracks) => {
                if (tracks.artist === item.artist) {
                    artist_songs.push({...tracks});
                }
            });
            await TrackPlayer.reset();
            await TrackPlayer.add(artist_songs);
            await TrackPlayer.skip(item.id);
            TrackPlayer.play();
            this.props?.update_pressed();
            this.props?.play_selected_music();
        }else if (tracks.filter((tracks) => tracks.id === item.id).length > 0 && this.artist_changed) {
            await TrackPlayer.skip(item.id);
            TrackPlayer.play();
            this.props?.update_pressed();
            this.props?.play_selected_music();
        }else {
            let original_queue = [...this.state.original_queue];
            let artist_songs = [];
            original_queue.map((tracks) => {
             if (tracks.artist === item.artist) {
                    artist_songs.push({...tracks});
                }
            });
            await TrackPlayer.reset();
            await TrackPlayer.add(artist_songs);
            await TrackPlayer.skip(item.id);
            TrackPlayer.play();
            this.props?.update_pressed();
            this.props?.play_selected_music();
        }
    }

    change_queue_to_tracks = async(item, tracks_playlist, get_tracks_playlist, set_prev_screen, get_shuffle) => {
        let screen = await get_tracks_playlist();
        let shuffle = get_shuffle();
         if (screen === "" || screen === "tracks") {
            tracks_playlist("tracks");
            this.props?.play_selected_music();
            await TrackPlayer.skip(item.id);
            TrackPlayer.play();
            this.props?.update_pressed();
            this.props?.play_selected_music();
        }else {
            if (shuffle) {
                let tracks_id = this.get_default_queue();
                set_prev_screen(tracks_id);
                let random_queue = this.create_random(item.id);
                tracks_playlist("tracks");
                await TrackPlayer.reset();
                await TrackPlayer.add(random_queue);
                await TrackPlayer.skip(item.id);
                TrackPlayer.play();
                this.props?.update_pressed();
                this.props?.play_selected_music();
            }else {
                let tracks_queue = [...this.state.tracks];
                tracks_playlist("tracks");
                await TrackPlayer.reset();
                await TrackPlayer.add(tracks_queue);
                this.props?.play_selected_music();
                await TrackPlayer.skip(item.id);
                TrackPlayer.play();
                this.props?.update_pressed();
                this.props?.play_selected_music();
            }
        }
    }

    change_queue_to_play_list = async(item, tracks_playlist, get_tracks_playlist, set_prev_screen, get_shuffle) => {
        let screen = await get_tracks_playlist();
        let shuffle = await get_shuffle();
        if (screen === "" || screen === "play_list") {
            tracks_playlist("play_list");
            await TrackPlayer.skip(item.id);
            TrackPlayer.play();
            this.props?.update_pressed();
            this.props?.play_selected_music();
        }else {
            if (shuffle) {
                let tracks_id = this.get_default_queue();
                set_prev_screen(tracks_id);
                let random_queue = this.create_random(item.id);
                tracks_playlist("play_list");
                await TrackPlayer.reset();
                await TrackPlayer.add(random_queue);
                await TrackPlayer.skip(item.id);
                TrackPlayer.play();
                this.props?.update_pressed();
                this.props?.play_selected_music();
            }else {
                let tracks_queue = [...this.state.tracks];
                tracks_playlist("play_list");
                await TrackPlayer.reset();
                await TrackPlayer.add(tracks_queue);
                await TrackPlayer.skip(item.id);
                TrackPlayer.play();
                this.props?.update_pressed();
                this.props?.play_selected_music();
            }
        }
    }

    change_queue_to_play_favorites = async(item, tracks_playlist, get_tracks_playlist, set_prev_screen, get_shuffle) => {
        let screen = await get_tracks_playlist();
        let shuffle = await get_shuffle();
        if (screen === "" || screen === "favorites") {
            tracks_playlist("favorites");
            await TrackPlayer.skip(item.id);
            TrackPlayer.play();
            this.props?.update_pressed();
            this.props?.play_selected_music();
        }else {
            if (shuffle) {
                let tracks_id = this.get_default_queue();
                set_prev_screen(tracks_id);
                let random_queue = this.create_random(item.id);
                tracks_playlist("favorites");
                await TrackPlayer.reset();
                await TrackPlayer.add(random_queue);
                await TrackPlayer.skip(item.id);
                TrackPlayer.play();
                this.props?.update_pressed();
                this.props?.play_selected_music();
            }else {
                let tracks_queue = [...this.state.tracks];
                tracks_playlist("favorites");
                await TrackPlayer.reset();
                await TrackPlayer.add(tracks_queue);
                await TrackPlayer.skip(item.id);
                TrackPlayer.play();
                this.props?.update_pressed();
                this.props?.play_selected_music();
            }
        }
    }

    create_random = (current_track) => {
        let tracks = [...this.state.tracks];
        let random_queue = tracks.slice().sort(() => {return Math.random() - 0.5});
        if (random_queue[0].id === current_track) {
            this.create_random();
        }else {
            return random_queue;
        }
    }

    get_default_queue = () => { //it returns only the ids in the same order to be used when shuffle is turn off
        let tracks = [...this.state.tracks];
        let tracks_id = tracks.map((tracks) => {
            return tracks.id;
        });
        return tracks_id;
    }

    search_song = () => {
        let search = this.state.search;
        if (search) {
                if (this.state.route === "favorites") {
                    let favorites_songs = this.state.favorites_songs;
                    this.setState((prevState) => ({tracks: favorites_songs, search: !prevState.search}));
                }else {
                    this.setState((prevState) => ({tracks: this.props?.tracks, search: !prevState.search}));
                }
        }else {
            this.setState((prevState) => ({search: !prevState.search}));
        }
    }

    search = (song) => {
        if (this.state.route === "favorites") {
            if (song === "") {
                let favorites_songs = this.state.favorites_songs;
                this.setState({tracks: favorites_songs});
            }else {
                const tracks = this.state.tracks;
                const songs = tracks.filter(tracks => tracks.title.toUpperCase().includes(song.toUpperCase()) || tracks.artist.toUpperCase().includes(song.toUpperCase()));
                if (songs.length === 0) {
                    return;
                }else {
                    this.setState({tracks: songs});
                }
            }
        }else {
            if (song === "") {
                this.setState({tracks: this.props?.tracks});
            }else {
                const tracks = this.state.tracks;
                const songs = tracks.filter(tracks => tracks.title.toUpperCase().includes(song.toUpperCase()) || tracks.artist.toUpperCase().includes(song.toUpperCase()));
                if (songs.length === 0) {
                    return;
                }else {
                    this.setState({tracks: songs});
                }
            }
        }
    }   

    showed_keyboard = () => {
        this.keyboard = true;
    }

    hide_keyboard = () => {
        if (this.keyboard) {
            Keyboard.dismiss();
            this.keyboard = false;
        }else {
            return;
        }
    }

    get_favorites = () => {
        if (this.state.route === "favorites") {
            this.get_favorites_songs();
        }else {
            return;
        }
    }

    get_favorites_songs = async() => {
        let tracks = [...this.props?.tracks];
        let favorites = await Fetch_Favorites();
        if (favorites === null) {
            return;
        }else {
            let favorites_songs = tracks.filter((tracks) => favorites.includes(tracks.title));
            this.setState({tracks: favorites_songs, favorites_songs: favorites_songs});
        }
    }

    render () {
        return (
            <AppContext.Consumer>
                {({action: {selected_song, tracks_playlist, get_tracks_playlist, set_prev_screen, get_shuffle}}) => (
                    <View style = {this.styles.container}>
                       <View style = {{flexDirection: "row-reverse", justifyContent: "center", alignItems: "center"}}>
                            {
                                (this.state.search) ? 
                                    <View style = {this.styles.search_container}>
                                        <TextInput autoFocus = {true} style = {this.styles.search_input}
                                        onChangeText = {song => this.search(song)}></TextInput>
                                        <Feather name="x" size={24} color="black" onPress = {this.search_song}/>
                                    
                                    </View>
                                : 
                                    <MaterialIcons name = "search" size = {24} color = "black" onPress =  {this.search_song}/>
                            }
                        </View>
                    {
                        (this.state.route === "artist") ? 
                        <View>
                            <ImageBackground source = {(this.state.cover != "") ? {uri:"file:///"+this.state.cover} : require("../assets/default_image.jpg")} style = {this.styles.image_background}>
                                <View style = {this.styles.image_background_text}>
                                    <TextTicker
                                        style={{color: "white", fontSize: 25, textAlign: "center"}}
                                        duration={3000}
                                        loop
                                        repeatSpacer = {10}
                                        marqueeDelay = {500}
                                        bounceDelay = {1000}
                                        scrollSpeed = {50}>
                                        {this.state.tracks[0].artist}
                                    </TextTicker>
                                </View>
                            </ImageBackground>
                        </View> : null
                    }
                    {
                        (this.state.route === "favorites" && this.state.favorites_songs.length <= 0) ? 
                            <Text style = {this.styles.no_favorites_text}>No favorites songs.</Text> 
                        :
                        <FlatList
                            data = {this.state.tracks}
                            onScrollBeginDrag = {this.hide_keyboard}
                            keyExtractor = {(item) => item.id.toString()}
                            renderItem = {({item}) => (
                            <TouchableOpacity onPress = {() => {
                                this.play_selected_music(item, selected_song, tracks_playlist, get_tracks_playlist, set_prev_screen, get_shuffle)}}>
                                <View style = {this.styles.tracks_container}>
                                    <View style = {this.styles.tracks_info_container}>
                                            <View style = {this.styles.cover_container}>
                                                {
                                                    (item?.cover) ? <Image source = {{uri:"file:///"+item.cover}} style={{ width: 100, height: 100}}></Image>
                                                    : <Image source = {require("../assets/default_image.jpg")} style={{ width: 100, height: 100}}></Image>
                                                }         
                                            </View>
                                        <View style = {this.styles.tracks}>
                                            <View style = {this.styles.title_container}>
                                                <Text style = {this.styles.title} numberOfLines = {1}>
                                                    {
                                                        item.title
                                                    }
                                                </Text>
                                            </View>
                                            <View style = {this.styles.artist_duration}>
                                                <Text style = {this.styles.artist}>
                                                    Artist: {(item.artist.length > 15) ? 
                                                    item.artist.substring(0,14).padEnd(16,".") 
                                                    : item.artist}
                                                </Text>
                                                <Text style = {this.styles.duration}>
                                                    Duration: {this.get_time(item.duration)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                        >
                    </FlatList>
                    }
                   
                </View>
                )}
            </AppContext.Consumer>
        )
    }

    styles = StyleSheet.create({
        container: {
            flex: 1, 
            backgroundColor: "white",
            paddingBottom: 95
        },
        search_container: {
            backgroundColor: "white", 
            justifyContent: "space-evenly", 
            flexDirection: "row", 
            alignItems: "center"
        },
        search_input: {
            height: 50,
            width: Dimensions.get("window").width * 0.80, 
            color: "black", 
            fontSize: 20
        },  
        image_background: {
            width: Dimensions.get("window").width,
            height: 100, 
            justifyContent: "center", 
        },
        cover_container: {
            paddingLeft: 10
        },
        image_background_text: {
            backgroundColor: "#000000a0", 
            width: Dimensions.get("window").width,
            justifyContent: "center", 
            alignItems: "center",
        },
        no_favorites_text: {
            textAlign: "center",
            justifyContent: "center",
            color: "black",
            fontSize: RFValue(25, Dimensions.get("screen").height),
        },
        tracks_container: {
            width: Math.round(Dimensions.get("window").width),
            flexDirection: "row", 
            marginTop: 10, 
            borderBottomWidth: 1, 
            paddingBottom: 10,
            borderBottomColor: "#5A5B58",
            justifyContent: "space-around",
        },
        tracks_info_container: {
            flexDirection: "row", 
            alignItems: "center",
            justifyContent: "space-around",
        },
        tracks: {
            flexDirection: "column", 
        },
        title_container: {
            width: Dimensions.get("window").width * 0.7, 
        },
        title: {
            color: "black", 
            fontSize: RFValue(20, Dimensions.get("screen").height),
            marginLeft: 10,
        }, 
        artist_duration: {
            flexDirection: "row",
            paddingTop: 5,
            width: Dimensions.get("window").width * 0.7,
            flexWrap: "wrap",
        },
        artist: {
            color: "black", 
            fontSize: RFValue(15, Dimensions.get("screen").height),
            marginLeft: 10,
        },
        duration: {
            color: "black", 
            fontSize: RFValue(15, Dimensions.get("screen").height),
            marginLeft: 10,
        },
    });
}

export default Tracks;