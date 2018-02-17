import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ContractForm from '../../modules/contract-form';
import ContractFile from '../../modules/resource/loanchain.sol';
import BlockChain from '../../lib/blockchain';

class UserLoanStatus extends Component {

    constructor(props) {
        super(props);
        
        //TODO find the right way to find the key from search
        this.loanAddress = props.location.search.replace('?loan=','');

        this.state = {
            invalidLoanInformation: false,
            loanInfo: undefined,
            loanAddress: this.loanAddress,
            applicantAddress: '',
            loanApproved: '',
            estimatedEMI: '',
            estimatedIntrestRate: '',
            goodCredit: '',
            loanAmount: '',
            loanPeriodInYears: '',
            loanProgramAddress: '',
            loanType: '',
            loanReceived: ''
        }

        this.compiledObject = undefined;
        this.resolveSubmitLoan = undefined;

        this.onCompilationComplete = this.onCompilationComplete.bind(this);
        this.onLoanInfoFound = this.onLoanInfoFound.bind(this);
        this.onLoanProcess = this.onLoanProcess.bind(this);
    }

    onLoanProcess(formData) {
        return new Promise((resolve) => {
            resolve('success');
        });
    }

    onLoanInfoFound(loanInfo) {

        if(loanInfo.address) {
            
            this.setState({
                loanInfo,
                loanAddress: loanInfo.address,
                applicantAddress: loanInfo.applicantContractAddress(),
                loanApproved: loanInfo.approved(),
                estimatedEMI: loanInfo.estimatedEMI(),
                estimatedIntrestRate: loanInfo.estimatedIntrestRate(),
                goodCredit: loanInfo.goodCredit(),
                loanAmount: loanInfo.loanAmount(),
                loanPeriodInYears: loanInfo.loanPeriodInYears(),
                loanProgramAddress: loanInfo.loanProgramAddress(),
                //  loanType: loanInfo.loanType(),
                //  loanReceived: loanInfo.received()
            });

            /*  BlockChain.getContract(this.compiledObject,':Applicant', applicantAddress).then((applicant) => {
                this.setState({
                    applicantName: applicant.getApplicantDetails()[0],
                    applicant
                });
            }).catch((error) => {
                this.setState({
                    applicant: undefined,
                    invalidApplicant: true
                });
            });*/           
        }
    }

    onCompilationComplete(compiledObject, componentState) {
        
        const { loanAddress } = this.state;  

        this.compiledObject = compiledObject;

        BlockChain.getContract(compiledObject, ':Loan', loanAddress).then((loanInfo) => {
            console.log('loanInfo', loanInfo)
            this.onLoanInfoFound(loanInfo);
        }).catch((error) => {
            console.log('error', error);
            this.setState({
                loanInfo: undefined,
                invalidLoanInformation: true
            });
        });
        
    }    

    render() {
        const { 
            loanAddress, invalidLoanInformation,
            applicantAddress, loanApproved,
            estimatedEMI, estimatedIntrestRate,
            goodCredit, loanAmount,
            loanPeriodInYears, loanProgramAddress,
            loanType, loanReceived } = this.state,            
            props = {
                contractFile : ContractFile,
                moduleTitle: 'Loan status',
                contractName: ':Loan',
                processCommandText: 'Ok',
                form: {   
                    loanAddress: {title: 'Loan Reference' , value: loanAddress, readOnly: true},
                    applicantAddress: {title: 'Applicant Reference' , value: applicantAddress, readOnly: true},
                    loanApproved: {title: 'Approval status' , value: loanApproved ? 'Approved' : 'In process', readOnly: true},
                    estimatedEMI: {title: 'Emi estimation' , value: estimatedEMI, readOnly: true},
                    estimatedIntrestRate: {title: 'Intrest rate estimation' , value: estimatedIntrestRate, readOnly: true},
                    goodCredit: {title: 'Credit status' , value: goodCredit, readOnly: true},
                    loanAmount: {title: 'Loan Amount' , value: loanAmount, readOnly: true},
                    loanPeriodInYears: {title: 'Repayment period' , value: loanPeriodInYears, readOnly: true},
                    loanProgramAddress: {title: 'Loan Program reference' , value: loanProgramAddress, readOnly: true},
                    loanType: {title: 'Loan type' , value: loanType, readOnly: true},
                    loanReceived: {title: 'Loan received status' , value: loanReceived, readOnly: true}
                }
            }        
        return <div>
            {(!invalidLoanInformation) && <ContractForm { ...props } onCompilationComplete = { this.onCompilationComplete } onSubmit = { this.onLoanProcess } />}
            {invalidLoanInformation && <p align="center">
                Not a valid loan or loan not found<br />
                <Link to = '/'>Apply new loan</Link>
            </p>}
        </div>
    }
}

export default UserLoanStatus;