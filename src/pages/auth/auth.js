import React, { Component, Fragment } from 'react';
import { Redirect, hashHistory } from 'react-router';
import ContractForm from '../../modules/contract-form';
import userDetails from '../../modules/resource/userdetails.json';
import { isError } from 'util';
const Logout = () => (
        
          <Redirect
            to={{
              pathname: "/",
            }}
          />
        );
class Auth extends Component {

    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
            isError: false,
            errorMessage: '',
            referrer: '',
            // redirect: false
            usersInfo: '',
            authenticated: false
        };
        this.onDataChange = this.onDataChange.bind(this);
        this.onDataChange1 = this.onDataChange1.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.baseURL = '';
        if (window.location.host.indexOf('localhost') == 0) {
            this.baseURL = 'http://localhost:7000';
        }
    }

    onDataChange(event) {

        this.setState({ username: event.target.value });

    }
    onDataChange1(event) {
        this.setState({ password: event.target.value });
    }

    async handleSubmit(event) {
        
        var self = this;
        this.setState({ errorMessage: '' });
        this.setState({ referrer: '' });
        event.preventDefault();
        if (!this.state.username) {
            this.setState({ errorMessage: 'User name cannot be empty' });
            return;
        } else if (!this.state.password) {
            this.setState({ errorMessage: 'Password cannot be empty' });
            return;
        }
        var loggedUser = await this.validateUser();
    }
    
    async validateUser(){
        
        const loginCredentials = {"username": this.state.username, "password":this.state.password};
        var content = '';
        (async () => {
            const rawResponse = await fetch(this.baseURL+'/auth/user/', {
                method: 'POST',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginCredentials)
            });
            content = await rawResponse.json();
            localStorage.setItem('accountInfo', JSON.stringify(content));
            let redirect = localStorage.getItem("redirectUrl");
            console.log("redirect ", redirect);
            if (content.accountName != undefined && content.accountName == "bank") {
                localStorage.setItem('isLoggedIn', true);
                const redirectURL = redirect && redirect != '/undefined' ? redirect : '/banklist?state=new';
                this.setState({ referrer: redirectURL }, { authenticated: true } );
                localStorage.setItem("redirectUrl", null);
            } else if(content.accountName != undefined && content.accountName == "broker") {
                localStorage.setItem('isLoggedIn', true);
                const redirectURL = redirect && redirect != '/undefined' ? redirect : '/brokerlist?state=new';
                this.setState({ referrer: redirectURL, authenticated: true });
                localStorage.setItem("redirectUrl", null);
            } else if(content.accountName != undefined) {
                localStorage.setItem('isLoggedIn', true);
                const redirectURL = redirect && redirect != '/undefined' ? redirect : '/loans?state=new';
                console.log("redirectURL ", redirectURL);
                this.setState({ referrer: redirectURL, authenticated: true });
                localStorage.setItem("redirectUrl", null);
                <Redirect to={{ pathname: '/loans'}} />
            } else {
                this.setState({ errorMessage: 'Username or Password is not invalid' });
                return;
            }
        })();
    }
    
    /*logout () { 
        console.log("localStorage")
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userInfo');
        localStorage.clear();
        console.log("localStorage", localStorage)
        //window.location.assign('/');     
    }*/
    logout = (e) => {
        e.preventDefault();
        console.log('The link was clicked.');
    };
    handleClick = (e) => {
        e.preventDefault();
        console.log('The link was clicked.');
    };

    async getAccountDetails() {
        await fetch(this.baseURL+'/accounts').then(
            response => response.json()).then(
            resulstData => 
           this.setState(
                { usersInfo: resulstData[0][1] }
            )
        );
        console.log(this.state.usersInfo, "User Details");
    }
    componentDidMount() {
        const { from } = this.props.location.state || { from: { pathname: "/" } };
        const pathname = from.pathname+from.search;
        console.log("Pathname", pathname)
        localStorage.setItem("redirectUrl", pathname);
    }

    render() {
        const props = {
            moduleTitle: 'Login'
        }
        if (this.state.referrer) return window.location.assign(this.state.referrer);
        return (

            <div class="mb-2 centered-box">
                <div class="card-header" id="header-create" data-toggle="collapse" data-target="#body-create" aria-expanded="false" aria-controls="body-create">
                    <p class="mb-0 py-2 font-weight-light">
                        <i class="icon-folder-create"></i> {props.moduleTitle}
                    </p>
                </div>
                <div class="form-group">
                    <form class="form-signin">
                        <div class="form-group has-feedback no-padding">
                            <input type="text" id="uname" class="form-control" required placeholder="Username" value={this.state.username}
                                onChange={this.onDataChange} />
                        </div>
                        <div class="form-group has-feedback">
                            <input type="password" id="check" class="form-control" required placeholder="Password" value={this.state.password}
                                onChange={this.onDataChange1} />
                        </div>
                        {this.state.errorMessage && <div class="error-msg"> {this.state.errorMessage}</div>}
                        <input type="submit" onClick={this.handleSubmit} className="btn bts btn-primary" value="Submit" />
                    </form>
                </div>
            </div>
        );
    }
}
export default Auth;
