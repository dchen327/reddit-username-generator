import React, { Component } from 'react';
import { Button, Container, Divider, Form, Header, Input, List, Loader, Popup, Segment } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

type Props = {};

type State = {
  loadingModel: boolean,
  generatingText: boolean,
  numUsernames: number,
  temperature: number,
  startString: string,
  numGenerated: number,
  usernames: Array<string>,
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
    };
  }

  timeout(delay: number) {
    return new Promise(res => setTimeout(res, delay));
  }

  numUsernamesChanged = (e, { value }) => {
    this.setState({ numUsernames: value });
  }

  temperatureChanged = (e, { value }) => {
    this.setState({ temperature: value });
  }

  startStringChanged = (e, { value }) => {
    if (value === '') {
      this.setState({ startString: '\n' });
    }
    else {
      this.setState({ startString: value });
    }
  }

  componentDidMount() {
    this.loadModel();
  }

  loadModel = async () => {
    fetch('/load').then(res => res.json()).then(data => {
      this.setState({ loadingModel: false });
    })
  }



  generateUsernames = async () => {
    this.setState({ generatingText: true, numGenerated: 0 }, async () => {
      const { numUsernames, temperature, startString } = this.state;
      fetch('/generate', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          'numUsernames': numUsernames,
          'temperature': temperature,
          'startString': startString,
        })
      })
        .then(res => res.json()).then(data => {
          this.setState({ generatingText: false, usernames: data });
        })
    });
  }

  render() {
    const { loadingModel, generatingText, usernames } = this.state;
    return (
      <Container>
        <Header size='huge' style={{ paddingTop: '30px', display: 'inline-block' }}>Reddit Username Generator</Header>
        <a style={{ padding: '20px' }} href='https://github.com/dchen327/reddit-username-generator'>(GitHub)</a>
        <Divider />
        <Segment size='large'>
          <p>Trained on 400,000 Reddit usernames, this LSTM-based text generator can produce novel usernames very similar to other Redditors.</p>
          <p>Since the text generation is done in browser through TensorFlow.js, it can take up to around 1 second per username.</p>
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
                  onChange={this.numUsernamesChanged} />
              }
              on='focus'
            />
            <Popup
              content='Temperatures are between 0 and 1, with lower temperatures producing more predictable text and higher temperatures resulting in more surprising text.'
              trigger={
                <Form.Field control={Input} label='Temperature:' placeholder='0.5'
                  onChange={this.temperatureChanged} />
              }
              on='focus'
            />
            <Popup
              content='Start string (ex: PM_ME). This will be used as the prefix for the first username generated. If left blank, the first username will start with a random character.'
              trigger={
                <Form.Field control={Input} label='Start string:'
                  onChange={this.startStringChanged} />
              }
              on='focus'
            />
          </Form.Group>
        </Form>
        <Divider />
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
