import React, { Component, Fragment } from 'react';
import { Redirect } from 'react-router';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import ContractForm from '../../modules/contract-form';
import userList from '../../modules/resource/applicantlist.json';
import Services from '../../lib/services';

class ApplicantList extends Component{
    
    constructor(props) {
        super(props);
        console.log("this.state ", props);
        this.state = {
            usersList: '',
            loanDetails: '',
        };
        this.loggedUserInfo = JSON.parse(localStorage.getItem("accountInfo"));
        if(this.loggedUserInfo) {
            this.accountname = this.loggedUserInfo.accountName;
        }
        this.state = {
            usersList: '',
            loanDetails: '',
            accountName: this.accountname
        };
        this.baseURL = '';
        if (window.location.host.indexOf('localhost') == 0) {
            this.baseURL = 'http://localhost:7000';
        }
        //this.getApplicantDetails = this.getApplicantDetails();
        //console.log("applicantDetails test", this.state.userList);
        this.getApplicantDetails();
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

    async getApplicantDetails() {
        console.log("getLoanDetails");
        let accountname = this.state.accountName;
        await fetch(this.baseURL+'/applicants/'+this.state.accountName).then(
            response => response.json() ).then(
            resulstData => this.setState(
                { loanDetails: resulstData[accountname] }
               
        )).catch((err) => {
            console.log("error", err);
       });
        console.log("existingApplicantInfo", typeof this.state.loanDetails);
        console.log("userList", typeof userList);
    }
    
render() {
    
    const props = { 
        moduleTitle: 'Applicant List'
    },
    { loanDetails } = this.state
    let applicantLists;
    if (loanDetails) {
        applicantLists = Object.values(loanDetails); //Converting an Object into an array
    }

    return (
        <div className="card mb-2 col-md-10 list-left">
        <div className="form-group">
            <div> 
                <h5 className=" mb-0 py-2 font-weight-light">{props.moduleTitle}
                    <span className="pull-right">
                        <a href="/newapplicant" className="btn btn-xs btn-primary" ><i className="fa fa-plus"></i> Create </a>
                    </span>
                </h5>
            </div>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Amount</th>
                        <th>Reference</th> 
                        <th>Type</th>
                        <th>Repayment</th> 
                        <th>Status</th>
                    </tr>
                </thead>
                    { applicantLists ?
                    <tbody>
                        { 
                            applicantLists.map(applicantList => {
                            return (
                            <tr> 
                            <td>{applicantList.name}</td>
                            <td>{applicantList.loanAmount}</td>
                            <td>
                                {
                                    (applicantList.loanAddress && applicantList.loanAddress != "") ?
                                        (<Link to={'/loanview?loan=' + applicantList.loanAddress}>{applicantList.loanAddress}</Link>)
                                        :
                                        (<Link to={'/loanview?applicant=' + applicantList.applicantAddress}>{applicantList.applicantAddress}</Link>)
                                }
                            </td>
                            <td>{applicantList.loanType}</td>
                            <td>{applicantList.loanPeriod}</td>
                            <td>{applicantList.status}</td>
                            </tr>
                            )
                        })
                        }
                    </tbody> :
                    <tbody>
                    <tr>
                        <td colSpan="10" className="text-center">No Records..</td>
                    </tr>
                    </tbody>
                    }
        </table>
      </div>
      </div>
    );
   }
}
export default ApplicantList;