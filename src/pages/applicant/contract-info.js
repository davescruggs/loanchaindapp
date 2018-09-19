import React, { Component, Fragment } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Redirect, hashHistory } from 'react-router';
import queryString from 'query-string';
import BlockChain from '../../lib/blockchain';
import currencyImage from '../../modules/img/currency.png';
import { Services } from '../../lib/services';
import moment  from 'moment';

class ContractInfo extends Component {

    constructor(props) {
        super(props);
        let params = queryString.parse(this.props.location.search);
        this.applicantAddress = params.applicant;
        this.loanAddress = params.loan;
        this.applicantName = params.applicantName;
        this.loggedUserInfo = JSON.parse(localStorage.getItem("accountInfo"));
        if(this.loggedUserInfo) {
            this.accountId = this.loggedUserInfo.accountId;
        }
        this.state = {
            fromAccountAddress: this.accountId,
            loanHistories: [],
            tranactionHistories: [],
            referrer: ''
        }
    }

    reditectToTransactionHitory() {
        const contractId = document.getElementById("contract-id").value;
        console.log("contractId", contractId);
        const redirectURL = '/transactions?loan='+contractId;
        window.location.assign(redirectURL);
    }
    
    render() {
        const { tranactionHistories } = this.state;
        console.log("tranactionHistories ", tranactionHistories);

        return (<div>
                    <div className="menu-bar-contracthistory col-md-12">
                        <div className="row">
                            <div className="col-md-9">
                                <div className="">
                                        <span className="text-white"> Contract </span>
                                </div>
                                <div className="col-md-6 pull-right">&nbsp;</div>
                            </div>
                            <div className="col-md-3 pull-right hide">  
                                
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12 row">
                    <div className="col-md-2">&nbsp;</div>
                    <div className="col-md-8 card">
                        <div>
                            <div className="page-header">Search Contract Details</div>
                            <div className="col-md-12 row">
                                    <div className="col-md-8 loan-label">
                                        <input type="text" id="contract-id" class="form-control form-control-sm" placeholder="" /> 
                                    </div>
                                    <div className="col-md-3 loan-content-text">
                                        <input type="button" class="btn btn-success" value="Explore" onClick={this.reditectToTransactionHitory} />
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
        );
    }
}

export default ContractInfo;