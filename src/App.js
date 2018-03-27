import React, { Component, Fragment } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import './App.css';
import { web3Connection } from './web3';
import NewApplicant from './pages/new-applicant';
import NewLoanDetails from './pages/new-loan-apply';
import UserLoanStatus from './pages/user-loan-status';
import ManageLoanStatus from './pages/manage-loan-status';

class App extends Component {

  constructor(props) {
      super(props);
      this.state = {
          connected: undefined
      }
  }

  componentDidMount() {
      web3Connection.watch((connected) => {
          this.setState({ connected });
      }).catch()
  }

  render() {

    const { connected } = this.state;

    return (

      <Fragment>
        <nav className="navbar navbar-expand-md navbar navbar-dark bg-dark">
          <a className="navbar-brand" href="#">Loan Management private blockchain</a>
        </nav>
        <div className="container">
          <div className="card-deck">
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">
                  {connected && "Loan management"}{!connected && "Connecting to Loanchain"}
                </h3>
                <BrowserRouter>
                  <Switch>
                    <Route exact path = '/' component = { NewApplicant } />
                    <Route exact path = '/loan' component = { NewLoanDetails } />
                    <Route exact path = '/loanstatus' component = { UserLoanStatus } />
                    <Route exact path = '/manageloan' component = { ManageLoanStatus } />
                  </Switch>
                </BrowserRouter>
              </div>
            </div>
          </div>
        </div>
      </Fragment>

    );
  }
}

export default App;
