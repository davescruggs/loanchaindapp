import React, { Component } from 'react';
import ContractForm from '../../modules/contract-form';
import ContractFile from '../../modules/resource/loanchain.sol';
import BlockChain from '../../lib/blockchain';
import Config from '../../config.js';

class NewLoanDetails extends Component {

    constructor(props) {
        super(props);
        
        //TODO find the right way to find the key from search
        this.applicantAddress = props.location.search.replace('?applicant=','');

        this.state = {
            applicantName: '',
            programName: 'finding loan program for you!!! ...',
            loanProgramAddress: '',
            applicantAddress: this.applicantAddress
        }

        this.compiledObject = undefined;
        this.resolveSubmitLoan = undefined;

        this.onCompilationComplete = this.onCompilationComplete.bind(this);
        this.onLoanProgramFound = this.onLoanProgramFound.bind(this);
        this.onSubmitLoanApplication = this.onSubmitLoanApplication.bind(this);
    }

    onSubmitLoanApplication(formData) {
        const { loanProgram, applicant } = this.state,
            byteCode = '0x' + this.compiledObject.contracts[':LoanProgram'].bytecode;

        return new Promise((resolve, reject) => {
            
            this.resolveSubmitLoan = resolve.bind(this);
            
            try {
                BlockChain.getInflatedGas(this.compiledObject, ':LoanProgram').then((inflatedGas) => {
                    
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

        const { applicantAddress } = this.state;  

        BlockChain.getContract(this.compiledObject,':Applicant', applicantAddress).then((applicant) => {
            this.setState({
                applicantName: applicant.getApplicantDetails()[0],
                applicant
            });
        }).catch((error) => {
            this.setState({
                applicant: undefined
            });
        });

        loanProgram.ApplicationCreated((error, loanContract) => {
            if(this.resolveSubmitLoan) {
                this.resolveSubmitLoan('Success ' + loanContract.address)
            }
        });

        this.setState({
            loanProgram,
            programName: loanProgram.name(),
            loanProgramAddress: loanProgram.address
        })

    }

    onCompilationComplete(compiledObject, componentState) {
        
        this.compiledObject = compiledObject;

        BlockChain.getContract(compiledObject, ':LoanProgram', Config.loanProgramContract).then((loanProgram) => {            
            
            this.onLoanProgramFound(loanProgram);            

        }).catch((error) => {

            if(error.errorContractNotFound) {

                BlockChain.getGasPriceAndEstimate(compiledObject, ':LoanProgram').then(({gasPrice, gasEstimate}) => {
                    
                    BlockChain.deployContract([Config.loanProgramName], compiledObject, this.onLoanProgramFound, gasPrice, gasEstimate, ':LoanProgram').catch((error) => {
                        //TODO: Handle Loan Program failure error here
                    });
    
                });
            }

        });
    }    

    render() {
        const { applicantName, programName, applicantAddress, loanProgramAddress } = this.state,
            props = {
                contractFile : ContractFile,
                moduleTitle: 'Please specify the loan information',
                contractName: ':Loan',
                processCommandText: 'Submit Loan Application',
                form: {
                    applicantName: {title: 'Applicant Name' , value: applicantName + ' [' + applicantAddress + ']', readOnly: true},
                    programName: {title: 'Program Name' , value: programName + ' [' + loanProgramAddress + ']', readOnly: true},
                    loanType: {title: 'Type', value: ''},
                    loanAmount: {title: 'Amount', value: '', validate: (value) => {return parseInt(value, 10) || 0} },
                    loanPeriod: {title: 'Period in years', value: '', validate: (value) => {return parseInt(value, 10) || 0} }
            }
        }        
        return <ContractForm { ...props } onCompilationComplete = { this.onCompilationComplete } onSubmit = { this.onSubmitLoanApplication } />
    }
}

export default NewLoanDetails;