import React, { Component } from "react";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { PermissionsAndroid } from "react-native";
import MusicFiles from "react-native-get-music-files-v3dev-test";
import Tracks_info from "../model/Tracks_info";
import Tracks_List from "../Screens/Tracks_List"; 
import Play_List from "../Screens/Play_List";
import Favorite_Songs from "../Screens/Favorites_Songs";
import Player_Header from "../components/Player_Header";
import TrackPlayer from "react-native-track-player";
import BottomSheet from "reanimated-bottom-sheet";
import Track_Zone from "../components/Track_Zone";
import { NavigationContainer } from "@react-navigation/native";
import { Dimensions, StatusBar } from "react-native";
import { Fetch_Shuffle } from "../helpers/Fetch_options";
import Stack_Navigator from "./Stack_Navigator";
import { MaterialIcons } from '@expo/vector-icons'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons'; 
import { AppContext } from "../context/AppProvider";
import { RFValue } from "react-native-responsive-fontsize";
import No_music from "../Screens/No_music";

export const Tab = createMaterialTopTabNavigator();

export class MainStack extends Component {

    state = {
        tracks: "",
        random_tracks: "",
        playing: false,
        show_icon: true,
        init: false,
        shuffle: false,
        no_music: false,
        pressed: false,
        device_height: "",
        notch: false,
    }
    
    sheetref = React.createRef(null);
    random = true;
    track_changed = "";
    navigation = "";

    componentDidMount() {
        this.track_changed = TrackPlayer.addEventListener("playback-track-changed", this.play_selected_music);
        this.requestPermission();
        this.get_notch();
    }

    componentWillUnmount() {
        this.track_changed.remove();
    }

    requestPermission = async () => {
        try {
            const permission = await PermissionsAndroid.requestMultiple(
                [
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                ],
            );
            if (permission["android.permission.READ_EXTERNAL_STORAGE"] === PermissionsAndroid.RESULTS.GRANTED 
                && permission["android.permission.WRITE_EXTERNAL_STORAGE"] === PermissionsAndroid.RESULTS.GRANTED) {
                try {
                    let tracks = [];
                    let tracks_object = []; 
                    tracks = await MusicFiles.getAll({
                        cover: true,
                        genre: true,
                    });
                    let length = tracks.length;
                    for (let i = 0 ; i < length ; i++) {
                        tracks_object.push(new Tracks_info(tracks.results[i]));
                    }
                    this.setState({tracks: tracks_object}, () => this.init_player());
                }catch(error) {
                    if (error.toString().includes("404")) { //404 null, no tracks in the queue
                        this.setState({no_music: true});
                    }else {
                        this.requestPermission();
                    }
                }
            }else {
                this.requestPermission();
            }
        }catch (error) {
            alert(error);
        }
    };

    init_player = async() => {
        try {
            let shuffle = await Fetch_Shuffle();
            if (shuffle) {
                let tracks = this.random_queue();
                await TrackPlayer.setupPlayer();
                TrackPlayer.updateOptions({
                    stopWithApp: true,
                    alwaysPauseOnInterruption: true,
                    capabilities: [
                        TrackPlayer.CAPABILITY_PLAY,
                        TrackPlayer.CAPABILITY_PAUSE,
                        TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
                        TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
                    ],
                    compactCapabilities: [
                        TrackPlayer.CAPABILITY_PLAY,
                        TrackPlayer.CAPABILITY_PAUSE,
                        TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
                        TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
                    ]
                })
                TrackPlayer.add(tracks);
                this.setState({random_tracks: tracks, init: true, no_music: false});
            }else {
                let tracks = this.state.tracks;
                await TrackPlayer.setupPlayer();
                TrackPlayer.updateOptions({
                    stopWithApp: true,
                    alwaysPauseOnInterruption: true, 
                    capabilities: [
                        TrackPlayer.CAPABILITY_PLAY,
                        TrackPlayer.CAPABILITY_PAUSE,
                        TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
                        TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
                    ],
                    compactCapabilities: [
                        TrackPlayer.CAPABILITY_PLAY,
                        TrackPlayer.CAPABILITY_PAUSE,
                        TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
                        TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
                    ]
                })
                TrackPlayer.add(tracks);
                this.setState({init: true, no_music: false});
            }
        }catch(error) {
            this.init_player();
        }
    }

    random_queue = () => {
        let tracks = [...this.state.tracks];
        let random_queue = tracks.slice().sort(() => {return Math.random() - 0.5});
        if (random_queue[0].id === tracks[0].id) {
            this.random_queue();
        }else {
            return random_queue;
        }
    }

    play_selected_music = async () => {
        let status = await TrackPlayer.getState();
        if (status === 2 || status === 8 || status === 1) {
            return;
        }else {
            if (this.state.pressed && this.state.show_icon) {
                this.setState((prevState) => ({playing: !prevState.playing, pressed: false}));
                setTimeout(() => {
                    this.setState({playing: true});
                }, 100)
            }else {
                return;
            }
        }
    }

    update_playing = () => {
        this.setState((prevState) => ({playing: !prevState.playing}));
    }

    update_pressed = () => {
        this.setState({pressed: true});
    }

    show_icon = () => {
        this.setState({show_icon: true});
    }
    
    hide_icon = () => {
        this.setState({show_icon: false});
    }

    show_hide_icon = () => {
        if (this.state.show_icon) {
            this.sheetref.snapTo(0);
        }else {
            this.sheetref.snapTo(1);
        }
    }

    get_notch = () => {

        let screen_height = Dimensions.get("screen").height; //total screen without nav bar 
        let screen_height_with_nav_bar = Dimensions.get("window").height; // total screen minus the nav bar
        let total_screen = screen_height - screen_height_with_nav_bar;
        let nav_bar = screen_height - screen_height_with_nav_bar; // height of the nav bar
                                                    // 47 looks the default height to validate if it has notch
        if (Math.floor(total_screen) > 47) { //if it isnt zero, the device has nav bar, but still dont know if it has notch
            let margin_Top = Math.round(Dimensions.get("window").height) - StatusBar.currentHeight; // the top where the bottomsheet will reach
            let lack_of_height = screen_height - nav_bar - margin_Top; // entire screen minus the top
            if (Math.floor(lack_of_height) <= 24) { //if its 24 or minus, it only has nav bar
                this.setState({device_height: margin_Top});
            }else {
                margin_Top += Math.floor(StatusBar.currentHeight); //otherwise it has notch, add remaining height to reach until the notch
                this.setState({device_height: margin_Top, notch: true});
            }
        }else {
            let margin_Top = Dimensions.get("window").height - StatusBar.currentHeight; // fully screen
            this.setState({device_height: margin_Top});
        }
    }

    render() {
        if (!this.state.init && !this.state.no_music) {
            return null;
        }else {
            const props = {
                tracks: this.state.tracks,
                playing: this.state.playing,
                show_icon: this.state.show_icon,
                play_selected_music: this.play_selected_music.bind(this),
                update_playing: this.update_playing.bind(this),
                update_pressed: this.update_pressed.bind(this),
                show_hide_icon: this.show_hide_icon.bind(this),
                notch: this.state.notch,
            }
            return(
                <>
                {
                    (this.state.no_music) ? <No_music requestPermission = {this.requestPermission.bind(this)}></No_music> 
                    :
                    <AppContext.Consumer>
                        {({action:{selected_song, get_selected_song}}) => (
                        <NavigationContainer>
                            <Tab.Navigator 
                                tabBarOptions = {{
                                    showIcon: true, 
                                    activeTintColor: "black", 
                                    inactiveTintColor: "white",
                                    style: {backgroundColor: "white", borderBottomColor: "black", borderBottomWidth: 1}, 
                                    iconStyle: {
                                        width: 35,
                                        height: 35,
                                    },
                                    pressColor: "#1E90FF", 
                                    labelStyle: {
                                        fontSize: RFValue(15, Math.floor(Dimensions.get("window").height)),
                                        includeFontPadding: true,
                                        width: Math.floor(Dimensions.get("window").width),
                                    }
                                }} 
                                screenOptions = {({route}) => ({
                                    tabBarIcon: ({focused}) => {
                                        let activeTintColor = "#1E90FF";
                                        let inactiveTintColor = "black";
                                        let size = 35;
                                        if (route.name === "Tracks") {
                                            if (focused) {
                                                return <FontAwesome name = "music" size = {size} color = {activeTintColor}/>
                                            }else {
                                                return <FontAwesome name = "music" size = {size} color = {inactiveTintColor}/>
                                            }
                                        }else if (route.name === "PlayList") {
                                            if (focused) {
                                                return <MaterialIcons name = "playlist-play" size = {size} color = {activeTintColor}/>
                                            }else {
                                                return <MaterialIcons name = "playlist-play" size = {size} color = {inactiveTintColor}/>
                                            }   
                                        }else if (route.name === "Artists") {
                                            if (focused) {
                                                return <MaterialCommunityIcons name = "artist" size = {size} color = {activeTintColor}/>
                                            }else {
                                                return <MaterialCommunityIcons name = "artist" size = {size} color = {inactiveTintColor}/>
                                            }   
                                        }else if (route.name === "Favorites") {
                                            if (focused) {
                                                return <MaterialIcons name = "favorite" size = {size} color = {activeTintColor}/>
                                            }else {
                                                return <MaterialIcons name = "favorite" size = {size} color = {inactiveTintColor}/>
                                            } 
                                        }
                                    }, 
                                })}>
                                <Tab.Screen name = "Tracks" children = {({navigation}) => <Tracks_List navigation = {navigation} {...props}></Tracks_List>}></Tab.Screen>
                                <Tab.Screen name = "PlayList" children = {({navigation}) => <Play_List navigation = {navigation} {...props}></Play_List>}></Tab.Screen>
                                <Tab.Screen name = "Artists" children = {() => <Stack_Navigator {...props}></Stack_Navigator>}></Tab.Screen>
                                <Tab.Screen name = "Favorites" children = {({navigation}) => <Favorite_Songs navigation = {navigation} {...props}></Favorite_Songs>}></Tab.Screen>
                            </Tab.Navigator>
                            <BottomSheet
                                ref = {ref => (this.sheetref = ref)}
                                initialSnap = {1}
                                snapPoints = {[this.state.device_height, 95]}
                                renderHeader = {() => <Player_Header {...props}></Player_Header>}
                                renderContent = {() => <Track_Zone selected_song = {selected_song} get_selected_song = {get_selected_song} {...props}></Track_Zone>
                                }
                                enabledContentGestureInteraction = {false}
                                onOpenEnd = {this.hide_icon}
                                onCloseEnd = {this.show_icon}>
                            </BottomSheet>
                        </NavigationContainer>
                        )}
                    </AppContext.Consumer>
                }
                </>
            );
        }
    }
}

export default MainStack;
