import React, { Component } from 'react';
import LoanStatus from '../../modules/loan-status';


class ManageLoanStatus extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loanInfo: undefined,
            applicant: undefined,
            loanProgram: undefined
        }

        //TODO find the right way to find the key from search    
        this.loanAddress = props.location.search.replace('?loan=','');

        this.onLoanStatusNotified = this.onLoanStatusNotified.bind(this);
    }

    onLoanStatusNotified(loanInfo, applicant, loanProgram) {
        return new Promise((resolve, reject) => {
            this.setState({
                loanInfo,
                applicant,
                loanProgram
            });
        });
    }

    render() {

        const {
            loanInfo,
            applicant,
            loanProgram            
        } = this.state;
        
        return <div>
            <LoanStatus loanAddress = {this.loanAddress} onLoanStatusNotified = { this.onLoanStatusNotified } />
            {loanInfo && "Loan Info Found"}
            {applicant && "Applicant Info Found"}
            {loanProgram && "Loan Program Info Found"}
        </div>
    }
}

export default ManageLoanStatus;