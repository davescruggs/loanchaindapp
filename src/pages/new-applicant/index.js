import React, { Component, Fragment } from 'react';
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
            moduleTitle: 'Create Applicant',
            contractName: ':Applicant',
            processCommandText: 'Create',
            // form: {
            //     "Personal Information": {
            //         name: {title: 'Full Name' , value: 'name', className: 'col-sm-12'},
            //         Gender: {title: 'Gender', value: 'Gender', className: 'col-sm-6'},
            //         dob: {title: 'DOB', value: 'dob', className: 'col-sm-6'},
            //     },
            //     "Contact Information": {
            //         street1: {title: 'Street 1', value: 'street1', className: 'col-sm-12'},
            //         street2: {title: 'Street 2', value: 'street2', className: 'col-sm-12'},
            //         city: {title: 'City', value: 'city', className: 'col-sm-6'},
            //         state: {title: 'State', value: 'state', className: 'col-sm-6'},
            //         zip: {title: 'Zip', value: 'zip', className: 'col-sm-6'},
            //         country: {title: 'Country', value: 'country', className: 'col-sm-6'},
            //     },
            //     "Additional Information": {
            //         ssn: {title: 'Social Security', value: '1234', validate: (value) => {return parseInt(value, 10) || 0}, className: 'col-sm-6'},
            //         income: {title: 'Annual Income', value: '123456789101112', validate: (value) => {return parseInt(value, 10) || 0}, className: 'col-sm-6'}
            //     }
            // }
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
                income: {title: 'Annual Income', value: '123456789101112', validate: (value) => {return parseInt(value, 10) || 0} }
            }
        },
        { redirectToLoanDetails } = this.state;
        return (
        <div class="card mb-2">
            <div class="card-header" id="header-create" data-toggle="collapse" data-target="#body-create" aria-expanded="false" aria-controls="body-create">
                <p class="mb-0 py-2 font-weight-light">
                    <i class="icon-folder-create"></i> {props.moduleTitle}
                </p>
            </div>
            <div id="body-create" class="" aria-labelledby="header-create">
                <div class="card-body">
                    <ContractForm
                        { ...props }
                        onContractCreated = { this.onNewApplicantCreated } />
                    { redirectToLoanDetails && <Redirect to={redirectToLoanDetails} /> }
                </div>
            </div>
        </div>
        );
    }
}

export default NewApplicant;
