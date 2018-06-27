import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ContractForm from '../../modules/contract-form';
import ContractFile from '../../modules/resource/loanchain.sol';
import BlockChain from '../../lib/blockchain';

class LoanStatus extends Component {

    constructor(props) {
        super(props);

        this.loanAddress = props.loanAddress;

        this.state = {
            invalidLoanInformation: false,
            loanInfo: undefined,
            loanAddress: this.loanAddress,
            applicantAddress: '',
            loanApproved: '',
            estimatedEMI: '',
            estimatedIntrestRate: '',
            loanApprovedAmount: '',
            goodCredit: '',
            loanAmount: '',
            loanPeriodInYears: '',
            loanProgramAddress: '',
            loanType: '',
            loanReceived: '',
            applicant: undefined,
            name: '',
            Gender: '',
            dob: '',
            zip: '',
            income: '',
            loanProgram: undefined,
            loanProgramName: '',
            editIntrestAndEMI: (props.editIntrestAndEMI === undefined) ? false : props.editIntrestAndEMI
        }

        this.compiledObject = undefined;
        this.resolveSubmitLoan = undefined;

        this.onCompilationComplete = this.onCompilationComplete.bind(this);
        this.onLoanInfoFound = this.onLoanInfoFound.bind(this);
        this.onLoanProcess = this.onLoanProcess.bind(this);
        this.onDataChange = this.onDataChange.bind(this);
    }

    componentWillReceiveProps(props) {

        this.setState({
            editIntrestAndEMI: props.editIntrestAndEMI,
            ...props.updateInfo
        });

        if(props.onSaveData) {
            props.onSaveData({ ...this.state });
        }
    }

    onDataChange(state) {
        this.setState({
            estimatedEMI: parseInt(state.form.estimatedEMI.value, 10) || 0,
            estimatedIntrestRate: parseInt(state.form.estimatedIntrestRate.value, 10) || 0
        });
    }

    onLoanProcess(formData) {
        return new Promise((resolve) => {
            resolve('success');
        });
    }

    onLoanInfoFound(loanInfoFound) {

        if(loanInfoFound.address) {

            const { onLoanStatusNotified } = this.props;

            this.setState({
                loanInfo: loanInfoFound,
                loanAddress: loanInfoFound.address,
                applicantAddress: loanInfoFound.applicantContractAddress(),
                loanApproved: loanInfoFound.approved(),
                estimatedEMI: parseInt(loanInfoFound.estimatedEMI().toString(), 10),
                estimatedIntrestRate: parseInt(loanInfoFound.estimatedIntrestRate().toString(), 10),
                goodCredit: loanInfoFound.goodCredit(),
                loanAmount: loanInfoFound.loanAmount(),
                loanPeriodInYears: loanInfoFound.loanPeriodInYears(),
                loanProgramAddress: loanInfoFound.loanProgramAddress(),
                loanType: loanInfoFound.loanType(),
                loanReceived: loanInfoFound.received()
            });

            if(onLoanStatusNotified) {
                onLoanStatusNotified(loanInfoFound, this.state.applicant, this.state.loanProgram).catch();
            }
            console.log("CULPRIT 1");
            BlockChain.getContract(this.compiledObject,':Applicant', loanInfoFound.applicantContractAddress()).then((applicant) => {
                const applicantInfo = applicant.getApplicantDetails();
                this.setState({
                    applicant: applicant,
                    name: applicantInfo[0],
                    Gender: applicantInfo[1],
                    dob: applicantInfo[2],
                    zip: applicantInfo[3],
                    income: applicantInfo[4]
                });

                if(onLoanStatusNotified) {
                    onLoanStatusNotified(this.state.loanInfo, applicant, this.state.loanProgram).catch();
                }

            }).catch((error) => {
                this.setState({
                    applicant: undefined,
                    invalidLoanInformation: true
                });
            });
            console.log("CULPRIT 2");
            BlockChain.getContract(this.compiledObject,':LoanProgram', loanInfoFound.loanProgramAddress()).then((loanProgram) => {
                this.setState({
                    loanProgram,
                    loanProgramName: loanProgram.name()
                });

                if(onLoanStatusNotified) {
                    onLoanStatusNotified(this.state.loanInfo, this.state.applicant, loanProgram).catch();
                }

            }).catch((error) => {
                this.setState({
                    loanProgram: undefined,
                    invalidLoanInformation: true
                });
            });

        }
    }

    onCompilationComplete(compiledObject) {
        console.log("MOTHER OF ALL CULPRITS");
        const { onCompilationComplete } = this.props;

        this.compiledObject = compiledObject;

        this.readLoanInfo();



        if(onCompilationComplete) {
            onCompilationComplete(compiledObject);
        }

    }

    readLoanInfo() {

        const { compiledObject } = this,
            { loanAddress } = this.state;
        console.log("CULPRIT 3");
        BlockChain.getContract(compiledObject, ':Loan', loanAddress).then((loanInfo) => {
            loanInfo.loanType();
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
        
        console.log("goodCredit ", this.state.goodCredit);
		if (this.state.goodCredit == true) {
            this.creditStatusValue = "Approved";
        } else if (this.state.goodCredit == '') {
            this.creditStatusValue = "";
        } else {
            this.creditStatusValue = "Declined";
        }
        const {
                loanAddress, invalidLoanInformation,
                applicantAddress, loanApproved,
                estimatedEMI, estimatedIntrestRate,
                goodCredit, loanAmount,
                loanPeriodInYears, loanProgramAddress,
                loanType, loanReceived,
                name, Gender, dob, zip, income, loanProgramName,
                editIntrestAndEMI
            } = this.state,
            props = {
                contractFile : ContractFile,
                moduleTitle: 'Loan status',
                contractName: ':Loan',
                processCommandText: 'Ok',
                // form: {
                //     "Reference IDs": {
                //         loanAddress: {title: 'Loan Reference', value: loanAddress, readOnly: true},
                //         loanProgramAddress: {title: 'Loan Program reference', value: loanProgramAddress, readOnly: true},
                //         applicantAddress: {title: 'Applicant Reference' , value: applicantAddress, readOnly: true},
                //     },
                //     "Status": {
                //         loanApproved: {title: 'Approval status' , value: loanApproved ? 'Approved' : 'In process', readOnly: true},
                //         goodCredit: {title: 'Credit status' , value: goodCredit, readOnly: true},
                //         loanReceived: {title: 'Loan received status' , value: loanReceived ? 'Received' : 'Not received', readOnly: true}
                //     },
                //     "Applicant Info": {
                //         name: {title: 'Full Name' , value: name, readOnly: true},
                //         Gender: {title: 'Gender', value: Gender, readOnly: true},
                //         dob: {title: 'DOB', value: dob, readOnly: true},
                //         zip: {title: 'Zip', value: zip, readOnly: true},
                //         income: {title: 'Annual Income', value: income, readOnly: true}
                //     },
                //     "Loan Info": {
                //         loanProgram: {title: 'Loan Program' , value: loanProgramName, readOnly: true},
                //         loanType: {title: 'Loan type' , value: loanType, readOnly: true},
                //         loanAmount: {title: 'Loan Amount' , value: loanAmount, readOnly: true},
                //         loanPeriodInYears: {title: 'Repayment period' , value: loanPeriodInYears, readOnly: true},
                //         estimatedEMI: {title: 'Monthly payment' , value: estimatedEMI, readOnly: !editIntrestAndEMI},
                //         estimatedIntrestRate: {title: 'Interest rate estimation' , value: estimatedIntrestRate, readOnly: !editIntrestAndEMI},
                //     }
                // },
                // associateForm: {}
                form: {
                    loanAddress: {title: 'Loan Reference' , value: loanAddress, readOnly: true},
                    loanApproved: {title: 'Approval status' , value: loanApproved ? 'Approved' : 'In process', readOnly: true},
                    goodCredit: {title: 'Credit status' , value: this.creditStatusValue, readOnly: true},
                    loanAmount: {title: 'Loan Amount' , value: loanAmount, readOnly: true},
                    loanPeriodInYears: {title: 'Repayment period' , value: loanPeriodInYears, readOnly: true},
                    loanType: {title: 'Loan type' , value: loanType, readOnly: true},
                    loanReceived: {title: 'Loan received status' , value: loanReceived ? 'Received' : 'Not received', readOnly: true},
                    estimatedEMI: {title: 'EMI estimation' , value: estimatedEMI, readOnly: !editIntrestAndEMI},
                    estimatedIntrestRate: {title: 'Interest rate estimation' , value: estimatedIntrestRate, readOnly: !editIntrestAndEMI},
                    loanApprovedAmount: {title: 'Loan Approved Amount' , value: loanApprovedAmount},
                },
                associateForm: {
                    loanProgramAddress: {title: 'Loan Program reference' , value: loanProgramAddress, readOnly: true},
                    loanProgram: {title: 'Loan Program' , value: loanProgramName, readOnly: true},
                    applicantAddress: {title: 'Applicant Reference' , value: applicantAddress, readOnly: true},
                    name: {title: 'Name' , value: name, readOnly: true},
                    Gender: {title: 'Gender', value: Gender, readOnly: true},
                    dob: {title: 'DOB', value: dob, readOnly: true},
                    zip: {title: 'Zip', value: zip, readOnly: true},
                    income: {title: 'Annual Income', value: income, readOnly: true}
                }
            }
        return (
            <div class="card mb-2">
                <div class="card-header" id="header-create" data-toggle="collapse" data-target="#body-create" aria-expanded="false" aria-controls="body-create">
                    <p class="mb-0 py-2 font-weight-light">
                        <i class="icon-folder-create"></i> {props.moduleTitle}
                    </p>
                </div>
                <div id="body-create" class="" aria-labelledby="header-create">
                    <div class="card-body">
                        {(!invalidLoanInformation) &&
                            <ContractForm { ...props }
                                onCompilationComplete = { this.onCompilationComplete }
                                onSubmit = { this.onLoanProcess }
                                onDataChange = { this.onDataChange } />}
                        {invalidLoanInformation &&
                            <p align="center">
                            Not a valid loan or loan not found<br />
                            <Link to = '/'>Apply new loan</Link>
                        </p>}
                    </div>
                </div>
            </div>
        );
    }
}

export default LoanStatus;
