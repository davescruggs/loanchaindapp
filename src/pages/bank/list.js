import React, { Component, Fragment } from 'react';
import { Redirect } from 'react-router';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import ContractForm from '../../modules/contract-form';
import userList from '../../modules/resource/applicantlist.json';
import Services from '../../lib/services';
import axios from 'axios';

class BankApplicantList extends Component{
    
    constructor(props) {
        super(props);
        this.loggedUserInfo = JSON.parse(localStorage.getItem("userInfo"));
        if(this.loggedUserInfo) {
            this.accountname = this.loggedUserInfo.accountName;
        }
        this.state = {
            usersList: '',
            loanDetails: '',
            accountname: this.accountname,
            applicants: []
        };
        this.baseURL = '';
        if (window.location.host.indexOf('localhost') == 0) {
            this.baseURL = 'http://localhost:7000';
        }
    }

    /*async getApplicantDetails () {
        
        Services.getApplicantDetails().then(function(result) {
            console.log("welcome result", result) //will log results.
            this.setState(
                { usersList: result }
            )
        });
        console.log("welcome result", this.state.userList);
    }*/
    /*componentDidMount(){
        axios.get(this.baseURL +'/applicants')
        .then(response => {
            var obj = response.data;
            var applicants = [];
            
            for (var key in obj) {
                var arr = obj[key][key];
                console.log("objject KEY ",key)
                for (var i in arr) {
                    applicants.push(arr[i]);
                }
            }
            this.setState({ applicants: applicants });
        })
    }*/
    async componentDidMount(){
        
        await axios.get(this.baseURL +'/applicants')
        .then(response => {
            var aplicantLists = response.data;
            var applicants = [];
            console.log(aplicantLists)
            for (var userName in aplicantLists) {
                var aplicantList = aplicantLists[userName][userName];
                console.log("objject KEY ",userName)
                for (var i in aplicantList) {
                    aplicantList[i]['user'] = userName;
                    applicants.push(aplicantList[i]);
                }
            }
            console.log("applicants applicants ",applicants)
            this.setState({ applicants: applicants });
        })
    }
    
render() {
    
    const props = { 
        moduleTitle: 'Applicant List'
    },
    { applicants } = this.state
    console.log("applicants  ",applicants.length)
    return (
        <div class="card mb-2 col-md-10 list-left">
        <div class="form-group">
            <div> 
                <h5 class=" mb-0 py-2 font-weight-light">{props.moduleTitle}
                </h5>
            </div>
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Amount</th>
                        <th>Loan Reference</th> 
                        <th>Type</th>
                        <th>Repayment</th> 
                        <th>Status</th> 
                        <th>SSN</th> 
                    </tr>
                </thead>
                    { (applicants) && (applicants.length != 0) ?
                    <tbody>
                        { 
                            applicants.map(loanDetail => {
                            return (
                            <tr>
                            <td>{loanDetail.name}</td>
                            <td>{loanDetail.loanAmount}</td>
                            <td><Link to={'/approveloan?loan=' + loanDetail.loanAddress+'&account='+loanDetail.user+'&applicant='+loanDetail.applicantAddress}>{loanDetail.loanAddress}</Link></td>
                            <td>{loanDetail.loanType}</td>
                            <td>{loanDetail.loanPeriod}</td>
                            <td>{loanDetail.status}</td>
                            <td>{loanDetail.ssn}</td>
                            </tr>
                            )
                        })
                        }
                    </tbody> :
                    <tr>
                        <td colspan="10" class="text-center">No Records..</td>
                    </tr>
                    }
        </table>
      </div>
      </div>
    );
   }
}
export default BankApplicantList;