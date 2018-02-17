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
            <p align = "center">
                <input type = "button" className = "btn btn-primary" value = "Approve" disabled = { loanInfo === undefined } />&nbsp;&nbsp;&nbsp;
                <input type = "button" className = "btn btn-primary" value = "Verify Applicant" disabled = { applicant === undefined } />&nbsp;&nbsp;&nbsp;
                <input type = "button" className = "btn btn-primary" value = "Verify Loan Program" disabled = { loanProgram === undefined } />&nbsp;&nbsp;&nbsp;
            </p>
        </div>
    }
}

export default ManageLoanStatus;