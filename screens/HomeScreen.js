import React, { Component } from "react";
import { ScrollView, View, Button, Text, StyleSheet, TouchableOpacity } from "react-native";
import TestButton from "../components/TestButton";
import Header from "../components/Header";
import _ from "lodash";
import SQLite from "react-native-sqlite-storage";
import NetInfo from "@react-native-community/netinfo";

export class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tests: [],
      DB: SQLite.openDatabase({ name: 'QuizDatabase.db', createFromLocation: 1 }),
      internetConnected: true
    }
  }


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
    }
  }

  checkInternetConnection = () => NetInfo.addEventListener(state => {
    this.setState({ internetConnected: state.isConnected });
  });


  getTestsFromApi = async () => {
    try {
      let response = await fetch(
        'http://tgryl.pl/quiz/tests'
      );
      let responseJson = await response.json();
      this.setState({ tests: responseJson });
    } catch (error) {
      console.error(error);
    }
  }

  componentDidMount() {
    NetInfo.fetch().then(
      state => {
        state.isConnected === true
         ? this.getTestsFromApi()
         : this.getTestsFromBase();
      });;
    this.checkInternetConnection();
  }

  generateTests = () => {

    const { tests } = this.state;
    let randomOrderTests = _.shuffle(tests);
    let testsLayout = randomOrderTests.map((test, testIndex) => {
      return <TestButton  testId={test.id} title={test.name} tag1={test.tags[0]} tag2={test.tags[1]} tag3={test.tags[2]}
        description={test.description} level={test.level} key={testIndex} index={testIndex} />
    })
    return testsLayout;
  }

  getCurrentDate = () => {
    var d = new Date();
    month = '' + (d.getMonth() + 1);
    day = '' + d.getDate();
    year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;
    return [year, month, day].join('-');
  }

  render() {
    return (
      <View style={styles.container}>
        <Header navigation={this.props.navigation} title="Home Page" />
        {this.state.internetConnected !== true ?
          <View style={styles.connectedContainer}>
            <Text style={styles.connectedText}>No internet connection</Text>
          </View> : <View />}
        <ScrollView>
          {this.generateTests()}
          <View style={styles.footerStyle}>
            <Text style={styles.footerText}>Get to know your ranking result</Text>
            <TouchableOpacity style={styles.buttonResults}
              onPress={() => this.props.navigation.navigate('Results')}>
              <Text style={styles.textButton}>Check!</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#e3e3e3",
    flex: 1,
  },
  footerStyle: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    flex: 1,
    fontSize: 20,
    padding: 12
  },
  buttonResults: {
    flex: 1,
    backgroundColor: "#7d7d7d",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#40403f",
    width: "35%",
    marginBottom: 12
  },
  textButton: {
    padding: 5,
    fontSize: 18,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontFamily: "Roboto"
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
  }
});
