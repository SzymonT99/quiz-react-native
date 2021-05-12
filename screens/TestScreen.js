import React, { Component } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import Header from "../components/Header";
import * as Progress from 'react-native-progress';
import Icon from 'react-native-vector-icons/MaterialIcons';
import _ from "lodash";
import SQLite from "react-native-sqlite-storage";
import NetInfo from "@react-native-community/netinfo";

export class TestScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      title: '',
      level: '',
      tags: [],
      numberQuestions: 0,
      seconds: 0,
      currentQuestionNumber: 0,
      currentQuestion: '',
      currentAnswers: [],
      progresStatus: 1,
      selectedAnswers: [],
      dataIsReturned: false,
      internetConnected: true,
      DB: SQLite.openDatabase({ name: 'QuizDatabase.db', createFromLocation: 1 })
    }
  }


  initializeFirstQuestion = () => {

    const { tasks } = this.state;
    let currentAnswers = _.shuffle(tasks[0].answers);
    this.setState({
      currentQuestionNumber: 0,
      numberQuestions: tasks.length,
      currentQuestion: tasks[0].question,
      seconds: tasks[0].duration,
      currentAnswers: currentAnswers,
      selectedAnswers: [],
      progresStatus: 1,
      dataIsReturned: true,
    })
  }

  getTestFromApi = async () => {

    const { testId } = this.props.route.params;
    try {
      let response = await fetch(
        'http://tgryl.pl/quiz/test/' + testId
      );
      let responseJson = await response.json();
      this.setState({
        tasks: _.shuffle(responseJson.tasks),
        title: responseJson.name,
        level: responseJson.level,
        tags: responseJson.tags
      });
      this.initializeFirstQuestion();
    } catch (error) {
      console.error(error);
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

  getTestFromBase = async () => {
    const { testId } = this.props.route.params;
    let selectTests = await this.executeQuery(`SELECT t.test_id, t.name, t.description, t.level, t.number_tasks, group_concat(tag_content) 
      AS tags FROM tests t NATURAL INNER JOIN tags ta WHERE t.test_id = '${testId}'`);
    let selectTasks = await this.executeQuery(`SELECT * FROM tasks t WHERE t.test_id = '${testId}'`);
    let selectAnswers = await this.executeQuery("SELECT * FROM answers");

    let testsRows = selectTests.rows;
    let tasksRows = selectTasks.rows;
    let answersRows = selectAnswers.rows;

    const test = testsRows.item(0);
    let tagsArr = test.tags.split(',');
    test.tags = tagsArr;
    if(test.test_id == '5fd7e4629cc0bd32fcc04d64' || test.test_id == '5eaefb3b0e44b1621d02ac81'){
      let tag1 = test.tags[0];
      test.tags[0] = test.tags[2];
      test.tags[2] = tag1;
    }

    const tasks = [];
    for (let i = 0; i < tasksRows.length; i++) {
      let answers = [];
      for (let j = 0; j < answersRows.length; j++) {
        if (tasksRows.item(i).task_id === answersRows.item(j).task_id) {
          let answer = {
            content: answersRows.item(j).content,
            isCorrect: answersRows.item(j).is_correct === 1 ? true : false
          }
          answers.push(answer);
        }
      }
      let task = {
        question: tasksRows.item(i).question,
        duration: tasksRows.item(i).duration
      }
      task.answers = answers;
      tasks.push(task);
    }

    this.setState({
      tasks: tasks,
      title: test.name,
      level: test.level,
      tags: test.tags
    });
    this.initializeFirstQuestion();
  }

  goNextQuestion = (navigation) => {

    const { tasks, currentQuestionNumber, numberQuestions, selectedAnswers, title, level } = this.state;

    let nextIndexQuestion = currentQuestionNumber + 1;
    if (nextIndexQuestion !== numberQuestions) {
      let currentAnswers = _.shuffle(tasks[nextIndexQuestion].answers);
      this.setState({
        currentQuestionNumber: nextIndexQuestion,
        seconds: tasks[nextIndexQuestion].duration,
        currentQuestion: tasks[nextIndexQuestion].question,
        currentAnswers: currentAnswers,
        progresStatus: 1,
      })
    }
    else {
      clearInterval(this.interval);
      navigation.navigate('UserResult', {
        answerArray: selectedAnswers, title: title,
        level: level, numberQuestions: numberQuestions
      })
    }
  }

  tick = () => {
    const { tasks, seconds, currentQuestionNumber, progresStatus, selectedAnswers, internetConnected } = this.state;
    const { flag } = this.props.route.params;
    if (flag === undefined) {
      if (this.state.seconds > 0) {
        this.setState({
          seconds: seconds - 1,
          progresStatus: progresStatus - (1 / tasks[currentQuestionNumber].duration)
        });
      }
      else {
        this.setState({
          selectedAnswers: selectedAnswers.concat(false)       // kiedy upłyną czas - false 
        })
        this.goNextQuestion(this.props.navigation);
      }
    }
    else {
      clearInterval(this.interval);
      internetConnected === true
        ? this.getTestFromApi()
        : this.getTestFromBase();

      this.interval = setInterval(() => this.tick(), 1000);
      this.props.route.params.flag = undefined;
    }
  }

  selectAnswer = (answerNumber) => {
    const { selectedAnswers, currentAnswers } = this.state;
    this.setState({
      selectedAnswers: selectedAnswers.concat(currentAnswers[answerNumber].isCorrect)
    })
    this.goNextQuestion(this.props.navigation);
  }

  checkInternetConnection = () => NetInfo.addEventListener(state => {
    this.setState({ internetConnected: state.isConnected });
  });


  componentDidMount() {
    NetInfo.fetch().then(
      state => {
        state.isConnected === true
          ? this.getTestFromApi()
          : this.getTestFromBase();
      });
    this.interval = setInterval(() => this.tick(), 1000);
    this.checkInternetConnection();
  }


  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {

    const { seconds, currentQuestionNumber, numberQuestions, currentQuestion,
      progresStatus, title, currentAnswers, tags, dataIsReturned, internetConnected } = this.state;
    return (
      <View style={styles.container}>
        <Header navigation={this.props.navigation} title={dataIsReturned === true ? (tags[0]) : "..."} />
        {internetConnected !== true ?
          <View style={styles.connectedContainer}>
            <Text style={styles.connectedText}>No internet connection</Text>
          </View> : <View />}
        {dataIsReturned === true
          ? <View>
            <View style={styles.captionStyle}>
              <Text style={styles.textCaption}>Question {currentQuestionNumber + 1} of {numberQuestions}</Text>
              <View style={{ marginLeft: 114 }}>
                <Text style={styles.textCaption}>Time: <Text style={{ color: "red", fontWeight: "bold" }}>{seconds}</Text> sec</Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <Progress.Bar progress={progresStatus} width={345} height={12} color={"#fff582"} borderColor={"black"} unfilledColor={"#969595"} />
            </View>
            <View style={styles.questionContainer}>
              <Text adjustsFontSizeToFit={true} style={styles.textQuestion}>{currentQuestion}</Text>
            </View>
            <View style={styles.categoryContainer}>
              <Text style={styles.textDescription}>{'Test: ' + title}</Text>
            </View>
            <View style={styles.answersContainer}>
              <TouchableOpacity style={styles.answerButton} onPress={() => this.selectAnswer(0)}>
                <Text adjustsFontSizeToFit={true} minimumFontScale={0.9} style={styles.textButton}>{currentAnswers[0].content}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.answerButton} onPress={() => this.selectAnswer(1)}>
                <Text allowFontScaling={true} minimumFontScale={0.9} style={styles.textButton}>{currentAnswers[1].content}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.answerButton} onPress={() => this.selectAnswer(2)}>
                <Text adjustsFontSizeToFit={true} minimumFontScale={0.9} style={styles.textButton}>{currentAnswers[2].content}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.answerButton} disabled={currentAnswers[3] === undefined ? true : false}
                onPress={() => this.selectAnswer(3)}>
                <Text adjustsFontSizeToFit={true} minimumFontScale={0.9} style={styles.textButton}>
                  {currentAnswers[3] === undefined ? "" : currentAnswers[3].content}</Text>
              </TouchableOpacity>
            </View>
          </View>             //brak danych - widok ładowania zawartości
          : <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Icon name='cached' style={{ marginTop: 200 }} size={200} />
          </View>}
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#e3e3e3",
    flex: 1,
  },
  captionStyle: {
    flexDirection: "row",
    marginLeft: 20,
    marginRight: 20,
    marginTop: 40,
    marginBottom: 15
  },
  textCaption: {
    fontSize: 18,
    fontFamily: "SourceSansPro-SemiBold",
    fontWeight: "600"
  },
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderColor: "black",
    margin: 15
  },
  questionContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 120,
    marginLeft: 20,
    marginRight: 20
  },
  categoryContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 20
  },
  textQuestion: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700"
  },
  descriptionContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 40
  },
  textDescription: {
    textAlign: "center",
    fontSize: 17,
    textDecorationLine: "underline"
  },
  answersContainer: {
    margin: 5,
    backgroundColor: "#ededed",
    height: "40%",
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 15,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    alignContent: 'center'

  },
  answerButton: {
    width: 170,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e3da62",
    borderRadius: 30,
    borderWidth: 1.5,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 13,
    paddingRight: 13,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 20,
    marginBottom: 20
  },
  textButton: {
    textAlign: "center",
    fontSize: 16
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
