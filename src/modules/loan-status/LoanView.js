import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ContractForm from '../../modules/contract-form';
import ContractFile from '../../modules/resource/loanchain.sol';
import BlockChain from '../../lib/blockchain';
import moment  from 'moment';

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
            ssn: '',
            zip: '',
            income: '',
            fullAddress: '',
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
                var securitySsn = parseInt(applicantInfo[3]).toString();
                var maskedSSN = securitySsn.substring(securitySsn.length - 4);
                var applicantAddress = applicantInfo[6];
                const fullAddress = applicantAddress.replace(/-/g, ",");
                console.log("fullAddress3", fullAddress)
                this.setState({
                    applicant: applicant,
                    name: applicantInfo[0],
                    Gender: applicantInfo[1],
                    dob: applicantInfo[2],
                    ssn: 'XXX-XX-'+maskedSSN,
                    income: applicantInfo[4],
                    fullAddress: fullAddress
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
                name, Gender, dob, ssn, income, fullAddress, loanProgramName,
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
            console.log("state values", dob);
            var formatedDate = dob.toString().substring(0, 10);
        return (
            <div className="">
                    <div className="page-header">General Infomartion</div>
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
                    <div className="col-md-12">
                            <label className="col-md-4 loan-label">Name</label>
                            <span className="col-md-8 loan-content-text">{name}</span>
                    </div>
                    
                    <div className="col-md-12 hide">
                            <label className="col-md-4 loan-label">Gender</label>
                            <span className="col-md-8 loan-content-text">{Gender}</span>
                    </div>
                    
                    <div className="col-md-12">
                            <label className="col-md-4 loan-label">DOB</label>
                            <span className="col-md-8 loan-content-text">{formatedDate}</span>
                    </div>
                    
                    <div className="col-md-12">
                            <label className="col-md-4 loan-label">Annual Income</label>
                            <span className="col-md-8 loan-content-text">{ (income) ? parseInt(income, 10): ''}</span>
                    </div>
                    
                    <div className="col-md-12">
                            <label className="col-md-4 loan-label">SSN</label>
                            <span className="col-md-8 loan-content-text">{ ssn }</span>
                    </div>
                    {( fullAddress && 
                    <div className="col-md-12">
                            <label className="col-md-4 loan-label">Address</label>
                            <span className="col-md-8 loan-content-text">{ fullAddress }</span>
                    </div>
                    )}
                    <div className="page-header">Loan Infomartion</div>
                        <div className="col-md-12">
                                <label className="col-md-4 loan-label">Loan Reference</label>
                                <span className="col-md-8 loan-content-text">{loanAddress}</span>
                        </div>
                        
                        <div className="col-md-12">
                                <label className="col-md-4 loan-label">Loan Program reference</label>
                                <span className="col-md-8 loan-content-text">{loanProgramAddress}</span>
                        </div>
                        
                        <div className="col-md-12">
                                <label className="col-md-4 loan-label">Loan Program</label>
                                <span className="col-md-8 loan-content-text">{loanProgramName}</span>
                        </div>
                        
                        <div className="col-md-12">
                                <label className="col-md-4 loan-label">Applicant Reference</label>
                                <span className="col-md-8 loan-content-text">{applicantAddress}</span>
                        </div>
                        
                        <div className="col-md-12">
                                <label className="col-md-4 loan-label">Loan Amount</label>
                                <span className="col-md-8 loan-content-text">{ (loanAmount) ? parseInt(loanAmount) : ''}</span>
                        </div>
                        
                        <div className="col-md-12">
                                <label className="col-md-4 loan-label">Loan type</label>
                                <span className="col-md-8 loan-content-text">{loanType}</span>
                        </div>
                        
                        <div className="col-md-12">
                                <label className="col-md-4 loan-label">Repayment period</label>
                                <span className="col-md-8 loan-content-text">{ (loanPeriodInYears) ? parseInt(loanPeriodInYears): ''}</span>
                        </div>
                        
                        <div className="col-md-12">
                                <label className="col-md-4 loan-label">Monthly payments</label>
                                <span className="col-md-8 loan-content-text">{ (estimatedEMI) ? parseInt(estimatedEMI) : ''}</span>
                        </div>
                        
                        <div className="col-md-12">
                                <label className="col-md-4 loan-label">Interest rate</label>
                                <span className="col-md-8 loan-content-text">{ (estimatedIntrestRate) ? parseInt(estimatedIntrestRate) : ''}</span>
                        </div>
                        
                        
                        <div className="col-md-12">
                                <label className="col-md-4 loan-label">Approval status</label>
                                <span className="col-md-8 loan-content-text">{loanApproved ? 'Approved' : 'In process'}</span>
                        </div>
                        
                        {( loanApproved &&
                            <div className="col-md-12">
                                    <label className="col-md-4 loan-label">Approved Amount</label>
                                    <span className="col-md-8 loan-content-text">{ (approvedLoanAmount) ? parseInt(approvedLoanAmount) : '' }</span>
                            </div>
                        )}
                        
                        <div className="col-md-12">
                                <label className="col-md-4 loan-label">Loan received status</label>
                                <span className="col-md-8 loan-content-text">{loanReceived ? 'Received' : 'Not received'}</span>
                        </div>
                    
                    {brokerView &&
                        <p>
                            <div className="box-body clearfix">
                                        <h6 className="page-header"><i className="fa fa-bank"></i> {props.Loanstatus} </h6 >
                            </div>
                            <div className="row col-md-12">
                                    <div className="col-md-12">
                                        <label className="col-md-4 loan-label">Loan Program:</label>
                                        <span className="col-md-8 loan-content-text">
                                                <select>
                                                    <option value="Personal">Personal</option>
                                                    <option value="Home">Home</option>
                                                    <option value="Business">Business</option>
                                                </select>
                                        </span>
                                    </div>
                            </div>
                            
                            <div className="col-md-12">
                                <label className="col-md-4 loan-label">&nbsp;</label>
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
