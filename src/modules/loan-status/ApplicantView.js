import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ContractForm from '../../modules/contract-form';
import ContractFile from '../../modules/resource/loanchain.sol';
import BlockChain from '../../lib/blockchain';

class ApplicantView extends Component {

    constructor(props) {
        super(props);

        this.loanAddress = props.loanAddress;
        this.applicantAddress = props.applicantAddress;
        this.applicantAccountName = props.accountName;
        this.brokerView = props.brokerView;
        this.loggedUserInfo = JSON.parse(localStorage.getItem("accountInfo"));
        console.log("brokerView ApplicantView", this.brokerView);
        if(this.loggedUserInfo) {
            this.accountId = this.loggedUserInfo.accountId;
            this.accountname = this.loggedUserInfo.accountname;
        }
        this.state = {
            invalidLoanInformation: false,
            loanInfo: undefined,
            loanAddress: this.loanAddress,
            applicantAddress: this.applicantAddress,
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
            contractDetails: '',
            applicantDetails: '',
            userAccountId: this.accountId,
        }

        this.compiledObject = undefined;
        this.resolveSubmitLoan = undefined;

        this.onCompilationComplete = this.onCompilationComplete.bind(this);
        //this.onLoanInfoFound = this.onLoanInfoFound.bind(this);
        this.onLoanProcess = this.onLoanProcess.bind(this);
        this.onDataChange = this.onDataChange.bind(this);
        this.baseURL = '';
        this.applyLoanProgram = this.applyLoanProgram.bind(this);
        if (window.location.host.indexOf('localhost') == 0) {
            this.baseURL = 'http://localhost:7000';
        }
        this.onLoanProgramFound = this.onLoanProgramFound.bind(this);
        this.getApplicantDetails = this.getApplicantDetails.bind(this);
        this.getApplicantDetails();
        //this.onUpdateContract = this.onUpdateContract.bind(this);
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

    onCompilationComplete(compiledObject, componentState) {

        const { applicantAddress } = this.state;
        this.compiledObject = compiledObject;
        console.log("componentState ", componentState);
        this.readLoanInfo();
    }

    async componentDidMount(){
        await fetch(this.baseURL+'/contracts/').then(
            response => response.json() ).then(
            resulstData => this.setState(
                { contractDetails: resulstData }
               
        )).catch((err) => {
            console.log("error", err);
       });
       console.log("contractDetails ", this.state.contractDetails);
    }

    async getContractDetails() {
        await fetch(this.baseURL+'/contracts/').then(
            response => response.json() ).then(
            resulstData => this.setState(
                { contractDetails: resulstData }
               
        )).catch((err) => {
            console.log("error", err);
       });
    }

    readLoanInfo() {

        const { compiledObject } = this,
            { applicantAddress } = this.state;
        console.log("CULPRIT 3");
        console.log("applicantAddress", applicantAddress)
        BlockChain.getContract(compiledObject, ':Applicant', applicantAddress).then((applicant) => {
            //loanInfo.loanType();
            const applicantInfo = applicant.getApplicantDetails();
            const applicantAmountInfo = applicant.getLoanInfo()
            this.setState({
                applicant: applicant,
                name: applicantInfo[0],
                Gender: applicantInfo[1],
                dob: applicantInfo[2],
                zip: applicantInfo[3],
                income: applicantInfo[4],
                loanType: applicantAmountInfo[0],
                loanAmount: applicantAmountInfo[1],
                loanPeriodInYears: applicantAmountInfo[2],
            });
            //this.onApplicantInfoFound(applicantInfo);
        }).catch((error) => {
            console.log('error readLoanInfo', error);
            this.setState({
                applicantInfo: undefined,
                invalidLoanInformation: true
            });
        });
    }

    applyLoanProgram () {

        const { compiledObject } = this,
        { applicantAddress } = this.state;
        const contracts = document.getElementById("loan-program");
        const loanprogramContractId = contracts.options[contracts.selectedIndex].value;
        const loanProgramName = contracts.options[contracts.selectedIndex].text;
        console.log("Contract Information ", loanprogramContractId);
        console.log("loanProgramName ", loanProgramName);
        try {
            BlockChain.getContract(compiledObject, ':LoanProgram', loanprogramContractId).then((loanProgram) => {
                loanProgram.name();
                console.log("Loan Program ", loanProgram)
                this.onLoanProgramFound(loanProgram);
            }).catch((error) => {
                
                BlockChain.getGasPriceAndEstimate(compiledObject, ':LoanProgram').then(({gasPrice, gasEstimate}) => {
                    BlockChain.deployContract([loanProgramName], compiledObject, this.onLoanProgramFound, gasPrice, gasEstimate, ':LoanProgram').catch((error) => {
                        //TODO: Handle Loan Program failure error here
                    });

                });
            });
        } catch (error) {
            console.log("Deployment Error ", error);
        }

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

    onLoanProgramFound(loanProgram) {
        
        const { applicant, loanType , loanAmount, loanPeriodInYears, applicantDetails, userAccountId} = this.state;
        console.log("applicantDetails", applicantDetails);
        /*applicantDetails.forEach(function(applicantDetail) {
            
            console.log("applicantDetails", applicantDetail);
        });*/
        
        if(loanProgram.address) {
            try {
                BlockChain.getInflatedGas(this.compiledObject, ':LoanProgram').then(({inflatedGas, byteCode}) => {
                    console.log('loanProgram submitLoanApplication', loanProgram);
                        loanProgram.apply(applicant.address,
                            loanType,
                            parseInt(loanAmount,10),
                            parseInt(loanPeriodInYears,10),
                            {from: userAccountId, data: byteCode, gas:inflatedGas}
                        );
                        this.resolveSubmitLoan = true;
        
                });
                loanProgram.ApplicationCreated((error, loanContract) => {
                    console.log('loanContract', loanContract);

                    let applicantLists = '';
                    if (applicantDetails) {
                        applicantLists = Object.values(applicantDetails); 
                        for (let i in applicantLists) {
                            for (let j in applicantLists[i]) {
                                if(applicantLists[i][j].applicantAddress == applicant.address){
                                    applicantLists[i][j].loanAddress = loanContract.args.contractAddress;
                                    applicantLists[i][j].status = "Inprogress";
                                }
                            }
                        }
                        let accountname = this.state.accountName;
                        const loanAppInfo = {[this.applicantAccountName] : applicantLists[0]};
                        this.updateApplicantInfo(loanAppInfo);
                        console.log('applicantList loanAppInfo', loanAppInfo);
                        console.log('applicantList applicantLists', applicantLists);
                        this.setState({ redirectToLoanDetails: '/brokerlist' });
                    }
                    this.resolveSubmitLoan = true;                    
                    if(this.resolveSubmitLoan) {
                        this.setState({ redirectToLoanStatus: '/loanstatus?loan=' + loanContract.args.contractAddress });
                    }
                });
            } catch(error) {
                console.log("submitLoanApplication ERROR", error)
                //reject(error.toString());
            }
            this.setState({
                loanProgram,
                programName: loanProgram.name(),
                loanProgramAddress: loanProgram.address
            })
        }
    }

    submitLoanApplication() {

       const { applicant, loanType , loanAmount, loanPeriodInYears, loanProgram } = this.state;
       console.log('loanProgram submitLoanApplication applicant', applicant);
        try {
            BlockChain.getInflatedGas(this.compiledObject, ':LoanProgram').then(({inflatedGas, byteCode}) => {
              console.log('loanProgram submitLoanApplication', loanProgram);
                loanProgram.apply(applicant.address,
                    loanType,
                    loanAmount,
                    loanPeriodInYears,
                    {from: BlockChain.fromAccount(), data: byteCode, gas:inflatedGas}
                );
                this.resolveSubmitLoan = true;

            });
        } catch(error) {
            console.log("submitLoanApplication ERROR", error)
            //reject(error.toString());
        }
    }

     async getApplicantDetails() {

        await fetch(this.baseURL+'/applicants/'+ this.applicantAccountName).then(
            response => response.json() ).then(
            resulstData => this.setState(
                { applicantDetails: resulstData }
        )).catch((err) => {
            console.log("error", err);
       });
       console.log(this.state.applicantDetails, "applicantDetails")
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
        const {
                loanAddress, invalidLoanInformation,
                applicantAddress, loanApproved,
                estimatedEMI, estimatedIntrestRate,
                goodCredit, loanAmount,
                loanPeriodInYears, loanProgramAddress,
                loanType, loanReceived,
                name, Gender, dob, zip, income, loanProgramName,
                editIntrestAndEMI, brokerView, approvedLoanAmount,contractDetails, redirectToLoanDetails
            } = this.state,
            props = {
                contractFile : ContractFile,
                moduleTitle: 'Loan status',
                contractName: ':Loan',
                moduleTitle: 'Applicant Info',
                LoanTitle: 'Loan Info',
                Loanstatus: 'Choose Loan Program',
                contractDetails: contractDetails,
                /*form: {
                    loanProgram: {title: 'Loan Program', inputType:'select', styleId: "loan-program"}
                }*/
            }
            console.log("state values", parseInt(this.state.income));
            console.log("contractDetails", this.state.contractDetails);
        return (
            <div className="card mb-2 col-md-8 loan-view">
                <div> 
                    <h5 className=" mb-0 py-2 ">{props.moduleTitle} - {this.state.name}</h5>
                    
                </div>
                <div className="">
                    {(!invalidLoanInformation) &&
                        <ContractForm { ...props }
                            onCompilationComplete = { this.onCompilationComplete }
                            onSubmit = { this.applyLoanProgram }
                            onDataChange = { this.onDataChange } />}
                    { redirectToLoanDetails && window.location.assign(redirectToLoanDetails) }
                    {invalidLoanInformation &&
                        <p align="center">
                        Not a valid loan or loan not found<br />
                        <Link to = '/'>Apply new loan</Link>
                    </p>}
                </div>
                <div className="box-body clearfix">
                        <h6 className="page-header"><i className="fa fa-user"></i> Applicant Info </h6 >
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
                            <span className="col-md-8">{(zip) ? parseInt(zip, 10) : ''}</span>
                    </div>
                    
                        <div className="col-md-12 form-group">
                                <label className="col-md-4">Applicant Reference</label>
                                <span className="col-md-8">{applicantAddress}</span>
                        </div>
                        
                        <div className="col-md-12 form-group">
                                <label className="col-md-4">Loan Amount</label>
                                <span className="col-md-8">{(loanAmount) ? parseInt(loanAmount): ''}</span>
                        </div>
                        
                        <div className="col-md-12 form-group">
                                <label className="col-md-4">Loan type</label>
                                <span className="col-md-8">{loanType}</span>
                        </div>
                        
                        <div className="col-md-12 form-group">
                                <label className="col-md-4">Repayment period</label>
                                <span className="col-md-8">{(loanPeriodInYears) ? parseInt(loanPeriodInYears): ''}</span>
                        </div>
                    
                    {loanAddress && 
                    <div>
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
                                <label className="col-md-4">Monthly payments</label>
                                <span className="col-md-8">{ (estimatedEMI) ? parseInt(estimatedEMI) : ''}</span>
                        </div>
                        
                        <div className="col-md-12 form-group">
                                <label className="col-md-4">Interest rate</label>
                                <span className="col-md-8">{(estimatedIntrestRate) ? parseInt(estimatedIntrestRate): ''}</span>
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
                                    <span className="col-md-8">{ (approvedLoanAmount) ? parseInt(approvedLoanAmount): '' }</span>
                            </div>
                        )}
                        <div className="col-md-12 form-group">
                                <label className="col-md-4">Loan received status</label>
                                <span className="col-md-8">{loanReceived ? 'Received' : 'Not received'}</span>
                        </div>
                    </div>
                    }
                    {brokerView && contractDetails &&
                        <div>
                            <div className="box-body clearfix">
                                        <h6 className="page-header"><i className="fa fa-bank"></i> {props.Loanstatus} </h6 >
                            </div>
                            <div className="row col-md-12">
                                    <div className="col-md-12 form-group">
                                        <label className="col-md-4">Loan Program:</label>
                                        <span className="col-md-8">
                                                <select className="form-control-sm" id="loan-program">{
                                                    contractDetails.map((contractDetail) => {
                                                        return <option value={contractDetail.contractid}>{contractDetail.name}</option>
                                                    })
                                                }</select>
                                        </span>
                                    </div>
                            </div>
                            
                            <div className="col-md-12 form-group">
                                <label className="col-md-4">&nbsp;</label>
                                <span className="no-padding">
                                    <input className="btn btn-sm btn-primary" type="submit" value="Apply" onClick={this.applyLoanProgram} />
                                </span>
                            </div>
                        </div>
                    }
                    
            </div>
        );
    }
}

export default ApplicantView;