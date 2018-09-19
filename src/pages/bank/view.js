import React, { Component, Fragment } from 'react';
import LoanStatus from '../../modules/loan-status';
import { Link } from 'react-router-dom';
import LoanView from '../../modules/loan-status/LoanView';
import queryString from 'query-string';

class BankLoanView extends Component {

    constructor(props) {
        super(props);

        //TODO find the right way to find the key from search
        let params = queryString.parse(this.props.location.search);
        this.applicantAddress = params.applicant;
        this.loanAddress = params.loan;
        this.applicantAddress = params.applicant;
        this.accountName = params.accountName;
        this.bankView = true;
        this.organization = params.org;
        this.transaction = params.tx;
    }

    render() {
        return (
        <Fragment>
            <LoanView loanAddress = {this.loanAddress} org = {this.organization} tx = {this.transaction} accountName = {this.accountName} applicantAddress = {this.applicantAddress}  bankView = { this.bankView }/>
        </Fragment>);
    }
}

export default BankLoanView;
