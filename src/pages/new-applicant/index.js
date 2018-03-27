import React, { Component } from 'react';
import { Redirect } from 'react-router';
import ContractForm from '../../modules/contract-form';
import ContractFile from '../../modules/resource/loanchain.sol';

class NewApplicant extends Component {

    constructor(props) {
        super(props);

        this.state = {
            redirectToLoanDetails: undefined
        }

        this.onNewApplicantCreated = this.onNewApplicantCreated.bind(this);

    }

    onNewApplicantCreated(applicantContract, componentState) {
        this.setState({ redirectToLoanDetails: '/loan?applicant=' + applicantContract.address });
        console.log('componentState', componentState);
        console.log('applicantContract', applicantContract);
    }

    render() {
        const props = {
            contractFile : ContractFile,
            moduleTitle: 'Please fill in loan applicant details',
            contractName: ':Applicant',
            processCommandText: 'Submit Details',
            form: {
                name: {title: 'Name' , value: 'name'},
                Gender: {title: 'Gender', value: 'Gender'},
                dob: {title: 'DOB', value: 'dob'},
                street1: {title: 'Street 1', value: 'street1'},
                street2: {title: 'Street 2', value: 'street2'},
                city: {title: 'City', value: 'city'},
                zip: {title: 'Zip', value: 'zip'},
                state: {title: 'State', value: 'state'},
                country: {title: 'Country', value: 'country' },
                ssn: {title: 'Social Security', value: '1234', validate: (value) => {return parseInt(value, 10) || 0} },
                income: {title: 'Anual Income', value: '123456789101112', validate: (value) => {return parseInt(value, 10) || 0} }
            }
        },
        { redirectToLoanDetails } = this.state;
        return <div>
            <ContractForm { ...props } onContractCreated = { this.onNewApplicantCreated } />
            { redirectToLoanDetails && <Redirect to={redirectToLoanDetails} /> }
        </div>
    }
}

export default NewApplicant;