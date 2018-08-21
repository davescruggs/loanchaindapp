import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';

import ContractForm from '../../modules/contract-form';
import ContractFile from '../../modules/resource/loanchain.sol';
import BlockChain from '../../lib/blockchain';
import Config from '../../config.js';
import {loanprogramContract} from '../../web3.js';

class NewLoanDetails extends Component {



    constructor(props) {
        super(props);

        //TODO find the right way to find the key from search
        this.applicantAddress = props.location.search.replace('?applicant=','');
        this.accountname = '';
        this.loggedUserInfo = JSON.parse(localStorage.getItem("accountInfo"));
        if(this.loggedUserInfo) {
            this.accountname = this.loggedUserInfo.accountName;
        }
        this.state = {
            applicantName: '',
            programName: 'finding loan program for you!!! ...',
            loanProgramAddress: '',
            invalidApplicant: false,
            applicantAddress: this.applicantAddress,
            applicant: undefined,
            redirectToLoanStatus: undefined,
            loanContractAdress:'',
            existingApplicantInfo: '',
            accountName: this.accountname,
            contractsPrograms: undefined
        }
        this.baseURL = '';
        if (window.location.host.indexOf('localhost') == 0) {
            this.baseURL = 'http://localhost:7000';
        }
        
        this.compiledObject = undefined;
        this.resolveSubmitLoan = undefined;
        this.onDataSelectChange = this.onDataSelectChange.bind(this);
        this.onCompilationComplete = this.onCompilationComplete.bind(this);
        this.onLoanProgramFound = this.onLoanProgramFound.bind(this);
        this.onSubmitLoanApplication = this.onSubmitLoanApplication.bind(this);
    }

    onSubmitLoanApplication(formData) {
        
        this.getExistingApplicantDetails();
        const { loanProgram, applicant, existingApplicantInfo, loanContractAdress } = this.state;

        return new Promise((resolve, reject) => {
            this.resolveSubmitLoan = resolve.bind(this);
            try {
                BlockChain.getInflatedGas(this.compiledObject, ':LoanProgram').then(({inflatedGas, byteCode}) => {
                  console.log('formData', formData);
                  console.log('applicant ', applicant);
                  console.log('applicant ', applicant.address);
                  console.log('loanProgram loanContractAdress', this.state.loanContractAdress);
                  const applicantInfo = applicant.getApplicantDetails();
                  const applicantAddress = applicant.getApplicantAddress();
                  if(loanProgram.address) {
                        loanProgram.ApplicationCreated((error, loanContract) => {
                                const newApplicantInfo = [{ 
                                    applicantAddress:applicant.address,
                                    name: applicantInfo[0],
                                    Gender: applicantInfo[1],
                                    dob: applicantInfo[2],
                                    ssn: applicantInfo[3],
                                    income: applicantInfo[4],
                                    address: applicantAddress[0] + ' ,' +applicantAddress[1],
                                    city: applicantAddress[2],
                                    loanPeriod: formData.loanPeriod.value,
                                    loanContractAdress: loanContract.args.contractAddress,
                                    programName: loanProgram.name(),
                                    loanType: formData.loanType.value,
                                    loanAmount: formData.loanAmount.value,
                                    loanPeriod: formData.loanPeriod.value,
                                }]
                                let finalObj;
                                let accountname = this.state.accountName;
                                console.log("existingApplicantInfo TYPE", existingApplicantInfo);
                                if(existingApplicantInfo != '') {
                                    finalObj = existingApplicantInfo[accountname].concat(newApplicantInfo);
                                } else {
                                    finalObj = newApplicantInfo;
                                }
                                
                                console.log("existingApplicantInfo TYPE", accountname);
                                const loanAppInfo = {[accountname] : finalObj};
                                console.log("loanAppInfo", loanAppInfo);
                                this.updateApplicantInfo(loanAppInfo);
                        });
                    }
                        loanProgram.apply(applicant.address,
                        formData.loanType.value,
                        formData.loanAmount.value,
                        formData.loanPeriod.value,
                        {from: BlockChain.fromAccount(), data: byteCode, gas:inflatedGas}
                    );
                    const loanAppInfos = {};
                    const applicantDetails = applicant.getApplicantDetails();
                    console.log("applicantDetails", loanAppInfos);
                });
            } catch(error) {
                reject(error.toString());
            }
        });
    }

    async onLoanProgramFound(loanProgram) {

        this.getExistingApplicantDetails();
        const { applicant, existingApplicantInfo  } = this.state;
        if(loanProgram.address) {

            await loanProgram.ApplicationCreated((error, loanContract) => {
                this.setState({
                    loanContractAdress: loanContract.args.contractAddress
                })
                if(this.resolveSubmitLoan) {
                    console.log("loanContract Data", loanContract);
                    this.resolveSubmitLoan({redirect: true});
                    this.setState({ redirectToLoanStatus: '/loans' });
                }
            });
            this.setState({
                loanProgram,
                programName: loanProgram.name(),
                //loanProgramAddress: loanProgram.address
            })
        }
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

    onCompilationComplete(compiledObject, componentState) {

        const { applicantAddress } = this.state;
        this.compiledObject = compiledObject;
        console.log("compiledObject compiledObject compiledObject", compiledObject.contracts)
        let contracts = Object.keys(compiledObject.contracts).map(function(contract){
            if(contract != ':Applicant' && contract != ':Loan') {
                return contract
            }
        });
        var contractList = [];
        for (var contractKey in this.compiledObject.contracts) {
            console.log("contract key", contractKey)
            if(contractKey != ':Applicant' && contractKey != ':Loan')
            contractList.push(contractKey);
        }
        console.log("contractList contractList ", contractList)
        this.setState({
            contractsPrograms: contractList,
        });

        BlockChain.getContract(compiledObject, ':LoanProgram', loanprogramContract).then((loanProgram) => {
            loanProgram.name();
            //this.onLoanProgramFound(loanProgram);

        }).catch((error) => {

            BlockChain.getGasPriceAndEstimate(compiledObject, ':LoanProgram').then(({gasPrice, gasEstimate}) => {
                BlockChain.deployContract([Config.loanProgramName], compiledObject, this.onLoanProgramFound, gasPrice, gasEstimate, ':LoanProgram').catch((error) => {
                    //TODO: Handle Loan Program failure error here
                });
            });
        });
        BlockChain.getContract(this.compiledObject,':Applicant', applicantAddress).then((applicant) => {
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
        });
    }
    onDataSelectChange(field, { target }) {
        const { value } = target,
        updateState = { ...this.state.form };
        console.log('onDataSelectChange', value);
        console.log('onDataChange updateState', updateState);
    }

    render() {
        const { applicantName, programName,
                applicantAddress, loanProgramAddress,
                invalidApplicant, redirectToLoanStatus, loanProgram, applicant, contractsPrograms } = this.state,
            readOnly = !(loanProgram && applicant),
            props = {
                contractFile : ContractFile,
                moduleTitle: 'Please specify the loan information',
                contractName: ':Loan',
                processCommandText: 'Submit',
                form: {
                    applicantName: {title: 'Applicant Name', value: applicantName + ' [' + applicantAddress + ']', readOnly: true, styleclass: 'col-md-12'},
                    programName: {title: 'Program Name' , value: programName + ' [' + loanProgramAddress + ']', readOnly: true, styleclass: 'col-md-12'},
                    loanType: {title: 'Type', value: contractsPrograms, readOnly, styleclass: 'col-sm-4'},
                    loanAmount: {title: 'Amount', value: '', readOnly, validate: (value) => {return parseInt(value, 10) || 0}, styleclass: 'col-md-4'},
                    loanPeriod: {title: 'Period in years', readOnly, value: '', validate: (value) => {return parseInt(value, 10) || 0}, styleclass: 'col-md-4'}
                }
            }
        return (
            <div class="card mb-2 col-md-10 list-left">
                <div class="form-group">
                <div> 
                    <h5 class=" mb-0 py-2 font-weight-light">{props.moduleTitle}
                    </h5>
                </div>
                <div id="body-apply" class="" aria-labelledby="header-apply">
                    <div class="card-body">
                        {(!invalidApplicant) &&
                            <ContractForm { ...props }
                                onCompilationComplete = { this.onCompilationComplete }
                                onSubmit = { this.onSubmitLoanApplication }
                                commandDisabled = { readOnly } />}
                        {invalidApplicant &&
                            <p align="center">
                            Not a valid applicant or applicant not found<br />
                            <Link to = '/'>Register new applicant</Link>
                            </p>}
                        { redirectToLoanStatus && window.location.assign(redirectToLoanStatus) }
                    </div>
                </div>
                </div>
            </div>
        );
    }
}
export default NewLoanDetails;
