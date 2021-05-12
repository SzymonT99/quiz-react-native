import React, { Component } from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";

const DrawerButton = (props) => {

    return (
        <TouchableOpacity style={styles.buttonContainer}
            onPress={() => props.routeName === 'Test' 
                ?  props.navigation.navigate('Test', { testId: props.testId, index: props.index, flag: 'changed' })
                : props.navigation.navigate(props.routeName)}>
            <Text style={styles.textStyle}>{props.title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        borderWidth: 1,
        borderColor: "#000000",
        borderRadius: 10,
        backgroundColor: "#7d7d7d",
        padding: 5,
        margin: 5,
        marginBottom: 15,
        height: 40,
        alignItems: "center",
        justifyContent: "center"
    },
    textStyle: {
        fontSize: 20,
        textAlign: "center",
        padding: 5,
        fontWeight: "600",
        fontFamily: "Roboto"

    }

});

export default DrawerButton;
