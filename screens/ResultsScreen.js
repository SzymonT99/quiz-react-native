import React, { Component } from "react";
import { View, StyleSheet, FlatList, Text, RefreshControl } from "react-native";
import Header from "../components/Header";
import NetInfo from "@react-native-community/netinfo";

const Item = ({ nick, score, total, type, date, index }) => {
  return (
    <View style={[styles.rowContainer, index % 2 && { backgroundColor: '#cfcfcf' }]}>
      <View style={[styles.column, { width: "22%" }]}>
        <Text style={styles.resultText}>{nick}</Text>
      </View>
      <View style={[styles.column, { width: "18%" }]}>
        <Text style={styles.resultText}>{score}/{total}</Text>
      </View>
      <View style={[styles.column, { width: "22%" }]}>
        <Text adjustsFontSizeToFit={true} minimumFontScale={0.85} style={styles.resultText}>{type}</Text>
      </View>
      <View style={styles.extendedColumn}>
        <Text style={styles.resultText}>{date}</Text>
      </View>
    </View>
  )
};

const wait = (timeout) => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

export class ResultsScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
      results: [],
      internetConnected: true
    }
  }

  getResultsFromApi = async () => {
    try {
      let response = await fetch(
        'http://tgryl.pl/quiz/results?last=50'
      );
      let responseJson = await response.json();
      this.setState({ results: responseJson });
    } catch (error) {
      console.error(error);
    }
  }

  checkInternetConnection = () => NetInfo.addEventListener(state => {
    this.setState({ internetConnected: state.isConnected });
  });

  componentDidMount() {
    this.checkInternetConnection();
    NetInfo.fetch().then(
      state => {
        if (state.isConnected === true) this.getResultsFromApi();
      });
  }

  generateItemList = ({ item, index }) => {
    return (
      <Item nick={item.nick} score={item.score} total={item.total} type={item.type}
        date={item.createdOn} index={index} />
    )
  }

  onRefresh = () => {
    this.setState({ refreshing: true });
    wait(2000).then(() => this.setState({ refreshing: false }));
  }

  sorted = (arrayResults) => {
    let sortedByDataResults = [];

    for (let item of arrayResults) {
      if (item.date != undefined) {
        item.createdOn = item.date + " 00:00:00";
        sortedByDataResults.push(item);           // sortowanie po dacie
      }
      sortedByDataResults.push(item);
    }
    sortedByDataResults.sort((a, b) => b.createdOn.localeCompare(a.createdOn))
    return sortedByDataResults
  }

  render() {
    return (
      <View style={styles.container}>
         <Header navigation={this.props.navigation} title="Results" />
        {this.state.internetConnected === true ?
          <View style={styles.tableContainer}>
            <View style={styles.rowHeaderContainer}>
              <View style={[styles.column, { width: "22%" }]}>
                <Text style={styles.titleText}>▼Nick</Text>
              </View>
              <View style={[styles.column, { width: "18%" }]}>
                <Text style={styles.titleText}>▼Point</Text>
              </View>
              <View style={[styles.column, { width: "22%" }]}>
                <Text style={styles.titleText}>▼Type</Text>
              </View>
              <View style={styles.extendedColumn}>
                <Text style={styles.titleText}>▼Date</Text>
              </View>
            </View>
            <View style={{ marginBottom: 100 }}>
              <FlatList nestedScrollEnabled={true}
                data={this.sorted(this.state.results)}
                renderItem={(item, index) => this.generateItemList(item, index)}
                keyExtractor={(item, index) => index.toString()}
                refreshControl={
                  <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />}
              />
            </View>
          </View>
          : <Text style={styles.internetErr}>NO INTERNET CONNECTION!</Text>}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3e3e3'
  },
  tableContainer: {
    padding: 7,
    paddingTop: 35,
    paddingBottom: 80,
  },
  rowHeaderContainer: {
    borderWidth: 1,
    flexDirection: "row",
    height: 60,
    backgroundColor: '#b5b5b5'
  },
  rowContainer: {
    borderWidth: 1,
    borderTopWidth: 0,
    flexDirection: "row",
    height: 77,
    backgroundColor: '#fffcc2'
  },
  column: {
    width: "20%",
    justifyContent: "center",
    borderRightWidth: 1,
  },
  extendedColumn: {
    width: "40%",
    justifyContent: "center",
  },
  titleText: {
    fontFamily: 'Raleway-Regular',
    fontWeight: "700",
    fontSize: 16,
    margin: 6
  },
  resultText: {
    fontSize: 15,
    margin: 6
  },
  errorContainer: {
    marginTop: 150
  },
  internetErr: {
    marginTop: 150,
    marginLeft: 15,
    marginRight: 15,
    textAlign: "center",
    fontSize: 42,
    fontFamily: "BreeSerif-Regular",
    backgroundColor: "#ffb254",
    padding: 7
  }
});

