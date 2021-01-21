import React from "react";
import { Dimensions, Text, View, Image, Keyboard } from "react-native";
import { ScrollView, TextInput, TouchableOpacity } from "react-native-gesture-handler";
import { MaterialIcons } from '@expo/vector-icons'; 
import { Feather } from '@expo/vector-icons'; 
import { RFPercentage } from "react-native-responsive-fontsize";

class Artists_Songs_Grouped extends React.Component {

    state = {
        grouped: "",
        cover: "",
        search: false,
        
    }

    keyboard = false;

    componentDidMount() {
        Keyboard.addListener("keyboardDidShow", this.showed_keyboard);
        this.groupBy();
    }

    groupBy = () => {
        
        let tracks = [...this.props.tracks];
        let sorted = tracks.sort((a,b) => {
            return a.artist.replace(/[^a-zA-Z ]/, "").toUpperCase().localeCompare(b.artist.replace(/[^a-zA-Z ]/, "").toUpperCase());
        });
        let grouped = sorted.reduce((acumulator, value) => {
            if (!acumulator[value.artist]) {
                acumulator[value.artist] = [];
            }
            acumulator[value.artist].push(value);
            return acumulator;
        },{});
        let entries = Object.entries(grouped);
        this.artist_cover(entries, sorted);
    }

    artist_cover = (entries, tracks) => {
        let cover = tracks.reduce((acumulator, value) => {
            if (!acumulator[value.artist]) {
                acumulator[value.artist] = [];
            }
            if (acumulator[value.artist].find(tracks => tracks.length > 0)) {
                return acumulator;
            }else if (value.cover === "") {
                return acumulator;
            }else{
                acumulator[value.artist].push(value.cover);
            }
            return acumulator;
        },{});
        let cover_entries = Object.entries(cover);
        this.setState({grouped: entries, cover: cover_entries});
    }

    artists_songs = (songs) => {
        let cover = this.get_cover(songs);
        this.props?.navigation.navigate("Artists_Songs", {artists_songs: songs, cover: cover, original_queue: this.props?.tracks});
    }

    get_cover = (songs) => {
        let {cover} = songs.find(tracks => tracks.cover != "" || tracks.cover === "");
        return cover;
    }

    search_artist = () => {
        let search = this.state.search;
        if (search) {
            this.groupBy();
            this.setState((prevState) => ({search: !prevState.search}));
        }else {
            this.setState((prevState) => ({search: !prevState.search}));
        }
    }

    search = (song) => {
        if (song === "") {
            this.groupBy();
        }else {
            const tracks = this.state.grouped;
            const songs = tracks.filter(tracks => tracks[0].toUpperCase().includes(song.toUpperCase()));
            if (songs.length === 0) {
                return;
            }else {
                this.setState({grouped: songs});
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

    render() {
        if (this.state.grouped === "") {
            return null;
        }else {
            return(
                <>
                <View style = {{backgroundColor: "white", flexDirection: "row-reverse", justifyContent: "center", alignItems: "center"}}>
                    {
                        (this.state.search) ? 
                        <>
                            <View style = {{justifyContent: "space-evenly", flexDirection: "row", alignItems: "center"}}>
                                <TextInput autoFocus = {true} style = {{height: 50, width: Dimensions.get("window").width * 0.80, color: "black", fontSize: 20}}
                                onChangeText = {artist => this.search(artist)}></TextInput>
                                <Feather name="x" size={24} color="black" onPress = {this.search_artist}/>
                            
                            </View>
                        </> : 
                            <MaterialIcons name = "search" size = {24} color = "black" onPress =  {this.search_artist}/>
                    }
                </View>
                <ScrollView onScrollBeginDrag = {this.hide_keyboard} style = {{flex: 1, backgroundColor: "white"}}>
                    <View style = {this.styles.container}>
                    {
                        this.state.grouped.map(([artist, songs], index) => {
                            return (
                                <React.Fragment key = {index}>
                                <TouchableOpacity onPress = {() => this.artists_songs(songs)}>
                                    <View style = {this.styles.each_artist_container}>
                                    {
                                        this.state.cover.map(([artist_cover, cover])=> {
                                            return (
                                               (artist_cover === artist) ? 
                                               (cover.length === 0) ? 
                                               <Image key = {songs} source = {require("../assets/default_image.jpg")} style={this.styles.artist_container_image}></Image>
                                               : <Image key = {songs} source = {{uri:"file:///"+cover}} style={this.styles.artist_container_image}></Image>
                                               : null
                                            )
                                        })
                                    }
                                        <Text style = {this.styles.artist_text}>
                                            {
                                                (artist.length > 15) ?  
                                                artist.substring(0,13).padEnd(15,".") 
                                                : artist
                                            }
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                </React.Fragment>
                            )
                        })
                    }
                    </View>
                </ScrollView>
                </>
            )
        }
    }

    styles = {
        container: {
            flex: 1, 
            flexWrap: "wrap", 
            flexDirection: "row", 
            paddingBottom: 95, 
            paddingTop: 5,
            backgroundColor: "white",
        }, 
        each_artist_container: {
            width: Dimensions.get("window").width * 0.48, 
            marginBottom: 20, 
            marginLeft: 5, 
            borderWidth: 2,
            borderColor: "black",
            backgroundColor: "black"
        },
        artist_container_image: {
            width: Dimensions.get("window").width * 0.47,
            height: 100,
        },
        artist_text: {
            fontSize: 20,
            textAlign: "center",
            color: "white",
        }
    }
}

export default Artists_Songs_Grouped;