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

        this.state = {
            applicantName: '',
            programName: 'finding loan program for you!!! ...',
            loanProgramAddress: '',
            invalidApplicant: false,
            applicantAddress: this.applicantAddress,
            applicant: undefined,
            redirectToLoanStatus: undefined,
            value: 'Personal'
        }

        this.compiledObject = undefined;
        this.resolveSubmitLoan = undefined;

        this.onCompilationComplete = this.onCompilationComplete.bind(this);
        this.onLoanProgramFound = this.onLoanProgramFound.bind(this);
        this.onSubmitLoanApplication = this.onSubmitLoanApplication.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
      }

    onSubmitLoanApplication(formData) {
        const { loanProgram, applicant } = this.state;

        return new Promise((resolve, reject) => {

            this.resolveSubmitLoan = resolve.bind(this);

            try {
                BlockChain.getInflatedGas(this.compiledObject, ':LoanProgram').then(({inflatedGas, byteCode}) => {
                  console.log('loanProgram', loanProgram);
                    loanProgram.apply(applicant.address,
                        formData.loanType.value,
                        formData.loanAmount.value,
                        formData.loanPeriod.value,
                        {from: BlockChain.fromAccount(), data: byteCode, gas:inflatedGas}
                    );

                });
            } catch(error) {
                reject(error.toString());
            }
        });
    }

    onLoanProgramFound(loanProgram) {

        if(loanProgram.address) {

            loanProgram.ApplicationCreated((error, loanContract) => {
                console.log('loanContract', loanContract);
                if(this.resolveSubmitLoan) {
                    this.resolveSubmitLoan({redirect: true});
                    this.setState({ redirectToLoanStatus: '/loanstatus?loan=' + loanContract.args.contractAddress });
                }
            });

            this.setState({
                loanProgram,
                programName: loanProgram.name(),
                loanProgramAddress: loanProgram.address
            })
        }
    }

    onCompilationComplete(compiledObject, componentState) {

        const { applicantAddress } = this.state;

        this.compiledObject = compiledObject;

        BlockChain.getContract(compiledObject, ':LoanProgram', loanprogramContract).then((loanProgram) => {
            loanProgram.name();
            this.onLoanProgramFound(loanProgram);

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
            this.setState({
                applicant: undefined,
                invalidApplicant: true
            });
        });
    }

    render() {
        const { applicantName, programName,
                applicantAddress, loanProgramAddress,
                invalidApplicant, redirectToLoanStatus, loanProgram, applicant } = this.state,
            readOnly = !(loanProgram && applicant),
            props = {
                contractFile : ContractFile,
                moduleTitle: 'Please specify the loan information',
                contractName: ':Loan',
                processCommandText: 'Submit',
                form: {
                    applicantName: {title: 'Applicant Name', value: applicantName + ' [' + applicantAddress + ']', readOnly: true, className: 'col-sm-12'},
                    programName: {title: 'Program Name' , value: programName + ' [' + loanProgramAddress + ']', readOnly: true, className: 'col-sm-12'},
                    loanType: {title: 'Type', value: ['Personal', 'Education', 'Business'], readOnly, className: 'col-sm-6'},
                    loanAmount: {title: 'Amount', value: '', readOnly, validate: (value) => {return parseInt(value, 10) || 0}, className: 'col-sm-6'},
                    loanPeriod: {title: 'Period in years', readOnly, value: '', validate: (value) => {return parseInt(value, 10) || 0}, className: 'col-sm-6'}
                }
            }
        return (
            <div class="card mb-2">
                <div class="card-header" id="header-apply" data-toggle="collapse" data-target="#body-apply" aria-expanded="false" aria-controls="body-apply">
                    <p class="mb-0 py-2 font-weight-light">
                        <i class="icon-folder-apply"></i> {props.moduleTitle}
                    </p>
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
                        { redirectToLoanStatus && <Redirect to={redirectToLoanStatus} /> }
                    </div>
                </div>
            </div>
        );
    }
}

export default NewLoanDetails;
