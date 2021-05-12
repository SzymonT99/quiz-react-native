import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';

const TestButton = (props) => {

    const navigation = useNavigation();

    return (
        <TouchableOpacity style={styles.buttonContainer}
        onPress={() => navigation.navigate('Test', {testId: props.testId, index: props.index})}>
            <View style={{ padding: 20}}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.titleStyle}>{props.title}</Text>
                </View>
                <View style={styles.subtitleContainer}>
                    <Text style={styles.subtitleStyle}>{"#" +props.tag1}</Text>
                    <Text style={[styles.subtitleStyle, {marginLeft: 10}]}>{props.tag2 !== undefined ? "#" + props.tag2 : ''}</Text>
                    <Text style={[styles.subtitleStyle, {marginLeft: 10}]}>{props.tag3 !== undefined ? "#" + props.tag3 : ''}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.descriptionStyle}>{props.description}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{marginTop: 5}}>Poziom: <Text style={styles.levelText}>{props.level}</Text></Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
    buttonContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#000000",
        marginTop: 24,
        marginLeft: 15,
        marginRight: 15
    },
    titleStyle: {
        fontFamily: "BreeSerif-Regular",
        fontSize: 24,
    },
    subtitleContainer: {
        paddingTop: 14,
        paddingBottom: 14,
        flex: 2,
        flexDirection: "row",
        alignItems: "center"
    },
    subtitleStyle: {
        textDecorationLine: "underline",
        fontSize: 14,
        color: "#0000FF"
    },
    descriptionStyle: {
        fontSize: 14,
        fontFamily: "SourceSansPro-Regular"
    },
    levelText: {
        color: "red",
        fontSize: 16,
        fontWeight: "700",
    }
});

export default TestButton;
