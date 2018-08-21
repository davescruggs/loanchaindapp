import React, { Component, Fragment } from 'react';
import LoanStatus from '../../modules/loan-status';
import { Link } from 'react-router-dom';
import LoanView from '../../modules/loan-status/LoanView';
import ApplicantView from '../../modules/loan-status/ApplicantView';
import queryString from 'query-string';

class ApplicantLoanView extends Component {

    constructor(props) {
        super(props);
        let params = queryString.parse(this.props.location.search);
        this.applicantAddress = params.applicant;
        this.loanAddress = params.loan;
    }

    render() {
        return (
        <Fragment>
            {(this.applicantAddress) ?
                (<ApplicantView applicantAddress = {this.applicantAddress} />)
                :
                (<LoanView loanAddress = {this.loanAddress} />)
            }
        </Fragment>);
    }
}

export default ApplicantLoanView;
