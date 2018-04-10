import React, { Component, Fragment } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import background from './modules/img/background.png';
import logo from './modules/img/logo.png';
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
    const styles = {
        backgroundImage: "url(" + background + ")"
    };
    return (
    <div className="main pb-3" style={ styles }>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark py-2 py-lg-0" role="navigation">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">
                    <img src={logo} alt="" class="float-left mr-2" />Loan Management private blockchain
                </a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar-collapse" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbar-collapse">
                    <ul class="navbar-nav mt-2 mx-lg-3 my-lg-0 font-weight-light">
                        <li class="nav-item active">
                            <a href="/" class="nav-link p-2 p-lg-3">Loan Application</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        <div className="container mt-4">
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
    );
  }
}

export default App;
