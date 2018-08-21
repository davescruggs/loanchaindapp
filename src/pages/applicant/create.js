import React, { Component, Fragment } from 'react';
import { Redirect } from 'react-router';
import DatePicker from 'react-datepicker';
import ContractForm from '../../modules/contract-form';
import ContractFile from '../../modules/resource/loanchain.sol';
import { BlockChain } from '../../lib/blockchain';
import moment from 'moment';

class NewApplicant extends Component {

    constructor(props) {
        super(props);

        this.loggedUserInfo = JSON.parse(localStorage.getItem("accountInfo"));
        if(this.loggedUserInfo) {
            this.accountId = this.loggedUserInfo.accountId;
            this.accountname = this.loggedUserInfo.accountName;
        }
        let currDate = new Date();
        this.state = {
            redirectToLoanDetails: undefined,
            accountId: this.accountId,
            accountName: this.accountname,
            existingApplicantInfo: '',
            dob: currDate.getDate()+'-'+currDate.getMonth() +'-'+currDate.getFullYear(),
        }
        this.compiledObject = undefined;
        this.onNewApplicantCreated = this.onNewApplicantCreated.bind(this);
        this.onCompilationComplete = this.onCompilationComplete.bind(this);
        this.baseURL = '';
        if (window.location.host.indexOf('localhost') == 0) {
            this.baseURL = 'http://localhost:7000';
        }
        this.getExistingApplicantDetails();

    }
    onNewApplicantCreated(applicantContract, componentState) {
        const { existingApplicantInfo } = this.state;
        BlockChain.getContract(this.compiledObject,':Applicant', applicantContract.address).then((applicant) => {
            
            const applicantInfo = applicant.getApplicantDetails();
            const applicantAddress = applicant.getApplicantAddress();
            const loanInfo = applicant.getLoanInfo();
            const newApplicantInfo = [{ 
                applicantAddress:applicant.address,
                name: applicantInfo[0],
                Gender: applicantInfo[1],
                dob: applicantInfo[2],
                ssn: applicantInfo[3],
                income: applicantInfo[4],
                address: applicantAddress[0] + ' ,' +applicantAddress[1],
                city: applicantAddress[2],
                loanType: loanInfo[0],
                loanAmount: loanInfo[1],
                loanPeriod: loanInfo[2],
                status: "New",
                loanAddress:"",
            }]
            let finalObj;
            let accountname = this.state.accountName;
            if(existingApplicantInfo != '') {
                finalObj = existingApplicantInfo[accountname].concat(newApplicantInfo);
            } else {
                finalObj = newApplicantInfo;
            }
            const loanAppInfo = {[accountname] : finalObj};
            this.updateApplicantInfo(loanAppInfo);
            this.setState({ redirectToLoanDetails: '/loans' });
        }).catch((error) => {
            console.log("Error ", error)
            this.setState({
                applicant: undefined,
                invalidApplicant: true
            });
        });
        console.log('componentState', componentState);
        console.log('applicantContract', applicantContract);
    }

    onCompilationComplete(compiledObject, componentState) {

        const { applicantAddress } = this.state;
        console.log("Loan new dapp", compiledObject);
        this.compiledObject = compiledObject;
        /*BlockChain.getContract(this.compiledObject,':Applicant', applicantAddress).then((applicant) => {
            console.log("Loan new dapp", applicant);
            this.setState({
                applicantName: applicant.getApplicantDetails()[0],
                applicant
            });
        }).catch((error) => {
            console.log("Error ", error)
            this.setState({
                applicant: undefined,
                invalidApplicant: true
            });
        });*/
    }

    async getExistingApplicantDetails() {

        await fetch(this.baseURL+'/applicants/'+ this.state.accountName).then(
            response => response.json() ).then(
            resulstData => this.setState(
                { existingApplicantInfo: resulstData }
        )).catch((err) => {
            console.log("error", err);
       });
    }

    updateApplicantInfo(loanAppInfo) {
        (async () => {
            const rawResponse = await fetch(this.baseURL+'/create/', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(loanAppInfo)
            });
            const content = await rawResponse.json();
            console.log("rawResponse", content);
          })();
    }

    render() {
        const props = {
            contractFile : ContractFile,
            moduleTitle: 'Create Applicant',
            contractName: ':Applicant',
            processCommandText: 'Create',
            fromAccountAddress: this.state.accountId,
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
                    personal: {title: 'Perosnal Information: ', inputType: 'label', styleclass: 'mar-bot0'},
                    firstName: {title: 'First name' , value: 'firstname', inputType: 'text'},
                    lastName: {title: 'Last name' , value: 'lastname', inputType: 'text'},
                    Gender: {title: 'Gender', value: 'Gender', inputType: 'radio', options:['Male', 'Female']},
                    dob: {title: 'DOB', inputType: 'date', value:this.state.dob},
                    contact: {title: 'Contact Information: ', inputType: 'label', styleclass: 'mar-bot0'},
                    street1: {title: 'Street 1', value: 'street1'},
                    street2: {title: 'Street 2', value: 'street2'},
                    city: {title: 'City', value: 'city'},
                    zip: {title: 'Zip', value: 'zip'},
                    state: {title: 'State', value: 'state'},
                    country: {title: 'Country', value: 'country' },
                    loaninfo: {title: 'Security & Loan Information: ', inputType: 'label', styleclass: 'mar-bot0'},
                    ssn: {title: 'Social Security', value: '1234', inputType: 'password', validate: (value) => {return parseInt(value, 10) || 0} },
                    income: {title: 'Annual Income', value: '123456789101112', validate: (value) => {return parseInt(value, 10) || 0} },
                    loanType: {title: 'Loan type',  options: ['Personal Loan', 'Home Loan'], value: 'Personal Loan', inputType: 'select'},
                    loanAmount: {title: 'Amount', value: '550000', validate: (value) => {return parseInt(value, 10) || 0} },
                    loanPeriod: {title: 'Period in years', value: '10', validate: (value) => {return parseInt(value, 10) || 0} }
                    /*loanPeriod: {title: 'Period in years', value: '', validate: (value) => {return parseInt(value, 10) || 0}, styleclass: 'col-md-4'}*/
                /*name: {title: 'Name' , value: 'name', validate: (value) => { 
                    if (!value.match(/^[a-zA-Z]+$/)) {
                      return true;
                    } 
                    return false;
                }, isError: false,
                 error: "Username is invalid"},

                Gender: {title: 'Gender', value:['Male', 'Female']},
                dob: {title: 'DOB', value: '',  inputType:'date'},
                street1: {title: 'Street 1', value: 'street1',  validate: (value) => { 
                    if (!value.match(/^[a-zA-Z]+$/)) {
                      return true;
                    } 
                    return false;
                }, isError: false,
                error: "Enter valid street name"},
                street2: {title: 'Street 2', value: 'street2',  validate: (value) => { 
                    if (!value.match(/^[a-zA-Z]+$/)) {
                      return true;
                    } 
                    return false;
                }, isError: false,
                error: "Enter valid street name" },
                city: {title: 'City', value: 'city', validate: (value) => { 
                    if (!value.match(/^[a-zA-Z]+$/)) {
                      return true;
                    } 
                    return false;
                }, isError: false,
                error: "City is not valid"},
                zip: {title: 'Zip', value: 'zip', validate: (value) => { 
                    if (!value.match(/^[0-9]*$/)) {
                      return true;
                    } 
                    return false;
                }, isError: false,
                error: "Zipcode is not valid"},
                state: {title: 'State', value: 'state', validate: (value) => { 
                    if (!value.match(/^[a-zA-Z]+$/)) {
                      return true;
                    } 
                    return false;
                }, isError: false,
                error: "State is not valid"},
                country: {title: 'Country', value: 'country', validate: (value) => { 
                    if (!value.match(/^[a-zA-Z]+$/)) {
                      return true;
                    } 
                    return false;
                }, isError: false,
                error: "Country is not valid"},
                ssn: {title: 'Social Security', value: '1234', validate: (value) => {return parseInt(value, 10) || 0} },
                income: {title: 'Annual Income', value: '123456789101112', validate: (value) => {return parseInt(value, 10) || 0} }*/
            },
            loanForm: {
                
            }
        },
        { redirectToLoanDetails, statusMessage } = this.state;
        return (
        
        <div class="card mb-2 col-md-8 create-list-left">
        <div class="form-group">
            <div> 
                <h5 class=" mb-0 py-2 font-weight-light">{props.moduleTitle}</h5>
            </div>
            <div id="body-create" class="" aria-labelledby="header-create">
                <div class="card-body">
                    <ContractForm
                        { ...props }
                        onCompilationComplete = { this.onCompilationComplete }
                        onContractCreated = { this.onNewApplicantCreated } />
                        { redirectToLoanDetails && 
                               window.location.assign(redirectToLoanDetails)
                        }
                </div>
            </div>
        </div>
        </div>
        );
    }
}

export default NewApplicant;
