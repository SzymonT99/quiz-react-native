import React, { Component } from "react";
import { NavigationContainer } from "@react-navigation/native";
import SplashScreen from 'react-native-splash-screen'
import DrawerNavigator from "./navigation/DrawerNavigator";
import SQLite from "react-native-sqlite-storage";
import NetInfo from "@react-native-community/netinfo";

export default class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      tests: [],
      DB: SQLite.openDatabase({ name: 'QuizDatabase.db', createFromLocation: 1 }),
      lastEntry: '',
    }
  }

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

  saveTest = (testId, name, description, level, numberOfTasks) => {
    const query = `INSERT INTO tests (test_id, name, description, level, number_tasks) VALUES ("${testId}", "${name}", "${description}", "${level}", ${numberOfTasks})`
    return this.state.DB.executeSql(query, [],
      (trans, results) => {
        //  console.log("Saved");
      },
      (error) => {
        console.log(error.message);
      });
  }

  saveTask = (taskId, question, duration, testId) => {
    const query = `INSERT INTO tasks (task_id, question, duration, test_id) VALUES (${taskId} ,"${question}", ${duration}, "${testId}")`
    return this.state.DB.executeSql(query, [],
      (trans, results) => {
        //  console.log("Saved");
      },
      (error) => {
        console.log(error.message);
      });
  }

  saveAnswer = (content, isCorrect, taskId) => {
    const query = `INSERT INTO answers (content, is_correct, task_id) VALUES ("${content}", ${isCorrect}, ${taskId})`
    return this.state.DB.executeSql(query, [],
      (trans, results) => {
        // console.log("Saved");
      },
      (error) => {
        console.log(error.message);
      });
  }

  saveTag = (tagContent, testId) => {
    const query = `INSERT INTO tags (tag_content, test_id) VALUES ("${tagContent}", "${testId}")`
    return this.state.DB.executeSql(query, [],
      (trans, results) => {
        //  console.log("Saved");
      },
      (error) => {
        console.log(error.message);
      });
  }

  createTables = async () => {
    const { DB } = this.state;
    let tests = await DB.executeSql(`
    CREATE TABLE IF NOT EXISTS "tests" (
      "test_id"	TEXT NOT NULL,
      "name"	TEXT NOT NULL,
      "description"	TEXT NOT NULL,
      "level"	TEXT NOT NULL,
      "number_tasks"	INTEGER NOT NULL
    );`);

    let answers = await DB.executeSql(`
    CREATE TABLE IF NOT EXISTS "answers" (
      "answer_id"	INTEGER NOT NULL,
      "content"	TEXT NOT NULL,
      "is_correct"	BLOB NOT NULL,
      "task_id"	INTEGER NOT NULL,
      PRIMARY KEY("answer_id"),
      FOREIGN KEY("task_id") REFERENCES "tasks"("task_id")
    );`);

    let tasks = await DB.executeSql(`
    CREATE TABLE IF NOT EXISTS "tasks" (
      "task_id"	INTEGER NOT NULL,
      "question"	TEXT NOT NULL,
      "duration"	INTEGER NOT NULL,
      "test_id"	INTEGER NOT NULL,
      PRIMARY KEY("task_id" AUTOINCREMENT),
      FOREIGN KEY("test_id") REFERENCES "tests"("test_id")
    );
    `);

    let tags = await DB.executeSql(`
    CREATE TABLE IF NOT EXISTS "tags" (
      "tag_id"	INTEGER NOT NULL,
      "tag_content"	TEXT NOT NULL,
      "test_id"	INTEGER NOT NULL,
      FOREIGN KEY("test_id") REFERENCES "tests"("test_id"),
      PRIMARY KEY("tag_id")
    );`);

    let entriesHistory = await DB.executeSql(`
    CREATE TABLE IF NOT EXISTS "entries_history" (
      "entry_id"	INTEGER NOT NULL,
      "entry_date"	TEXT NOT NULL,
      PRIMARY KEY("entry_id" AUTOINCREMENT)
    );`);
  }

  saveData = async () => {
    const { DB } = this.state;

    await this.getTestsFromApi();

    DB.executeSql("DELETE FROM tests;");
    DB.executeSql("DELETE FROM answers;");
    DB.executeSql("DELETE FROM tasks;");    // usunięcie starych danych
    DB.executeSql("DELETE FROM tags;");

    const { tests } = this.state;
    let taskId = 0;
    for (let test of tests) {
      this.saveTest(test.id, test.name, test.description, test.level, test.numberOfTasks);
      for (let i = 0; i < test.tags.length; i++) {
        this.saveTag(test.tags[i], test.id)
      }
      fetch('http://tgryl.pl/quiz/test/' + test.id)
        .then((responseJson) => responseJson.json())
        .then((json) => {
          for (let task of json.tasks) {
            taskId++;
            this.saveTask(taskId, task.question, task.duration, test.id);
            for (let answer of task.answers) {
              this.saveAnswer(answer.content, answer.isCorrect === true ? 1 : 0, taskId);
            }
          }
        })
    }
  }

  checkLastEntry = () => {
    this.state.DB.transaction(tx => {
      tx.executeSql('SELECT * FROM entries_history ORDER BY entry_id DESC LIMIT 1', [], (tx, results) => {
        const rows = results.rows;
        this.setState({ lastEntry: rows.item(0).entry_date });
        this.manageDataStorage();
      })
    });
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



  manageDataStorage = () => {
    const { DB, lastEntry } = this.state;
    this.createTables();
    if (lastEntry !== this.getCurrentDate()) {
      let date = this.getCurrentDate();
      DB.executeSql(`INSERT INTO entries_history (entry_date) VALUES ('${date}')`)
      this.saveData();
    }
    else {
      console.log("pobrano już dziś dane")
    }
  }

  componentDidMount() {
    SplashScreen.hide();
    NetInfo.fetch().then(
      state => {
        if (state.isConnected === true) this.checkLastEntry();
      });
  }

  render() {
    return (
      <NavigationContainer>
        <DrawerNavigator />
      </NavigationContainer>
    );
  }
};