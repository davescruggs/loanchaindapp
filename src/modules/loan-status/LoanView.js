import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ContractForm from '../../modules/contract-form';
import ContractFile from '../../modules/resource/loanchain.sol';
import BlockChain from '../../lib/blockchain';

class LoanView extends Component {

    constructor(props) {
        super(props);

        this.loanAddress = props.loanAddress;
        this.applicantAddress = props.applicantAddress;
        this.brokerView = props.brokerView;
        console.log("brokerView", this.brokerView);

        this.state = {
            invalidLoanInformation: false,
            loanInfo: undefined,
            loanAddress: this.loanAddress,
            applicantAddress: '',
            loanApproved: '',
            estimatedEMI: '',
            estimatedIntrestRate: '',
            approvedLoanAmount: '',
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
            editIntrestAndEMI: (props.editIntrestAndEMI === undefined) ? false : props.editIntrestAndEMI,
            brokerView: this.brokerView,
            applicantDetails: ''
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
        console.log("States ",state)
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
                loanReceived: loanInfoFound.received(),
                approvedLoanAmount: parseInt(loanInfoFound.approvedLoanAmount().toString(), 10),
            });

            console.log("Loan Info loanInfoFound ", parseInt(loanInfoFound.estimatedEMI().toString(), 10))

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
        const {
                loanAddress, invalidLoanInformation,
                applicantAddress, loanApproved,
                estimatedEMI, estimatedIntrestRate,
                goodCredit, loanAmount,
                loanPeriodInYears, loanProgramAddress,
                loanType, loanReceived,
                name, Gender, dob, zip, income, loanProgramName,
                editIntrestAndEMI, brokerView, approvedLoanAmount
            } = this.state,
            props = {
                contractFile : ContractFile,
                moduleTitle: 'Loan status',
                contractName: ':Loan',
                processCommandText: 'Ok',
                moduleTitle: 'Applicant Info',
                LoanTitle: 'Loan Info',
                Loanstatus: 'Choose Loan Program',
            }
            console.log("state values", parseInt(this.state.income));
        return (
            <div className="card mb-2 col-md-8 loan-view mar-bot-50">
                <div> 
                    <h5 className=" mb-0 py-2 ">{props.moduleTitle} - {this.state.name}</h5>
                    <hr />
                </div>
                    <div className="">
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
                <div className="box-body clearfix">
                        <h6 className="page-header"><i className="fa fa-user"></i> General </h6 >
                </div>
                    <div className="col-md-12 form-group">
                            <label className="col-md-4">Name</label>
                            <span className="col-md-8">{name}</span>
                    </div>
                    
                    <div className="col-md-12 form-group">
                            <label className="col-md-4">Gender</label>
                            <span className="col-md-8">{Gender}</span>
                    </div>
                    
                    <div className="col-md-12 form-group">
                            <label className="col-md-4">DOB</label>
                            <span className="col-md-8">{dob}</span>
                    </div>
                    
                    <div className="col-md-12 form-group">
                            <label className="col-md-4">Annual Income</label>
                            <span className="col-md-8">{ (income) ? parseInt(income, 10): ''}</span>
                    </div>
                    
                    <div className="col-md-12 form-group">
                            <label className="col-md-4">Zip</label>
                            <span className="col-md-8">{ (zip) ? parseInt(zip) : ''}</span>
                    </div>
                    
                    <div className="box-body clearfix">
                            <h6 className="page-header"><i className="fa fa-money"></i> {props.LoanTitle} </h6 >
                    </div>
                        <div className="col-md-12 form-group">
                                <label className="col-md-4">Loan Reference</label>
                                <span className="col-md-8">{loanAddress}</span>
                        </div>
                        
                        <div className="col-md-12 form-group">
                                <label className="col-md-4">Loan Program reference</label>
                                <span className="col-md-8">{loanProgramAddress}</span>
                        </div>
                        
                        <div className="col-md-12 form-group">
                                <label className="col-md-4">Loan Program</label>
                                <span className="col-md-8">{loanProgramName}</span>
                        </div>
                        
                        <div className="col-md-12 form-group">
                                <label className="col-md-4">Applicant Reference</label>
                                <span className="col-md-8">{applicantAddress}</span>
                        </div>
                        
                        <div className="col-md-12 form-group">
                                <label className="col-md-4">Loan Amount</label>
                                <span className="col-md-8">{ (loanAmount) ? parseInt(loanAmount) : ''}</span>
                        </div>
                        
                        <div className="col-md-12 form-group">
                                <label className="col-md-4">Loan type</label>
                                <span className="col-md-8">{loanType}</span>
                        </div>
                        
                        <div className="col-md-12 form-group">
                                <label className="col-md-4">Repayment period</label>
                                <span className="col-md-8">{ (loanPeriodInYears) ? parseInt(loanPeriodInYears): ''}</span>
                        </div>
                        
                        <div className="col-md-12 form-group">
                                <label className="col-md-4">Monthly payments</label>
                                <span className="col-md-8">{ (estimatedEMI) ? parseInt(estimatedEMI) : ''}</span>
                        </div>
                        
                        <div className="col-md-12 form-group">
                                <label className="col-md-4">Interest rate</label>
                                <span className="col-md-8">{ (estimatedIntrestRate) ? parseInt(estimatedIntrestRate) : ''}</span>
                        </div>
                        
                        <div className="col-md-12 form-group">
                                <label className="col-md-4">Credit status</label>
                                <span className="col-md-8">{goodCredit ? 'Approved' : 'Not Approved Yet'}</span>
                        </div>
                        
                        <div className="col-md-12 form-group">
                                <label className="col-md-4">Approval status</label>
                                <span className="col-md-8">{loanApproved ? 'Approved' : 'In process'}</span>
                        </div>
                        
                        {( loanApproved &&
                            <div className="col-md-12 form-group">
                                    <label className="col-md-4">Approved Amount</label>
                                    <span className="col-md-8">{ (approvedLoanAmount) ? parseInt(approvedLoanAmount) : '' }</span>
                            </div>
                        )}
                        
                        <div className="col-md-12 form-group">
                                <label className="col-md-4">Loan received status</label>
                                <span className="col-md-8">{loanReceived ? 'Received' : 'Not received'}</span>
                        </div>
                    
                    {brokerView &&
                        <p>
                            <div className="box-body clearfix">
                                        <h6 className="page-header"><i className="fa fa-bank"></i> {props.Loanstatus} </h6 >
                            </div>
                            <div className="row col-md-12">
                                    <div className="col-md-12 form-group">
                                        <label className="col-md-4">Loan Program:</label>
                                        <span className="col-md-8">
                                                <select>
                                                    <option value="Personal">Personal</option>
                                                    <option value="Home">Home</option>
                                                    <option value="Business">Business</option>
                                                </select>
                                        </span>
                                    </div>
                            </div>
                            
                            <div className="col-md-12 form-group">
                                <label className="col-md-4">&nbsp;</label>
                                <span className="no-padding">
                                    <input className="btn btn-sm btn-primary" type="submit" value="Apply" />
                                </span>
                            </div>
                        </p>
                    }
            </div>
        );
    }
}

export default LoanView;
