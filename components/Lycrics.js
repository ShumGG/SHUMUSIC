import React from "react";
import { View, Animated, Keyboard, TouchableOpacity, Pressable, StyleSheet } from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-community/async-storage";
import TrackPlayer from "react-native-track-player";
import { Fetch_Lycrics } from "../helpers/Fetch_options";
import { RFPercentage } from "react-native-responsive-fontsize";

class Lycrics extends React.Component {

    state = {
        event: "auto",
        lycrics: "",
        faded: false,
    }

    text_input = React.createRef();
    opacity = new Animated.Value(0);
    lycrics = "";
    
    componentDidMount() {   
        Keyboard.addListener("keyboardDidHide", this.forceLoseFocus);
        this.lycrics = TrackPlayer.addEventListener("playback-track-changed", this.change_lycrics);
    }

    componentWillUnmount() {
        this.lycrics.remove();
    }
    
    forceLoseFocus = () => {
        Keyboard.dismiss();
        this.save_lycrics();
        this.setState({event: "none"});
    }

    change_lycrics = () => {
        if (this.state.faded) {
            this.fade_in_out();
        }else {
            return;
        }
    }

    fade_in_out = () => {
        (this.state.faded) ? this.fade_out() : this.fade_in();
    }

    fade_in = () => {
        Animated.timing(this.opacity, {
            toValue: 1,
            duration: 500, 
            useNativeDriver: true
        }).start();
        this.get_lycrics();
    }
    
    fade_out = () => {
        Animated.timing(this.opacity, {
            toValue: 0,
            duration: 500, 
            useNativeDriver: true
        }).start();
        this.setState((prevState) => ({faded: !prevState.faded}));
    }

    edit_lycric = () => {
        if (this.state.faded) {
            this.text_input.focus();
            this.setState({event: "auto"});
        }else {
            return;
        }
    }

    save_lycrics = async () => {
        
        let lycrics = await Fetch_Lycrics();
        let current_track_id = await TrackPlayer.getCurrentTrack();
        let {title} = await TrackPlayer.getTrack(current_track_id);
        let current_track_lycrics = this.state.lycrics;
        
        if (lycrics === null) {
            let track_lycrics = {title: title, lycrics: current_track_lycrics};
            let array_lycrics = [];
            array_lycrics.push(track_lycrics);
            await AsyncStorage.setItem("lycrics", JSON.stringify(array_lycrics));
        }else {
            if (current_track_lycrics === "" || current_track_lycrics === "No lycrics.") {
               return;
            }else {
                let track_position = lycrics.findIndex(tracks => tracks.title === title);
                if (track_position < 0) {
                    let track_lycrics = {title: title, lycrics: current_track_lycrics};
                    lycrics.push(track_lycrics);
                    await AsyncStorage.setItem("lycrics", JSON.stringify(lycrics));
                }else {
                    lycrics[track_position].lycrics = current_track_lycrics;
                    await AsyncStorage.setItem("lycrics", JSON.stringify(lycrics));
                }
            }
        }
    }

    get_lycrics = async() => {
        let lycrics = await Fetch_Lycrics();
        if (lycrics != null) {
            let current_track_id = await TrackPlayer.getCurrentTrack();
            let {title} = await TrackPlayer.getTrack(current_track_id);
            lycrics = lycrics.filter(tracks => tracks.title === title);
            if (lycrics.length > 0) {
                this.setState((prevState) => ({lycrics: lycrics[0]?.lycrics, event: "none", faded: !prevState.faded}));
            }else {
                this.setState((prevState) => ({lycrics: "No lycrics.", event: "auto", faded: !prevState.faded}), () => {
                    this.text_input.focus();
                });
            }
        }else {
            this.setState((prevState) => ({lycrics: "No lycrics.", event: "auto", faded: !prevState.faded}), () => {
                this.text_input.focus();
            });
        }
    }

    render() {
        return (
            <TouchableOpacity onPress = {this.fade_in_out} style = {this.styles.touchable}>
                <Animated.View style = {this.styles.animated(this.opacity)}>
                    <ScrollView style = {this.styles.scrollview} showsVerticalScrollIndicator = {false}>
                        <Pressable onPress = {this.fade_in_out} onLongPress = {this.edit_lycric}>
                            <View pointerEvents = {this.state.event}>
                                <TextInput ref = {(input) => this.text_input = input} 
                                    style = {this.styles.text_input} 
                                    textAlign = "center" 
                                    multiline = {true} 
                                    textAlignVertical = "top"
                                    autoCorrect = {false}
                                    onChangeText = {text => this.setState({lycrics: text})}
                                    value = {this.state.lycrics}
                                    >
                                </TextInput>
                            </View>
                        </Pressable>
                    </ScrollView>
                </Animated.View>
            </TouchableOpacity>
        )
    }

    styles = StyleSheet.create({
        touchable: {
            position: "absolute", 
            height: RFPercentage(40), 
            width: RFPercentage(40),
            borderRadius: 200,
        }, 
        animated: (opacity) => ({
            opacity: opacity, 
            backgroundColor: "rgba(52,52,52,0.5)",
            position: "absolute", 
            height: RFPercentage(40),
            width: RFPercentage(40),
            borderRadius: 200,
        }),
        scrollview: {
            backgroundColor: "rgba(52,52,52,0.5)", 
            position: "absolute", 
            width: RFPercentage(40),
            height: RFPercentage(40),
            borderRadius: 200,
        }, 
        text_input: {
            width: RFPercentage(40),
            fontSize: RFPercentage(3),
            color: "white",
            borderRadius: 200,
            textAlign: "center",
            padding: RFPercentage(5),
        }
    });

}

export default Lycrics; 