import React, { Component } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import Header from "../components/Header";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class UserResultScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            nick: null
        }
    }

    getNumberCorrectAnswer = (results) => {
        let counter = 0;
        for (let i = 0; i < results.length; i++) {
            if (results[i] === true) {
                counter++;
            }
        }
        return counter;
    }

    sendResult = async () => {
        const { answerArray, numberQuestions, title } = this.props.route.params;
        await AsyncStorage.getItem('nick').then((value) => { this.setState({ nick: value }) });
        await NetInfo.fetch().then(
            state => {
                let correctAnswer = this.getNumberCorrectAnswer(answerArray);
                if (state.isConnected === true) {

                    fetch('http://tgryl.pl/quiz/result', {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            nick: this.state.nick,
                            score: correctAnswer,
                            total: numberQuestions,
                            type: title,
                        })
                    });
                }
            });
    }

    componentDidMount() {
        this.sendResult();

    }

    render() {
        const { answerArray, title, level, numberQuestions } = this.props.route.params;
        let correctAnswer = this.getNumberCorrectAnswer(answerArray);
        let incorrectAnswer = numberQuestions - correctAnswer;
        return (
            <View style={styles.container}>
                <Header navigation={this.props.navigation} title={'Your result'} />
                <View style={{ alignItems: "center", marginTop: 20, height: "80%" }}>
                    <Text style={styles.resultTitleText}>Quiz results</Text>
                    <Text style={styles.titleText}>{title}</Text>
                    <Text style={styles.categoryText}>{level}</Text>
                    <View style={styles.resultContainer}>
                        <View style={styles.resultRow}>
                            <Text style={styles.statsText}>User nick:   <Text style={styles.resultText}>{this.state.nick}</Text></Text>
                        </View>
                        <View style={styles.resultRow}>
                            <Text style={styles.statsText}>Number of questions:   <Text style={styles.resultText}>{numberQuestions}</Text></Text>
                        </View>
                        <View style={styles.resultRow}>
                            <Text style={styles.statsText}>Number of correct answers:   <Text style={styles.resultText}>{correctAnswer}</Text></Text>
                        </View>
                        <View style={[styles.resultRow, { borderBottomWidth: 2 }]}>
                            <Text style={styles.statsText}>Number of incorrect answers:   <Text style={styles.resultText}>{incorrectAnswer}</Text></Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.button}
                    onPress={() => this.props.navigation.navigate('Home')}>
                    <Text style={{ fontSize: 18, textAlign: "center" }}>Back to Home page</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e3e3e3',
        alignItems: "center"
    },
    resultContainer: {
        backgroundColor: '#FFFFFF',
        margin: 10,
        padding: 10,
        backgroundColor: "green",
        width: "80%",
        height: "60%",
        borderWidth: 2,
        borderRadius: 15,
        flex: 4
    },
    resultRow: {
        flex: 1,
        padding: 10,
        justifyContent: "center",
        borderWidth: 2,
        borderBottomWidth: 0,
        backgroundColor: "#fffcc2"
    },
    resultTitleText: {
        fontSize: 38,
        fontWeight: "bold",
        marginBottom: 8,
        color: "red"
    },
    titleText: {
        fontSize: 26,
        fontWeight: "bold",
        marginBottom: 8,
        textAlign: "center"
    },
    categoryText: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 4,
        textAlign: "center",
    },
    statsText: {
        fontSize: 17,
        fontFamily: "Roboto"
    },
    resultText: {
        fontSize: 20,
        fontFamily: "Roboto",
        fontWeight: "bold"
    },
    button: {
        marginTop: 7,
        backgroundColor: "#7d7d7d",
        padding: 10,
        borderWidth: 1,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        width: "60%"
    }

});

