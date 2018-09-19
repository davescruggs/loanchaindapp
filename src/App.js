import React, { Component, Fragment } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
//import background from './modules/img/background.png';
import background from './modules/img/login_bg.jpg';
import logo from './modules/img/logo.png';
import logoExplorer from './modules/img/logo-exp.png';
import userAvatar from './modules/img/avatar.png';
import ofslogo from './modules/img/ofs.png';
import currencyImage from './modules/img/currency.png';
import './App.css';
import { web3Connection } from './web3';
import NewApplicant from './pages/applicant/create';
import NewLoanDetails from './pages/applicant/create-loan';
import ApplicantList from './pages/applicant/list';
import UserLoanStatus from './pages/user-loan-status';
import ManageLoanStatus from './pages/manage-loan-status';
import Auth from './pages/auth/auth';
import ApplicantLoanView from './pages/applicant/view';
import BrokerApplicantList from './pages/broker/list';
import BrokerLoanView from './pages/broker/view';
import BankApplicantList from './pages/bank/list';
import BankLoanView from './pages/bank/view';
import Manage from './pages/bank/manage';
import ContractCreate from './pages/bank/contractCreate';
import Contract from './pages/bank/contract';
import { BlockChain } from './lib/blockchain';
import RestApproval from './pages/bank/restApproval';
import queryString from 'query-string';
import bankAvatar from './modules/img/bank.png';
import brokerAvatar from './modules/img/broker.png';
import ApplicantLoanHistory from './pages/applicant/view-history';
import ViewTransaction from './pages/applicant/view-transaction';
import ContractInfo from './pages/applicant/contract-info';

const checkAuth = () => {
    const isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn'));
    if (!isLoggedIn) {
        return false;
    }
    return true;
}
const AuthRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => (
        checkAuth() ? (
            <Component {...props}/>
         ) : (
             <Redirect to={ { pathname: '/login', state: { from: props.location }} } />
         )
    )} />
)
console.log("checkAuth ", checkAuth());
const PublicRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => (
        !checkAuth() ? (
            <Redirect to={{ pathname: '/login'}} />
         ) : (
            <Redirect to={{ pathname: '/login'}} />
         )
    )} />
)

class App extends Component {

    constructor(props) {
        super(props);
        this.accountname = '';
        this.loggedUserInfo = JSON.parse(localStorage.getItem("accountInfo"));
        console.log("loggedUserInfo", this.loggedUserInfo);
        if(this.loggedUserInfo) {
            this.accountname = this.loggedUserInfo.accountName;
            this.accountId = this.loggedUserInfo.accountId;
        }
        this.state = {
            connected: undefined,
            loggedUser: this.accountname,
            statusGroup: false
        }
        
        console.log("loggedUserInfo", props);
    }

    componentDidMount() {
        let params = queryString.parse(this.props.location);
        console.log("params", params);
        const location =  window.location.pathname;
        if(location == '/viewtransaction' || location == '/transactions' || location == '/contracts') {
            this.setState({ statusGroup: true });
        }
        web3Connection.watch((connected) => {
            this.setState({ connected });
        }).catch()
    }

    myFunction() {
        document.getElementById("myDropdown").classList.toggle("show");
    }

    logout = (e) => {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('accountInfo');
        window.location.assign('/');
        <Redirect to={{ pathname: '/'}} /> 
    };
    
    // Close the dropdown if the user clicks outside of it
    /*window.onclick = function(e) {
      if (!e.target.matches('.dropbtn')) {
        var myDropdown = document.getElementById("myDropdown");
          if (myDropdown.classList.contains('show')) {
            myDropdown.classList.remove('show');
          }
      }
    }*/

    render() {

        const { connected, statusGroup } = this.state;
        const styles = {
            //backgroundImage: "url(" + background + ")"
            backgroundColor: "#F1F2F5"
        },
        
        { loggedUser } = this.state;
        var redirectURL = '/';
        var avatar = userAvatar;
        if(loggedUser && loggedUser == 'broker') {
            redirectURL = '/brokerlist?state=new';
            avatar = brokerAvatar;
        } else if(loggedUser && loggedUser == 'bank') {
            redirectURL = '/banklist?state=new';
            avatar = bankAvatar;
        } else if(loggedUser && loggedUser != 'broker' && loggedUser != 'bank') {
            redirectURL = '/loans?state=new';
        } else {
            //localStorage.setItem('accountInfo', JSON.stringify(content));
            redirectURL = '/login';
        }

        let title = 'OFS Loan Management Portal';
        let bcLogo = logo;
        if(statusGroup == true) {
            title = 'OFS Contract Transactions Explorer';
            bcLogo = logoExplorer;
        }

        console.log("loggedUser ", loggedUser);
        console.log("statusGroup ", statusGroup);
        return (
            <div className="main pb-3" style={styles}>
                <nav className="navbar navbar-expand-lg bg-dark py-2 py-lg-0" role="navigation">
                    <img src={ofslogo} alt="" className="float-left mr-2 " />
                    <div className="container-fluid">
                        <a className="navbar-brand col-md-4" href="#">
                            <img src={bcLogo} alt="" className="float-left mr-2 " />
                            <span class="header-title">{title}</span>
                        </a>
                        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar-collapse" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbar-collapse">
                            <ul className="navbar-nav mt-2 mx-lg-3 my-lg-0 font-weight-light">
                                {(loggedUser != 'broker' && loggedUser != 'bank' && statusGroup == false &&
                                <li className="nav-item loan-text">
                                    <a href="/loans?state=new" className="nav-link p-2 p-lg-3">Loans</a>
                                </li>
                                )}
                                {(loggedUser == 'broker' &&
                                <li className="nav-item loan-text">
                                    <a href="/brokerlist?state=new" className="nav-link p-2 p-lg-3">Applications</a>
                                </li>
                                )}
                                {(loggedUser == 'bank' &&
                                <li className="nav-item loan-text active">
                                    <a href="/banklist?state=new" className="nav-link p-2 p-lg-3">Applications</a>
                                </li> 
                                )}
                                {(loggedUser == 'bank' &&
                                <li className="nav-item loan-text">
                                    <a href="/contractlist" className="nav-link p-2 p-lg-3">Loan Programs</a>
                                </li>
                                )}
                            </ul>
                        </div>
                        {(checkAuth() && statusGroup == false &&
                        <div class="dropdown">
                            <div class="dropdown-toggle" data-toggle="dropdown">
                                <img src={avatar} className="img-circle user-image" alt="User Image" />
                                <a href="#" className="user-login-name">{ this.accountname }  <span class="caret"></span></a>
                            </div>
                            <ul class="dropdown-menu">
                                <li class="user-header">
                                    <img src={avatar} class="img-circle user-image" alt="User Image" />
                                    <p className="user-login-name"> { this.accountname }</p>
                                </li>
                                <li class="user-footer text-center ">
                                    <div>
                                        <a href="#" onClick={this.logout} class="btn btn-default btn-flat ">Sign out</a>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        )}
                    </div>
                </nav>
                <div className="">
                    <BrowserRouter>
                        <Switch>
                            { (checkAuth) &&
                                <Route exact path="/" render={() => (
                                    (redirectURL && redirectURL != '/') ? (
                                        <Redirect to={redirectURL}/>
                                    ) : (
                                        <Redirect to={redirectURL}/>
                                    )
                                )}/>
                            }
                            <Route exact path='/login' component={Auth} />
                            <AuthRoute exact path='/loans' component={ApplicantList} render={props => <ApplicantList {...props}/>}/>
                            <AuthRoute exact path='/loanview' component={ApplicantLoanView} />
                            <AuthRoute exact path='/brokerlist' component={BrokerApplicantList} />
                            <AuthRoute exact path='/brokerview' component={BrokerLoanView} />
                            <AuthRoute exact path='/newapplicant' component={NewApplicant} />
                            <AuthRoute exact path='/loan' component={NewLoanDetails} />
                            <AuthRoute exact path='/loanstatus' component={UserLoanStatus} />
                            <AuthRoute exact path='/manageloan' component={ManageLoanStatus} />
                            <AuthRoute exact path='/banklist' component={BankApplicantList} render={props => <BankApplicantList {...props}/>}/>
                            <AuthRoute exact path='/approveloan' component={Manage} />
                            <AuthRoute exact path='/contractlist' component={Contract} />
                            <AuthRoute exact path='/contractcreate' component={ContractCreate} />
                            <AuthRoute exact path='/restapproval' component={RestApproval} />
                            <Route exact path='/transactions' component={ApplicantLoanHistory} />
                            <Route exact path='/viewtransaction' component={ViewTransaction} />
                            <Route exact path='/contracts' component={ContractInfo} />
                        </Switch>
                    </BrowserRouter>
                </div>
            </div>
        );
    }
}
export default App;
