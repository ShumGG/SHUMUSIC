import React, { Component } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Artists_Screen from "../Screens/Artists_Screen";
import Artist_Songs from "../Screens/Artists_Songs";

export const Stack = createStackNavigator();

export class Stack_Navigator extends Component {
    render() {
        return (
            <Stack.Navigator screenOptions = {{headerShown: false}}>
                <Stack.Screen name = "Artists" children = {({route, navigation}) => <Artists_Screen route = {route} navigation = {navigation} tracks = {this.props?.tracks}></Artists_Screen>}></Stack.Screen>
                <Stack.Screen name = "Artists_Songs" children = {({route, navigation}) => <Artist_Songs route = {route} navigation = {navigation} {...this.props}></Artist_Songs>}></Stack.Screen>
            </Stack.Navigator>
        )
    }
}

export default Stack_Navigator;