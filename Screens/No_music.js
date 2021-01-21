import React from "react";
import { Dimensions, StyleSheet, Text, View, Modal } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { MaterialIcons } from '@expo/vector-icons'; 

class No_music extends React.Component {

    render() {
        return(
            <View style = {this.style.container}>
                <Text style = {this.style.text}>
                    There's no music in the device.
                </Text>
                <MaterialIcons name = "refresh" size = {30} color = "black" onPress = {this.props?.requestPermission}/>
            </View>
        )
    }

    style = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "white",
            justifyContent: "center",
            alignItems: "center"
        },
        text: {
            fontSize: RFValue(25, Dimensions.get("window").height),
            color: "black",
        }
    })
}

export default No_music;
