import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import './App.css';
import Room from './components/Room'
import CreateRoom from './components/createRoom';

function App() {
  return (
    <Router>
      <Switch>
        <Route path='/' exact component={CreateRoom} />
        <Route path='/room/:roomId' component={Room} />
      </Switch>
    </Router>
  );
}

export default App;
