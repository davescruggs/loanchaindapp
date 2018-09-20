import React, { Component } from 'react';
import LoanStatus from '../../modules/loan-status';
import BlockChain from '../../lib/blockchain';
import LoanView from '../../modules/loan-status/LoanView';
import { web3 } from '../../web3';
import currencyImage from '../../modules/img/currency.png';
import queryString from 'query-string';
import Services from '../../lib/services';

class Manage extends Component {

    constructor(props) {
        super(props);

        this.loggedUserInfo = JSON.parse(localStorage.getItem("accountInfo"));
        if(this.loggedUserInfo) {
            this.accountId = this.loggedUserInfo.accountId;
            this.accountname = this.loggedUserInfo.accountName;
        }
        this.state = {
            loanInfo: undefined,
            applicant: undefined,
            loanProgram: undefined,
            compiledObject:  undefined,
            progress: undefined,
            updateInfo: undefined,
            editIntrestAndEMI: false,
            onSaveData: undefined,
            lockOperation: false,
            approved: false,
            creditStatus: undefined,
            applicantDetails: '',
            fromAccountAddress: this.accountId,
            loanHistories: ''
        }

        //TODO find the right way to find the key from search
        //this.loanAddress = props.location.search.replace('?loan=','');
        let params = queryString.parse(this.props.location.search);
        this.applicantAddress = params.applicant;
        this.loanAddress = params.loan;
        this.applicantAccountName = params.account;
        this.approvalType = params.type;
        this.applicantName = params.applicantName;
        this.organization = params.org;
        this.transHash = params.tx;
        console.log("organization", this.organization)
        
        this.onCompilationComplete = this.onCompilationComplete.bind(this);
        this.onLoanStatusNotified = this.onLoanStatusNotified.bind(this);
        this.onApproveLoan = this.onApproveLoan.bind(this);
        this.onEditIntrestAndEMI = this.onEditIntrestAndEMI.bind(this);
        this.onSaveIntrestAndEMI = this.onSaveIntrestAndEMI.bind(this);
        this.onDataChange = this.onDataChange.bind(this);
        this.baseURL = '';
        if (window.location.host.indexOf('localhost') == 0) {
            this.baseURL = 'http://localhost:7000';
        }
        this.getApplicantDetails = this.getApplicantDetails.bind(this);
        this.getApplicantDetails();
        this.getLoanHistory(this.loanAddress);
        console.log("this Acc name", this.applicantAccountName);
        console.log("this App", this.applicantAddress);
    }

    onCompilationComplete(compiledObject) {

        this.compiledObject = compiledObject;
    }

    async componentDidMount(){
        /* await this.getLoanHistory(this.loanAddress);
        const { loanHistories } = this.state;
        console.log('loanHistories ', loanHistories);
        if(this.organization != '' && this.organization !=undefined && (loanHistories == '' || loanHistories == undefined)) {
            let loanHistoryInfo = {};
            loanHistoryInfo.createdHash = this.transHash;
            loanHistoryInfo.appliedHash = this.transHash;
            loanHistoryInfo.creditStatusTrans = [];
            loanHistoryInfo.monthlyPayTrans = [];
            loanHistoryInfo.approveLoanTrans = '';
            console.log('loanHistoryInfo ', loanHistoryInfo);
            const loanHistory = {[this.loanAddress] : loanHistoryInfo}
            this.updateLoanHistory(loanHistory);
        }
        
       console.log("contractDetails ", this.state.contractDetails); */
    }

    onUpdateCredit(creditStatus) {

        const { loanInfo, loanHistories } = this.state,
            creditStatusMessage = creditStatus ? 'Good credit updated!!!' : 'Good credit declined';

        this.setState({ lockOperation: true, progress: 'Processing credit' })
        
        console.log("loanHistoryId contract loanHistoryId", loanHistories);
        return new Promise((resolve, reject) => {

            this.resolveUpdateCredit = resolve;
            console.log("NEW CULPRIT 1");
            BlockChain.getInflatedGas(this.compiledObject, ':LoanProgram').then(({inflatedGas, byteCode}) => {
              console.log("NEW CULPRIT 2");
               const creditUpdateHash = loanInfo.updateCreditStatus(creditStatus,
                    {from: BlockChain.fromAccount(), data: byteCode, gas:inflatedGas},
                    (error, contract) => {
                        if(error) {
                            reject(error);
                        } else {
                            if(this.organization != ''  && this.organization != undefined) {
                                const creditInfo = creditStatus ? "Approved" : "Rejected";
                                BlockChain.getContract(this.compiledObject,':Applicant', loanInfo.applicantContractAddress()).then((applicant) => {
                                    const applicantName = applicant.getApplicantDetails()[0];
                                    const creditStatusInfo = {
                                        "Applicant_Name__c": applicantName,
                                        "loanReference__c": loanInfo.address,
                                        "type__c": "C",
                                        "status__c" : creditInfo
                                    }
                                    this.updatePlatformEvents(creditStatusInfo);
                                });
                            }
                            if(loanHistories) {
                                console.log("loanHistories creditTransactHash", loanHistories);
                                var loanHistoryId = Object.keys(loanHistories);
                                var creditTransactHash = loanHistories[loanHistoryId].creditStatusTrans;
                                creditTransactHash.push(contract);
                                loanHistories[loanHistoryId].creditStatusTrans = creditTransactHash;
                                this.updateLoanHistory(loanHistories);
                            }
                            this.resolveUpdateCreditMessage = creditStatusMessage;
                        }
                    }
                );
            });
        }).then((result) => {
            console.log("Success Result", result);
            console.log("creditStatus", creditStatus);
            this.setState({ creditStatus, lockOperation: false, updateInfo: {goodCredit: creditStatus}, progress: result })

        }).catch((error) => {
            console.log("error", error);
            this.setState({ lockOperation: false, progress: 'Error occured in credit update processing ' + error.toString() })

        })

    }

    onApproveLoan() {

        const { loanInfo, approvedLoanAmount, applicantDetails, fromAccountAddress, loanHistories } = this.state;

        this.setState({ lockOperation: true, progress: 'Processing loan approval' })
        var loanHistoryId = Object.keys(loanHistories);        
        return new Promise((resolve, reject) => {
            this.resolveApproveLoan = resolve;
            BlockChain.getInflatedGas(this.compiledObject, ':LoanProgram').then(({inflatedGas, byteCode}) => {
            console.log("NEW CULPRIT 4");
                try {
                    console.log("try block 1");
                    let approvedEtherAmount = BlockChain.getEtherPrice(parseInt(approvedLoanAmount));
                    //console.log("approvedEtherAmount", approvedEtherAmount);
                    loanInfo.approveLoan(approvedLoanAmount, {from: fromAccountAddress, data: byteCode, gas:inflatedGas, value: approvedLoanAmount},
                        (error, contract) => {
                            if(error) {
                                console.log("NEW error", error);
                                reject(error);
                            } else {
                                console.log("Loan approved successfully ");
                                console.log("applicantDetails ", applicantDetails);
                                this.resolveApproveLoanMessage = 'Loan approved successfully!!!';
                                let applicantLists = '';
                                loanHistories[loanHistoryId].approveLoanTrans = contract;
                                this.updateLoanHistory(loanHistories);
                                if (applicantDetails) {
                                    applicantLists = Object.values(applicantDetails); 
                                    for (let i in applicantLists) {
                                        for (let j in applicantLists[i]) {
                                            if(applicantLists[i][j].applicantAddress == this.applicantAddress){
                                                applicantLists[i][j].status = "Approved";
                                            }
                                        }
                                    }
                                    let accountname = this.state.accountName;
                                    const loanAppInfo = {[this.applicantAccountName] : applicantLists[0]};
                                    this.updateApplicantInfo(loanAppInfo);
                                    console.log('applicantList loanAppInfo', loanAppInfo);
                                    console.log('applicantList applicantLists', applicantLists);
                                }

                                if(this.organization != ''){
                                    
                                    BlockChain.getContract(this.compiledObject,':Applicant', loanInfo.applicantContractAddress()).then((applicant) => {
                                        const applicantName = applicant.getApplicantDetails()[0];
                                        const monthlyPaymentInfo = {
                                            "Applicant_Name__c": applicantName,
                                            "loanReference__c": loanInfo.address,
                                            "type__c": "LS",
                                            "status__c" : "Approved"
                                        }
                                        this.updatePlatformEvents(monthlyPaymentInfo);
                                    });
                                }
                            }
                        }
                    );
                } catch(error) {
                    console.log("error  BlockChain Loan Approve Info ", error);
                }
                //setTimeout(resolve, 50000);

            });
        }).then((result) => {
            
            console.log("result  ", result);
            this.setState({ approved: true, lockOperation: false, updateInfo: { loanApproved: true, approvedLoanAmount:approvedLoanAmount }, progress: result })

        }).catch((error) => {
            console.log("result error ", error);
            this.setState({ lockOperation: false, progress: 'Error occured in loan approval processing ' + error.toString() })

        })

    }

    onEditIntrestAndEMI() {
        this.setState({
            editIntrestAndEMI: true
        })
    }

    onDataChange(state) {
        console.log(state.target.value, state.target.name);
        this.setState({ [state.target.name]: parseInt(state.target.value, 10) || 0 });
    }
    
    resolveAddDisclosure() {

    }

    resolveUpdateCredit() {

    }

    resolveApproveLoan() {
        
    }

    onSaveIntrestAndEMI() {

        const { loanInfo, estimatedEMI,  estimatedIntrestRate, loanHistories} = this.state;

        this.setState({ lockOperation: true, progress: 'Processing emi and interest rate' })
        
        this.setState({
            onSaveData: ((state) => {

                console.log('estimatedEMI', estimatedEMI);
                console.log('estimatedIntrestRate', estimatedIntrestRate);

                return new Promise((resolve, reject) => {

                    this.resolveAddDisclosure = resolve;
console.log("NEW CULPRIT 5");
                    BlockChain.getInflatedGas(this.compiledObject, ':LoanProgram').then(({inflatedGas, byteCode}) => {
            console.log("NEW CULPRIT 6");
                        loanInfo.addDisclosure(estimatedIntrestRate, estimatedEMI,
                            {from: BlockChain.fromAccount(), data: byteCode, gas:inflatedGas},
                            (error, contract) => {
                                if(error) {
                                    reject(error);
                                } else {
                                    
                                    if(this.organization != '' && this.organization != undefined){
                                        
                                        BlockChain.getContract(this.compiledObject,':Applicant', loanInfo.applicantContractAddress()).then((applicant) => {
                                        const applicantName = applicant.getApplicantDetails()[0];
                                        console.log("loanInfo applicantName", applicantName);
                                        const monthlyPaymentInfo = {
                                            "Applicant_Name__c": applicantName,
                                            "loanReference__c": loanInfo.address,
                                            "type__c": "I",
                                            "loanInterest__c" : estimatedIntrestRate,
                                            "loanMonthlyPay__c": estimatedEMI
                                        }
                                        this.updatePlatformEvents(monthlyPaymentInfo);
                                        })
                                    }
                                    this.resolveAddDisclosureMessage = 'Estimated Interest Rate and Estimated EMI saved successfully!!!';
                                    if(loanHistories) {
                                        var loanHistoryId = Object.keys(loanHistories);
                                        var monthlyPayTransactHash = loanHistories[loanHistoryId].monthlyPayTrans;
                                        console.log("loanInfo  monthlyPayTransactHash contract", contract);
                                        monthlyPayTransactHash.push(contract);
                                        loanHistories[loanHistoryId].monthlyPayTrans = monthlyPayTransactHash;
                                        this.updateLoanHistory(loanHistories);
                                    }
                                }
                            }
                        );

                    });
                }).then((result) => {

                    this.setState({ lockOperation: false, editIntrestAndEMI: false, updateInfo: { estimatedIntrestRate: estimatedIntrestRate, estimatedEMI: estimatedEMI }, progress: result })

                }).catch((error) => {

                    this.setState({ lockOperation:false, editIntrestAndEMI: false, progress: 'Error occured in save ' + error.toString() })

                })

            })
        }, () => {
            this.setState({ onSaveData: undefined });
        });

    }

    onLoanStatusNotified(loanInfo, applicant, loanProgram) {
        return new Promise((resolve, reject) => {
            if((loanInfo) && (!this.state.loanInfo)) {

                loanInfo.UpdatingCreditStatusFor((args) => {
                    this.resolveUpdateCredit(this.resolveUpdateCreditMessage);
                });

                loanInfo.DisclosuresUpdated((args) => {
                    this.resolveAddDisclosure(this.resolveAddDisclosureMessage);
                });

                loanInfo.LoanAmountTxfed((args) => {
                    this.resolveApproveLoan(this.resolveApproveLoanMessage);
                });

                this.setState({
                    approved: loanInfo.approved(),
                    creditStatus: loanInfo.goodCredit()
                })

            }

            this.setState({
                loanInfo,
                applicant,
                loanProgram
            });
        });
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

    updatePlatformEvents(loanInfo) {
        (async () => {
            const loanResponse = await fetch(this.baseURL+'/update/events?org='+this.organization, {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(loanInfo)
            });
            /* const content = await loanResponse.json();
            console.log("rawResponse", content); */
          })();
    }

   async getLoanHistory() {
       await Services.getLoanHistory(this.loanAddress).then(
            response => {
                console.log("response", response)
                this.setState({ loanHistories : response })
                if(response == '') {
                    this.createTransHistory();
                }
            }
        ).catch((err) => {
            console.log("error", err);
        });
        console.log("loanHistories", this.state.loanHistories)
    }

    async createTransHistory(){
        
        const { loanHistories } = this.state;
        console.log('loanHistories ', loanHistories);
        if(this.organization != '' && this.organization != undefined) {
            let loanHistoryInfo = {};
            loanHistoryInfo.createdHash = this.transHash;
            loanHistoryInfo.appliedHash = this.transHash;
            loanHistoryInfo.creditStatusTrans = [];
            loanHistoryInfo.monthlyPayTrans = [];
            loanHistoryInfo.approveLoanTrans = '';
            console.log('loanHistoryInfo ', loanHistoryInfo);
            const loanHistory = {[this.loanAddress] : loanHistoryInfo}
            this.updateLoanHistory(loanHistory);
        }
    }

    updateLoanHistory(loanHistory) {
        (async () => {
            const rawResponse = await fetch('/loanhistory/create/', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(loanHistory)
            });
            //const content = await rawResponse.json();
            //console.log("rawResponse", content);
            this.getLoanHistory();
          })();
    }

    render() {

        const {
            loanInfo,
            progress,
            updateInfo,
            editIntrestAndEMI,
            onSaveData,
            lockOperation,
            approved,
            creditStatus,
            applicantDetails
        } = this.state,
        operationDisabled = loanInfo === undefined || lockOperation;

        return <div>
            <div className="menu-bar col-md-12">
                <div className="row">
                        <div className="col-md-9">
                            <div className="">
                                    <span className="text-white"> Applications > {this.applicantName} </span>
                            </div>
                            <div className="col-md-6 pull-right">&nbsp;</div>
                        </div>
                    <div className="col-md-3 pull-right">  
                        <div className="pull-right text-white">
                            <img src={currencyImage} className="" alt="" /> 
                            &nbsp;  Balance : 
                            ( { BlockChain.getUserBalance(this.accountId)} Tokens)
                        </div>
                    </div>
                </div>
            </div>
            {progress &&
                <div className="col-md-12 progress-alert row">
                    <div className="col-md-2">&nbsp;</div>
                    <div className="col-md-9 alert alert-success alert-dismissable fade show"
                        role="alert">{ progress }</div>
                </div>
            }
            <div className="col-md-12 row">
            <div className="col-md-2">&nbsp;</div>
            <div className="col-md-6 card">
                <LoanView updateInfo = { updateInfo }
                    onCompilationComplete = { this.onCompilationComplete }
                    loanAddress = {this.loanAddress}
                    onLoanStatusNotified = { this.onLoanStatusNotified }
                    editIntrestAndEMI = { editIntrestAndEMI }
                    onSaveData = { onSaveData } />
            </div>
            <div className="col-md-3">
            <div className="card">
                <div className="page-header">Status & Actions</div>
                <div className="col-md-12 no-padding">
                    <label className="col-md-5 loan-label">Credit status</label>
                    <span className="col-md-6 loan-content-text">{creditStatus ? 'Approved' : 'Not Approved Yet'}</span>
                </div>
                <div className="col-md-12  no-padding">
                    <label className="col-md-5 loan-label">Loan status</label>
                    <span className="col-md-6 loan-content-text">{approved ? 'Approved' : 'Received'}</span>
                </div>
             
                {( editIntrestAndEMI &&
                    <div>
                        <div className="col-md-12 row ">
                            <label className="col-md-4 loan-label">Monthly payments</label>
                            <div className="col-md-7 loan-content-text">
                                <input type="text" name="estimatedEMI" onChange={this.onDataChange} className="form-control form-control-sm" placeholder="0" />
                            </div>
                        </div>
                        <div className="col-md-12 row ">
                            <label className="col-md-4 loan-label">Interest rate</label>
                            <span className="col-md-7 loan-content-text">
                                <input type="text" name="estimatedIntrestRate" onChange={this.onDataChange} className="form-control form-control-sm" placeholder="0" />
                            </span>
                        </div>
                    </div>
                )}
                { approved }
                {( creditStatus && !approved &&
                    <div className="col-md-12 row">
                        <label className="col-md-4 loan-label"> {approved} Approved loan amount</label>
                        <span className="col-md-7 loan-content-text">
                            <input type="text" name="approvedLoanAmount" onChange={this.onDataChange} className="form-control form-control-sm" placeholder="0" />
                        </span>
                    </div>
                )}
                <br />
                <div className="text-center">
                        {!editIntrestAndEMI && <input type = "button" onClick = { this.onEditIntrestAndEMI } className = "btn btn-success col-md-10 btn-style" value = "Edit Interest & Monthly Payments" disabled = { operationDisabled } />}
                        {editIntrestAndEMI && <input type = "button" onClick = { this.onSaveIntrestAndEMI } className = "btn btn-success col-md-10 btn-style" value = "Set Interest & Monthly Payments" disabled = { operationDisabled } />}
                        <input type = "button" onClick = { this.onUpdateCredit.bind(this, true) } className = "btn btn-success col-md-10 btn-style" value = "Approve Credit" disabled = { operationDisabled } />
                        <input type = "button" onClick = { this.onUpdateCredit.bind(this, false) } className = "btn btn-success col-md-10 btn-style" value = "Decline Credit" disabled = { operationDisabled } />
                        <input type = "button" onClick = { this.onApproveLoan } className = "btn btn-success col-md-10 btn-style" value = "Approve Loan" disabled = { operationDisabled || approved || !creditStatus } />
                </div>
                <div>
                    <ul className="list-group list-group-flush list-style-type:square">
                        <li className="list-group-item">Mortgage request is recorded as a smart contract in blockchain</li>
                        <li className="list-group-item">The long hexadecimal string you see here are the contract Ids</li>
                        <li className="list-group-item">DApps call functions on smart contracts to make stage changes</li>
                        <li className="list-group-item">Every function call is recorded as a transaction in blockchain</li>
                    </ul>
                </div>
            </div>
            </div>
        </div>
        </div>
    }
}

export default Manage;
