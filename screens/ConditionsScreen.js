import React, { Component } from "react";
import { ScrollView, View, TouchableOpacity, Text, StyleSheet } from "react-native";
import CheckBox from '@react-native-community/checkbox';
import AsyncStorage from "@react-native-async-storage/async-storage";

export class ConditionsScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            regulsAccepted: false,
            loading: true
        };
    }


    componentDidMount() {
        AsyncStorage.getItem('isAccepted').then((value) => {
            if (value !== 'true') {
                this.setState({loading: false})
                AsyncStorage.setItem('isAccepted', 'true');     //pierwsze wejście
            }
            else {
                this.props.navigation.navigate('Login');
            }
        });
    }

    loading = () => {
        return(<View style={styles.loadingStyle}><Text style={styles.loadingText}>Loading...</Text></View>)
    }

    render() {
        if (this.state.loading === true) {
           return this.loading();
        }
        else{
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.titleText}>Application regulations</Text>
                    <Text style={{ color: "red", fontSize: 30, fontWeight: "bold" }}> !</Text>
                </View>
                <View style={styles.regulContainer}>
                    <ScrollView style={{ padding: 10 }}>
                        <Text style={{ fontSize: 18 }}><Text style={{ fontWeight: "bold" }}>1. </Text>The quiz is intended to provide entertainment.</Text>
                        <Text style={{ fontSize: 18 }}><Text style={{ fontWeight: "bold" }}>2. </Text>Users with an inappropriate name will be deleted.</Text>
                        <Text style={{ fontSize: 18 }}><Text style={{ fontWeight: "bold" }}>3. </Text>Report any bugs to improve gameplay.</Text>
                        <Text style={{ fontSize: 18 }}><Text style={{ fontWeight: "bold" }}>4. </Text>The application uses various types of tests and covers various topics.</Text>
                        <Text style={{ fontSize: 18 }}><Text style={{ fontWeight: "bold" }}>5. </Text>The answers to the questions are checked by our experts, but in case of any error please contact us.</Text>
                        <Text style={{ fontSize: 18 }}><Text style={{ fontWeight: "bold" }}>6. </Text>The time allowed for a given question has been adjusted accordingly.</Text>
                        <Text style={{ fontSize: 18 }}><Text style={{ fontWeight: "bold" }}>7. </Text>The application is not aimed at profit, so any messages ordering payments
                        may indicate fraud by third parties.Please report such situations.</Text>
                        <Text style={{ fontSize: 18 }}><Text style={{ fontWeight: "bold" }}>8. </Text>There are possible interruptions in the availability of the application,
                        it is related to the updating of the database of questions and the development of the application.</Text>
                        <Text style={{ fontSize: 18 }}><Text style={{ fontWeight: "bold" }}>9. </Text>In the event of inactivity of a given user, we provide appropriate notifications about the possible
                        deletion of the account due to the player's passivity.</Text>
                        <Text style={{ fontSize: 18 }}><Text style={{ fontWeight: "bold" }}>10. </Text>Users who deliberately repeatedly answer the tests incorrectly will receive an appropriate warning.</Text>
                        <View style={{ marginTop: 20, borderTopWidth: 1 }} />
                        <View style={{ alignItems: "center", justifyContent: "center", height: 140, padding: 5 }}>
                            <Text style={{ color: "red", fontSize: 12 }}>{this.state.regulsAccepted === false ? 'Accept if you want to continue' : ''}</Text>
                            <View style={{ alignItems: "center", flexDirection: "row" }}>
                                <Text style={{ fontWeight: "bold", fontSize: 19 }}>Do you accept the rules?</Text>
                                <CheckBox
                                    value={this.state.regulsAccepted}
                                    onValueChange={(newValue) => { this.setState({ regulsAccepted: newValue }) }}
                                    style={styles.checkbox}
                                />
                            </View>
                            <TouchableOpacity style={styles.button} onPress={() => { this.state.regulsAccepted === true ? this.props.navigation.navigate('Login') : null }}>
                                <Text style={{ fontSize: 20, fontWeight: "700" }}>Go to quiz</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>

            </View>

        );
        }
    }
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#9c9c9c",
        flex: 12,
    },
    header: {
        flexDirection: "row",
        backgroundColor: "#9c9c9c",
        flex: 1,
        borderBottomWidth: 3,
        alignItems: "center",
        justifyContent: "center"
    },
    titleText: {
        textAlign: "center",
        fontWeight: "700",
        fontSize: 22,
    },
    regulContainer: {
        flex: 11,
        backgroundColor: "#f2f2f2",
        borderLeftWidth: 1,
        borderRightWidth: 1,
    },
    checkbox: {
        marginLeft: 10,
        alignSelf: "center",
    },
    button: {
        marginTop: 8,
        backgroundColor: "#9c9c9c",
        padding: 10,
        borderRadius: 10,
        paddingLeft: 30,
        paddingRight: 30
    },
    loadingStyle: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        textAlign: "center",
        fontSize: 60
    }
});
