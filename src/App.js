import {Button, Container, Grid, Header, Input} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

function App() {
  return (
    <Container>
      <Header>Reddit Username Generator</Header>
      <Grid columns={3}>
        <Grid.Column>
          <Input focus placeholder='8'></Input>
        </Grid.Column>
        <Grid.Column>
          <Input focus placeholder='11'></Input>
        </Grid.Column>
        <Grid.Column>
          <Input focus placeholder='12'></Input>
        </Grid.Column>
      </Grid>
    </Container>
  );
}

export default App;
