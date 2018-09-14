import React, { Component, Fragment } from 'react';
import LoanStatus from '../../modules/loan-status';
import { Link } from 'react-router-dom';
import LoanView from '../../modules/loan-status/LoanView';
import ApplicantView from '../../modules/loan-status/ApplicantView';
import queryString from 'query-string';
import BlockChain from '../../lib/blockchain';
import currencyImage from '../../modules/img/currency.png';

class BrokerLoanView extends Component {

    constructor(props) {
        super(props);

        let params = queryString.parse(this.props.location.search);
        this.applicantAddress = params.applicant;
        this.account = params.account;
        this.loanAddress = params.loan;
        this.brokerView = true;
        this.applicantName = params.applicantName;
        this.loggedUserInfo = JSON.parse(localStorage.getItem("accountInfo"));
        if(this.loggedUserInfo) {
            this.accountId = this.loggedUserInfo.accountId;
        }
    }

    render() {
        return (<div>
                    <div className="menu-bar col-md-12">
                        <div className="row">
                                <div className="col-md-9">
                                    <div className="">
                                            <span className="text-white"> Applications > {this.applicantName} </span>
                                    </div>
                                    <div className="col-md-6 pull-right">&nbsp;</div>
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
                    <div className="col-md-12 row">
                        <div className="col-md-3">&nbsp;</div>
                        <div className="col-md-6 card">
                        <Fragment>
                            {(this.applicantAddress) ?
                                (<ApplicantView applicantAddress = {this.applicantAddress} accountName = {this.account} brokerView = { this.brokerView } />)
                                :
                                (<LoanView loanAddress = {this.loanAddress} />)
                            }
                        </Fragment>
                        </div>
                    </div>
                </div>
        );
    }
}

export default BrokerLoanView;
