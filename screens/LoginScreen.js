import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

export class LoginScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            nick: '',
            warning: false,
            internetConnected: true
        }
    }

    goToQuiz = () => {
        this.props.navigation.navigate('Home');
        AsyncStorage.setItem('nick', this.state.nick);
    }

    checkInternetConnection = () => NetInfo.addEventListener(state => {
        this.setState({ internetConnected: state.isConnected });
    });

    componentDidMount() {
        this.checkInternetConnection();
    }

    render() {

        const { nick, warning, internetConnected } = this.state

        return (
            <View style={styles.container}>
                {internetConnected !== true ?
                    <View style={styles.connectedContainer}>
                        <Text style={styles.connectedText}>No internet connection</Text>
                    </View> : <View />}
                <Text style={[styles.titleStyle]}>Quiz App</Text>
                <Image
                    style={styles.logoStyle}
                    source={require('../images/quiz_logo.jpg')}
                />
                <Text style={styles.warningText}>{warning ? "You didn't enter your nickname" : ""}</Text>
                <TextInput
                    style={styles.inputTextStyle}
                    placeholder="Enter your nick"
                    onChangeText={(text) => this.setState({ nick: text })}
                    value={this.state.nick}
                />
                <TouchableOpacity style={styles.button}
                    onPress={() => {
                        nick !== '' ? this.goToQuiz() : this.setState({ warning: true });
                    }}>
                    <Text style={{ fontSize: 22, fontWeight: "600", textAlign: "center" }}>Go to Quiz</Text>
                </TouchableOpacity>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#e3e3e3",
        flex: 1,
    },
    titleStyle: {
        fontSize: 48,
        fontWeight: "bold",
        textAlign: "center",
        margin: 10,
        marginBottom: 20,
        marginTop: 60
    },
    warningText: {
        color: "red",
        fontSize: 16,
        fontWeight: "700",
        alignSelf: "center",
    },
    logoStyle: {
        margin: 10,
        marginBottom: 30,
        borderColor: "black",
        borderWidth: 2,
        width: 310,
        height: 190,
        alignSelf: "center",
    },
    inputTextStyle: {
        backgroundColor: "#FFFFFF",
        padding: 10,
        borderWidth: 1.5,
        fontSize: 16,
        margin: 20,
        textAlign: "center",
        marginBottom: 2,
        width: "60%",
        alignSelf: "center",
    },
    button: {
        marginTop: 17,
        backgroundColor: "#7d7d7d",
        padding: 10,
        borderWidth: 1,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        width: "60%",
        alignSelf: "center",
    },
    connectedContainer: {
        height: 30,
        backgroundColor: "#ffaf38",
        alignItems: "center",
        justifyContent: "center"
    },
    connectedText: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center"
    }, 
});
