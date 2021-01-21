import React from "react";
import Slider from "@react-native-community/slider";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import TrackPlayer from "react-native-track-player";

class SliderTrack extends TrackPlayer.ProgressComponent {

  get_duration = (song_time) => { 
    let min = Math.floor(song_time/60);
    let seconds = Math.floor((song_time/60 % 1) * 60).toString();
    (seconds >= 0 && seconds <= 9) ? seconds = "0" + seconds.toString() : null;
    let time = min + ":" + seconds;
    return time;
  }
 
  seek_To = (seconds) => {
    TrackPlayer.seekTo(seconds);
  }

  render() {
    return (
        <View style = {{width: Dimensions.get("window").width}}>
          <Slider
            style = {{width: Dimensions.get("window").width, height: 50}}
            minimumValue = {0}
            maximumValue = {this.state.duration}
            value = {this.state.position}
            minimumTrackTintColor = "#1E90FF"
            maximumTrackTintColor = "black"
            onSlidingComplete = {this.seek_To}
            thumbTintColor = "#1E90FF">
          </Slider>
          <View style = {this.styles.position_duration_text_container}>
            <Text style = {this.styles.position_duration_text}>{this.get_duration(this.state.position)}</Text>
            <Text style = {this.styles.position_duration_text}>{this.get_duration(this.state.duration)}</Text>
          </View>
        </View>
    );
  }

  styles = StyleSheet.create({
    position_duration_text_container: {
      flexDirection: "row", 
      justifyContent: "space-between",
      marginTop: -20, 
      paddingLeft: 5, 
      paddingRight: 5
    },
    position_duration_text: {
      fontSize: 18, 
      color: "black",
      padding: 5,
    },
  });
}

export default SliderTrack;