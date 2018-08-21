import React, { Component, Fragment } from 'react';
import { Redirect } from 'react-router';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import ContractForm from '../../modules/contract-form';
import userList from '../../modules/resource/applicantlist.json';
import Services from '../../lib/services';
import axios from 'axios';

class BrokerApplicantList extends Component{
    
    constructor(props) {
        super(props);
        this.state = {
            usersList: '',
            loanDetails: '',
        };
        this.baseURL = '';
        if (window.location.host.indexOf('localhost') == 0) {
            this.baseURL = 'http://localhost:7000';
        }
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
                        <th>LoanReference</th> 
                        <th>Type</th>
                        <th>Repayment</th> 
                        <th>Status</th>
                    </tr>
                </thead>
                    { applicants ?
                    <tbody>
                        { 
                            applicants.map(applicant => {
                            return (
                            <tr>
                            <td>{applicant.name}</td>
                            <td>{applicant.loanAmount}</td>
                            <td>
                                {(applicant.loanAddress && applicant.loanAddress != "") ?
                                    (<Link to={'/brokerview?loan=' + applicant.loanAddress}>{applicant.loanAddress}</Link>)
                                    :
                                    (<Link to={'/brokerview?applicant=' + applicant.applicantAddress+'&account='+applicant.user}>{applicant.applicantAddress}</Link>)
                                }
                            </td>
                            <td>{applicant.loanType}</td>
                            <td>{applicant.loanPeriod}</td>
                            <td>{applicant.status}</td>
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
export default BrokerApplicantList;