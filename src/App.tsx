import React, { Component } from 'react';
import {Button, Container, Divider, Form, Header, Input, List, Loader, Popup, Segment} from 'semantic-ui-react'
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
      numUsernames: 5,
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

  loadModel = async () => {
    const model = await tf.loadLayersModel('https://storage.googleapis.com/reddit-username-generator/tfjs-new/model.json');
    this.setState({loadingModel: false, model: model});
  }

  
  generateUsernames = async () => {
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
          currString = '';
        }
        else {
          currString += idx2char[predictedID];
        }
      }
      this.setState({generatingText: false, usernames: textGenerated});
    });
  }

  render() {
    const { loadingModel, generatingText, usernames } = this.state;
    return (
      <Container>
        <Header size='huge' style={{paddingTop: '30px', display: 'inline-block'}}>Reddit Username Generator</Header>
        <a style={{padding: '20px'}} href='https://github.com/dchen327/reddit-username-generator'>(GitHub)</a>
        <Divider />
        <Segment size='large'>
          <p>Trained on 150,000 Reddit usernames, this LSTM-based text generator can produce novel usernames very similar to other Redditors.</p>
          <p>Since the text generation is done through TensorFlow.js, it can take up to around 1 second per username.</p>
          <p>Toggle the temperature to vary the degree of "sameness" in the generated usernames. Lower temperatures are more predictable.</p>
          <p>I apologize if there's any profanity in the generated usernames since I haven't added any filtering.</p>
          <p>TODOS: form input error handling, show progress while loading, actually check if username is taken, speed ups</p>
        </Segment>
        <Form size='big'>
          <Form.Group widths='equal'>
            <Popup 
              content='Generate this many usernames.'
              trigger={
                <Form.Field control={Input} label='Number of usernames:' placeholder='5'
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
            {/* <Popup 
              content='Start string (ex: PM_ME). This will be used as the prefix for the first username generated. If left blank, the first username will start with a random character.'
              trigger={
                <Form.Field control={Input} label='Start string:'
                onChange={this.startStringChanged}/>
              }
              on='focus'
            /> */}
          </Form.Group>
        </Form>
        <Divider/>
        {loadingModel ? // show loading indicator when loading model
        <Loader size='huge' active>Loading Model</Loader> :
        <Button color='teal' size='big' onClick={this.generateUsernames}>Create Usernames</Button>}

        {generatingText && // when generating text
        // <Loader active>Generating usernames... {numGenerated}/{numUsernames}</Loader>}
        <Loader size='huge' active>Generating usernames... (~1s per username)</Loader>}

        {usernames.length > 0 && // usernames are generated
        <Segment>
          <List size='huge'>
          {usernames.map((username, index) => 
            <List.Item key={index}>{username}</List.Item>
          )}
        </List>
        </Segment>
        }
      </Container>
    );
  }
}

export default App;
