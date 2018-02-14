import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import './App.css';
import NewApplicant from './modules/new-applicant';

class App extends Component {
  render() {
    return (

      <div>
        <div className = "jumbotron jumbotron-fluid">
          <div className = "container">
            <h2 className = "display-4">Loan Management private blockchain</h2>            
            <p className = "lead">Loan management</p>
          </div>
        </div>

        <BrowserRouter>
            <Switch>
                <Route exact path='/' component = { NewApplicant } />
                <Route exact path='/applicant' component = { NewApplicant } />
            </Switch>
        </BrowserRouter>

      </div>

    );
  }
}

export default App;
