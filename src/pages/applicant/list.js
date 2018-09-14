import React, { Component, Fragment } from 'react';
import { Redirect } from 'react-router';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import ContractForm from '../../modules/contract-form';
import userList from '../../modules/resource/applicantlist.json';
import Services from '../../lib/services';
import BlockChain from '../../lib/blockchain';
import queryString from 'query-string';
import currencyImage from '../../modules/img/currency.png';

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
        this.loggedUserInfo = JSON.parse(localStorage.getItem("accountInfo"));
        if(this.loggedUserInfo) {
            this.accountId = this.loggedUserInfo.accountId;
        }
        let params = queryString.parse(this.props.location.search);
        this.status = params.state;
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
    let newCount = 0, inprogressCount = 0, approvedCount = 0;
    let applicantDetails = [];
    const activeClassNew = this.status === "new" ? "active" : "";
    const activeClassInprogress = this.status === "inprogress"  ? "active" : "";
    const activeClassApproved = this.status === "approved"  ? "active" : "";
    if (loanDetails) {
        applicantLists = Object.values(loanDetails); //Converting an Object into an array
        loanDetails.forEach(applicantInfo => {
            if(applicantInfo.status == 'New') {
                newCount = newCount + 1;
            } else if(applicantInfo.status == 'Inprogress') {
                inprogressCount = inprogressCount + 1; 
            } else if(applicantInfo.status == 'Approved') {
                approvedCount = approvedCount + 1; 
            }
            if(this.status == applicantInfo.status.toLowerCase()) {
                applicantDetails.push(applicantInfo)
            }
        });
    }
    return (
        <div>
            <div className="menu-bar col-md-12">
                <div className="row">
                        <div className="col-md-9">
                            <div className="">
                                    <span className="text-white"> Applications </span>
                            </div>
                            <div className="col-md-6 pull-right">
                                <ul className="list-inline ">
                                    <li className={"list-inline-item nav-menu-item " + activeClassNew}>
                                        <a href="/loans?state=new" className="nav-menu-link"> New ({newCount})</a>
                                    </li>
                                    <li className={"list-inline-item nav-menu-item " + activeClassInprogress}>
                                        <a href="/loans?state=inprogress" className="nav-menu-link">Inprogress ({inprogressCount})</a>
                                    </li>
                                    <li className={"list-inline-item nav-menu-item " + activeClassApproved}>
                                        <a href="/loans?state=approved" className="nav-menu-link">Approved ({approvedCount})</a>
                                    </li> 
                                </ul>
                            </div>
                        </div>
                    <div className="col-md-3 pull-right">  
                        <div className="pull-right text-white">
                            <img src={currencyImage} className="" alt="" /> 
                            &nbsp;  Balance : 
                            ( { BlockChain.getUserBalance(this.accountId)} Tokens)
                        </div>
                    </div>
                </div>
            </div>
        <div className="mb-2 col-md-10 list-left">
         <div> 
                <span className="pull-right">
                    <a href="/newapplicant" className="btn btn-xs btn-primary" ><i className="fa fa-plus"></i> APPLY </a>
                </span>
        </div>
            <table className="table">
                <thead className="thead-light">
                    <tr>
                        <th>Name</th>
                        <th>Amount</th>
                        <th>Reference</th> 
                        <th>Type</th>
                        <th>Repayment</th> 
                        <th>Status</th>
                    </tr>
                </thead>
                    { applicantDetails.length > 0 ?
                    <tbody className="tbody-light">
                        { 
                            applicantDetails.map(applicantList => {
                            return (
                            <tr> 
                            <td>{applicantList.name}</td>
                            <td>{applicantList.loanAmount}</td>
                            <td>
                                {
                                    (applicantList.loanAddress && applicantList.loanAddress != "") ?
                                        (<Link to={'/loanview?loan=' + applicantList.loanAddress+'&applicantName='+applicantList.name}>{applicantList.loanAddress}</Link>)
                                        :
                                        (<Link to={'/loanview?applicant=' + applicantList.applicantAddress+'&applicantName='+applicantList.name}>{applicantList.applicantAddress}</Link>)
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
                    <tbody className="tbody-light">
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