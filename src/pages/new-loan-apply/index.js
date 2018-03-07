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
            redirectToLoanStatus: undefined
        }

        this.compiledObject = undefined;
        this.resolveSubmitLoan = undefined;

        this.onCompilationComplete = this.onCompilationComplete.bind(this);
        this.onLoanProgramFound = this.onLoanProgramFound.bind(this);
        this.onSubmitLoanApplication = this.onSubmitLoanApplication.bind(this);
    }

    onSubmitLoanApplication(formData) {
        const { loanProgram, applicant } = this.state;

        return new Promise((resolve, reject) => {

            this.resolveSubmitLoan = resolve.bind(this);

            try {
                BlockChain.getInflatedGas(this.compiledObject, ':LoanProgram').then(({inflatedGas, byteCode}) => {

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
                processCommandText: 'Submit Loan Application',
                form: {
                    applicantName: {title: 'Applicant Name' , value: applicantName + ' [' + applicantAddress + ']', readOnly: true},
                    programName: {title: 'Program Name' , value: programName + ' [' + loanProgramAddress + ']', readOnly: true},
                    loanType: {title: 'Type', value: '', readOnly},
                    loanAmount: {title: 'Amount', value: '', readOnly, validate: (value) => {return parseInt(value, 10) || 0} },
                    loanPeriod: {title: 'Period in years', readOnly, value: '', validate: (value) => {return parseInt(value, 10) || 0} }
            }
        }
        return <div>
            {(!invalidApplicant) && <ContractForm { ...props } onCompilationComplete = { this.onCompilationComplete } onSubmit = { this.onSubmitLoanApplication } commandDisabled = { readOnly } />}
            {invalidApplicant && <p align="center">
                Not a valid applicant or applicant not found<br />
                <Link to = '/'>Register new applicant</Link>
            </p>}
            { redirectToLoanStatus && <Redirect to={redirectToLoanStatus} /> }}
        </div>
    }
}

export default NewLoanDetails;
