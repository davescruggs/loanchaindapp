import React, { Component } from 'react';
import ContractForm from '../../modules/contract-form';
import ContractFile from '../../modules/resource/loanchain.sol';

class NewLoanDetails extends Component {

    constructor(props) {
        super(props);
        this.onNewLoanCreated = this.onNewLoanCreated.bind(this);
    }

    onNewLoanCreated(applicantContract, componentState) {
        //(string _programName,address _applicantContract,string _loanType,int _loanAmount,int _loanPeriodInYears)
    }

    render() {
        const props = {
            contractFile : ContractFile,
            moduleTitle: 'Please specify the loan information',
            contractName: ':Loan',
            processCommandText: 'Submit Loan Application',
            form: {
                programName: {title: 'Program Name' , value: ''},
                applicantContract: {title: 'Application Reference', value: ''},
                loanType: {title: 'Type', value: ''},
                loanAmount: {title: 'Amount', value: '', validate: (value) => {return parseInt(value, 10) || 0} },
                loanPeriod: {title: 'Period in years', value: '', validate: (value) => {return parseInt(value, 10) || 0} }
            }
        }        
        return <ContractForm { ...props } onContractCreated = { this.onNewLoanCreated } />
    }
}

export default NewLoanDetails;