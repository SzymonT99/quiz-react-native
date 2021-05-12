import React, { Component } from "react";
import { View, StyleSheet, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { TestScreen } from "../screens/TestScreen";
import { ResultsScreen } from "../screens/ResultsScreen";
import { ConditionsScreen } from "../screens/ConditionsScreen";
import { UserResultScreen } from "../screens/UserResultScreen";
import DrawerButton from "../components/DrawerButton";
import { HomeScreen } from "../screens/HomeScreen";
import { LoginScreen } from "../screens/LoginScreen";
import _ from "lodash";
import SQLite from "react-native-sqlite-storage";
import NetInfo from "@react-native-community/netinfo";


export default class DrawerNavigator extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tests: [],
      DB: SQLite.openDatabase({ name: 'QuizDatabase.db', createFromLocation: 1 }),
      internetConnected: true
    }
  }

  randomTests = (navigation) => {

    const { tests } = this.state;
    let randomIndex = _.random(0, tests.length - 1);
    let randomId = tests[randomIndex].id;
    navigation.navigate('Test', { testId: randomId, index: randomIndex, flag: 'changed' })
  }

  randomizeOrderTests = () => {
    const { tests } = this.state;
    let randomOrderTests = _.shuffle(tests);
    this.setState({tests: randomOrderTests})
  }

  checkInternetConnection = () => NetInfo.addEventListener(state => {
    this.setState({ internetConnected: state.isConnected });
  });

  executeQuery = (sql, params = []) => new Promise((resolve, reject) => {
    this.state.DB.transaction((trans) => {
      trans.executeSql(sql, params, (trans, results) => {
        resolve(results);
      },
        (error) => {
          reject(error);
        });
    });
  });

  getTestsFromBase = async () => {
    let selectQuery = await this.executeQuery(`SELECT t.test_id, t.name, t.description, t.level, t.number_tasks, group_concat(tag_content) 
      AS tags FROM tests t NATURAL INNER JOIN tags ta GROUP BY t.test_id, t.name, t.description, t.level, t.number_tasks`);
    var rows = selectQuery.rows;
    for (let i = 0; i < rows.length; i++) {
      var item = rows.item(i);
      const tagsArr = item.tags.split(',');
      item.tags = tagsArr;
      if(i == 3 || i == 4){
        let tag1 = item.tags[0];
        item.tags[0] = item.tags[2];
        item.tags[2] = tag1;
      }
      item.id = item.test_id;
      this.setState({ tests: this.state.tests.concat(item) })
      this.randomizeOrderTests();
    }
  }


  componentDidMount() {
    this.checkInternetConnection();
    NetInfo.fetch().then(
      state => {
        state.isConnected === true
          ? this.getTestsFromApi()
          : this.getTestsFromBase();
      });
  }

  generateDrawerButtons = (navigation) => {
    const { tests } = this.state;
    let buttonsLayout = tests.map((test, testIndex) => {
      return <DrawerButton title={test.tags[0] + '  #' + (testIndex + 1)} navigation={navigation}
        testId={test.id} key={testIndex} index={testIndex} routeName={"Test"} />
    })
    return buttonsLayout;
  }

  getTestsFromApi = async () => {
    try {
      let response = await fetch(
        'http://tgryl.pl/quiz/tests'
      );
      let responseJson = await response.json();
      this.setState({ tests: responseJson });
      this.randomizeOrderTests();
    } catch (error) {
      console.error(error);
    }
  }

  CustomDrawerContent = (navigation) => {

    return (
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.titleStyle}>Quiz App</Text>
          <Image
            style={styles.logoStyle}
            source={require('../images/quiz_logo.jpg')}
          />
          <DrawerButton navigation={navigation} title={"Home Page"} routeName={"Home"} />
          <DrawerButton navigation={navigation} title={"Results"} routeName={"Results"} />
          <TouchableOpacity style={styles.buttonContainer} disabled={this.state.internetConnected === true ? false : true}
            onPress={() => {
              this.getTestsFromApi(),
                navigation.closeDrawer()
            }}>
            <Text style={styles.textButtonStyle}>Download tests</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.boldLine} />
        <View style={styles.container}>
          <TouchableOpacity style={[styles.buttonContainer, { backgroundColor: "#477546" }]}
            onPress={() => {
              this.randomTests(navigation),
                navigation.closeDrawer()
            }}>
            <Text style={styles.textButtonStyle}>Random test</Text>
          </TouchableOpacity>
          {this.generateDrawerButtons(navigation)}
        </View>
      </ScrollView>
    );
  }

  render() {
    const Drawer = createDrawerNavigator();
    return (
      <Drawer.Navigator initialRouteName='Conditions' detachInactiveScreens drawerStyle={{
        backgroundColor: '#c7c7c7'}}
        drawerContent={(props) => this.CustomDrawerContent(props.navigation)}>
        <Drawer.Screen name='Conditions' component={ConditionsScreen} />
        <Drawer.Screen name='Login' component={LoginScreen} />
        <Drawer.Screen name='Home' component={HomeScreen}
          unmountOnBlur={true} options={{ unmountOnBlur: true }} />
        <Drawer.Screen name='Results' component={ResultsScreen} 
        unmountOnBlur={true} options={{ unmountOnBlur: true }}/>
        <Drawer.Screen name='Test' component={TestScreen}
          unmountOnBlur={true} options={{ unmountOnBlur: true }} />
        <Drawer.Screen name='UserResult' component={UserResultScreen}
          unmountOnBlur={true} options={{ unmountOnBlur: true }} />
      </Drawer.Navigator>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  titleStyle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    padding: 10
  },
  logoStyle: {
    margin: 10,
    marginBottom: 20,
    borderColor: "black",
    borderWidth: 2,
    alignSelf: "center",
    width: 250,
    height: 140,
  },
  boldLine: {
    height: 3,
    backgroundColor: "#000",
    marginTop: 10,
    marginBottom: 15,
  },

  buttonContainer: {
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 10,
    backgroundColor: "#815a91",
    padding: 5,
    margin: 5,
    marginBottom: 15,
    height: 40,
    alignItems: "center",
    justifyContent: "center"
  },
  textButtonStyle: {
    fontSize: 20,
    textAlign: "center",
    padding: 5,
    fontWeight: "600",
    fontFamily: "Roboto"
  }
});
