import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Header({ title, navigation }) {

    const openMenu = () => {
        navigation.openDrawer();
    }

    return (
        <View style={styles.header}>
            <Icon name='menu' size={30} onPress={openMenu} style={styles.menuIconStyle} />
            <View style={{width: "100%", justifyContent: "center", alignItems: "center"}}>
                <Text style={styles.headerText}>{title}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: "#b8b6b4",
        width: "100%",
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIconStyle: {
        backgroundColor: "#9e9e9e",
        marginLeft: 15,
        textAlign: "center",
        paddingTop: 3,
        paddingBottom: 3,
        paddingLeft: 5,
        paddingRight: 5,
        borderRadius: 7,
        borderWidth: 1,
    },
    headerText: {
        marginRight: 100,
        fontFamily: "Roboto",
        fontSize: 24,
    }
});