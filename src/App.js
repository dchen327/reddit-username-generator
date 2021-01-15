import React, { Component } from "react";
import {Button, Container, Dimmer, Divider, Grid, Header, Input, Label, Loader, Popup, Segment} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingModel: false,
      generatingText: false,
    };
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
        {this.state.loadingModel ? // show loading indicator
        <Loader active>Loading Model</Loader> :
        <Button color='teal'>Create Usernames</Button>}
      </Container>
    );
  }
}

export default App;
