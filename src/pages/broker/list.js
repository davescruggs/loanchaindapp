import React, { Component, Fragment } from 'react';
import { Redirect } from 'react-router';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import ContractForm from '../../modules/contract-form';
import userList from '../../modules/resource/applicantlist.json';
import Services from '../../lib/services';
import axios from 'axios';
import BlockChain from '../../lib/blockchain';
import queryString from 'query-string';
import currencyImage from '../../modules/img/currency.png';

class BrokerApplicantList extends Component{
    
    constructor(props) {
        super(props);
        this.state = {
            usersList: '',
            loanDetails: '',
            applicants: []
        };
        this.baseURL = '';
        if (window.location.host.indexOf('localhost') == 0) {
            this.baseURL = 'http://localhost:7000';
        }
        this.loggedUserInfo = JSON.parse(localStorage.getItem("accountInfo"));
        if(this.loggedUserInfo) {
            this.accountId = this.loggedUserInfo.accountId;
        }
        let params = queryString.parse(this.props.location.search);
        this.status = params.state;
    }
    
    componentDidMount(){
        
        axios.get(this.baseURL +'/applicants')
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
    let newCount = 0, inprogressCount = 0, approvedCount = 0;
    console.log("this.props.location", this.props.location);

    const activeClassNew = this.status === "new" ? "active" : "";
    const activeClassInprogress = this.status === "inprogress"  ? "active" : "";
    const activeClassApproved = this.status === "approved"  ? "active" : "";

    let applicantDetails = [];
    if (applicants) {
        applicants.forEach(applicantInfo => {
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
    console.log("applicantDetails", applicantDetails);
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
                                        <a href="/brokerlist?state=new" className="nav-menu-link"> New ({newCount})</a>
                                    </li>
                                    <li className={"list-inline-item nav-menu-item " + activeClassInprogress}>
                                        <a href="/brokerlist?state=inprogress" className="nav-menu-link">Inprogress ({inprogressCount})</a>
                                    </li>
                                    <li className={"list-inline-item nav-menu-item " + activeClassApproved}>
                                        <a href="/brokerlist?state=approved" className="nav-menu-link">Approved ({approvedCount})</a>
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
                <div className="form-group">
                    <div className="hide"> 
                        <h5 className=" mb-0 py-2 font-weight-light">{props.moduleTitle}
                        </h5>
                    </div>
                    <table className="table">
                        <thead className="thead-light">
                            <tr>
                                <th>Name</th>
                                <th>Amount</th>
                                <th>LoanReference</th> 
                                <th>Type</th>
                                <th>Repayment</th> 
                                <th>Status</th>
                            </tr>
                        </thead>
                            { applicantDetails.length > 0 ?
                            <tbody className="tbody-light">
                                { 
                                    applicantDetails.map(applicant => {
                                    return (
                                    <tr>
                                    <td>{applicant.name}</td>
                                    <td>{applicant.loanAmount}</td>
                                    <td>
                                        {(applicant.loanAddress && applicant.loanAddress != "") ?
                                            (<Link to={'/brokerview?loan=' + applicant.loanAddress+'&applicantName='+applicant.name}>{applicant.loanAddress}</Link>)
                                            :
                                            (<Link to={'/brokerview?applicant=' + applicant.applicantAddress+'&account='+applicant.user+'&applicantName='+applicant.name}>{applicant.applicantAddress}</Link>)
                                        }
                                    </td>
                                    <td>{applicant.loanType}</td>
                                    <td>{applicant.loanPeriod}</td>
                                    {( applicant.status == 'New' && 
                                        <td> <span className="btn btn-xs status-btn btn-info">{applicant.status}</span></td>
                                    )}
                                    {( applicant.status == 'Inprogress' && 
                                        <td> <span className="btn btn-xs status-btn btn-primary">{applicant.status}</span></td>
                                    )}
                                    {( applicant.status == 'Approved' && 
                                        <td> <span className="btn btn-xs status-btn btn-success">{applicant.status}</span></td>
                                    )}
                                    </tr>
                                    )
                                })
                                }
                            </tbody> :
                            <tbody className="tbody-light">
                                <tr>
                                    <td colspan="10" class="text-center">No Records..</td>
                                </tr>
                            </tbody>

                            }
                        </table>
                </div>
            </div>
      </div>
    );
   }
}
export default BrokerApplicantList;