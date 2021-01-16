import React, { Component } from 'react';
import {Button, Container, Divider, Form, Grid, Header, Input, List, Loader, Popup} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

import * as tf from '@tensorflow/tfjs';

type Props = {};

type State = {
  loadingModel: boolean,
  generatingText: boolean,
  numUsernames: number,
  temperature: number,
  startString: string,
  numGenerated: number,
  usernames: Array<string>,
  model: any,
};

class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loadingModel: true,
      generatingText: false,
      numUsernames: 20,
      temperature: 0.5,
      startString: '\n',
      numGenerated: 0,
      usernames: [],
      model: null,
    };
  }
  
  timeout(delay: number) {
      return new Promise( res => setTimeout(res, delay) );
  }

  numUsernamesChanged = (e, { value }) => {
    this.setState({ numUsernames : value });
  }

  temperatureChanged = (e, { value }) => {
    this.setState({ temperature : value });
  }

  startStringChanged = (e, { value }) => {
    this.setState({ startString : value });
  }

  componentDidMount() {
    this.loadModel();
  }

  componentDidUpdate(prevState: any) {
    if (this.state.numGenerated !== prevState.numGenerated) {
      this.setState({})
    }
  }

  loadModel = async () => {
    console.log('loading model');
    const model = await tf.loadLayersModel('http://127.0.0.1:8000/assets/tfjs/model.json');
    console.log('model loaded');
    this.setState({loadingModel: false, model: model});
  }

  
  generateUsernames = async () => {
    console.log('generating usernames')
    this.setState({ generatingText: true, numGenerated: 0 }, async () => {
      await this.timeout(10); // wait for state to rerender (i'm pretty sure this is really bad)
      let {numUsernames, temperature, startString, model} = this.state;
      const char2idx = {"\n": 0, "-": 1, "0": 2, "1": 3, "2": 4, "3": 5, "4": 6, "5": 7, "6": 8, "7": 9, "8": 10, "9": 11, "A": 12, "B": 13, "C": 14, "D": 15, "E": 16, "F": 17, "G": 18, "H": 19, "I": 20, "J": 21, "K": 22, "L": 23, "M": 24, "N": 25, "O": 26, "P": 27, "Q": 28, "R": 29, "S": 30, "T": 31, "U": 32, "V": 33, "W": 34, "X": 35, "Y": 36, "Z": 37, "_": 38, "a": 39, "b": 40, "c": 41, "d": 42, "e": 43, "f": 44, "g": 45, "h": 46, "i": 47, "j": 48, "k": 49, "l": 50, "m": 51, "n": 52, "o": 53, "p": 54, "q": 55, "r": 56, "s": 57, "t": 58, "u": 59, "v": 60, "w": 61, "x": 62, "y": 63, "z": 64};
      const idx2char = ['\n', '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '_', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  
      // Convert start string to numbers (vectorizing)
      let inputEval: string[] = [];
      for (let char of startString) {
        inputEval.push(char2idx[char]);
      }
      let inputTensor = tf.tensor1d(inputEval);
      inputTensor.expandDims(0);  // fix dimensions
      
      let textGenerated: string[] = []; // store our generated usernames
      let currString = '';
      
      while (textGenerated.length < numUsernames) {
        let predictions = model.predict(inputTensor);
        // remove batch dimension
        predictions = tf.squeeze(predictions);
        // use categorical distribution to predict next char
        predictions = predictions.mul(1 / temperature);
        // use multinomial since random.categorical doesn't exist in tfjs
        let predTensor = tf.multinomial(predictions, 1);
        inputTensor = tf.expandDims(predTensor, 0);
        let predictedID = predTensor.dataSync()[0];
  
        if (idx2char[predictedID] === '\n') { // finished creating a new username
          textGenerated.push(currString);
          console.log(currString);
          currString = '';
          this.setState({numGenerated: this.state.numGenerated + 1}, async () => {
            console.log(this.state.numGenerated);
          });
        }
        else {
          currString += idx2char[predictedID];
        }
      }
      this.setState({generatingText: false, usernames: textGenerated});
    });
  }

  render() {
    const { loadingModel, generatingText, usernames, numGenerated, numUsernames } = this.state;
    return (
      <Container>
        <Header size='huge' style={{paddingTop: '20px', display: 'inline-block'}}>Reddit Username Generator</Header>
        <a style={{padding: '20px'}} href='https://github.com/dchen327'>(GitHub)</a>
        <Form>
          <Form.Group widths='equal'>
            <Popup 
              content='Generate this many usernames.'
              trigger={
                <Form.Field control={Input} label='Number of usernames:' placeholder='20'
                onChange={this.numUsernamesChanged}/>
              }
              on='focus'
            />
            <Popup 
              content='Temperatures are between 0 and 1, with lower temperatures producing more predictable text and higher temperatures resulting in more surprising text.'
              trigger={
                <Form.Field control={Input} label='Temperature:' placeholder='0.5'
                onChange={this.temperatureChanged}/>
              }
              on='focus'
            />
            <Popup 
              content='Start string (ex: PM_ME). This will be used as the prefix for the first username generated. If left blank, the first username will start with a random character.'
              trigger={
                <Form.Field control={Input} label='Start string:'
                onChange={this.startStringChanged}/>
              }
              on='focus'
            />
          </Form.Group>
        </Form>
        <Divider/>
        {loadingModel ? // show loading indicator when loading model
        <Loader active>Loading Model</Loader> :
        <Button color='teal' onClick={this.generateUsernames}>Create Usernames</Button>}

        {generatingText && // when generating text
        // <Loader active>Generating usernames... {numGenerated}/{numUsernames}</Loader>}
        <Loader active>Generating usernames... {numGenerated}/{numUsernames}</Loader>}

        {usernames.length > 0 && // usernames are generated
        <List>
          {usernames.map((username, index) => 
            <List.Item key={index}>{username}</List.Item>
          )}
        </List>
        }
      </Container>
    );
  }
}

export default App;
