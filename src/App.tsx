import React, { Component } from 'react';
import {Button, Container, Divider, Grid, Header, Input, List, Loader, Popup} from 'semantic-ui-react'
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
      numUsernames: 0,
      temperature: 0,
      startString: '',
      numGenerated: 0,
      usernames: [],
      model: null,
    };
  }
  
  timeout(delay: number) {
      return new Promise( res => setTimeout(res, delay) );
  }

  componentDidMount() {
    this.loadModel();
  }

  loadModel = async () => {
    console.log('loading model');
    // await this.timeout(300);
    const model = await tf.loadLayersModel('../assets/tfjs/model.json');
    console.log('model loaded');
    this.setState({loadingModel: false});
  }

  generateUsernames = async () => {
    console.log('generating usernames')
    this.setState({generatingText: true});
    await this.timeout(300);
    console.log('usernames generated')
    let usernames = ['text ', 'username 2', 'hello world'];
    this.setState({generatingText: false, usernames: usernames});
  }

  render() {
    return (
      <Container>
        <Header size='huge' style={{paddingTop: '20px'}}>Reddit Username Generator</Header>
        <Grid columns={3}>
          <Grid.Column>
            <Popup 
              content='Generate this many usernames.'
              trigger={
                <Input label='Number of usernames:' placeholder='20'></Input>
              }
              on='focus'
            />
          </Grid.Column>
          <Grid.Column>
            <Popup 
              content='Temperatures are between 0 and 1, with lower temperatures producing more predictable text and higher temperatures resulting in more surprising text.'
              trigger={
                <Input label='Temperature:' placeholder='0.5'></Input>
              }
              on='focus'
            />
          </Grid.Column>
          <Grid.Column>
            <Popup 
              content='Start string (ex: PM-ME). This will be used as the prefix for the first username generated. If left blank, the first username will start with a random character.'
              trigger={
                <Input label='Start string:'></Input>
              }
              on='focus'
            />
          </Grid.Column>
        </Grid>
        <Divider/>
        {this.state.loadingModel ? // show loading indicator when loading model
        <Loader active>Loading Model</Loader> :
        <Button color='teal' onClick={this.generateUsernames}>Create Usernames</Button>}

        {this.state.generatingText && // when generating text
        <Loader active>Generating usernames... {this.state.numGenerated}/{this.state.numUsernames}</Loader>}

        {this.state.usernames.length > 0 && // usernames are generated
        <List>
          {this.state.usernames.map((username) => 
            <List.Item>{username}</List.Item>
          )}
        </List>
        }
      </Container>
    );
  }
}

export default App;
