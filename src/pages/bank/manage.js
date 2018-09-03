import React, { Component } from 'react';
import LoanStatus from '../../modules/loan-status';
import BlockChain from '../../lib/blockchain';
import LoanView from '../../modules/loan-status/LoanView';
import { web3 } from '../../web3';
import queryString from 'query-string';

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
        }

        //TODO find the right way to find the key from search
        //this.loanAddress = props.location.search.replace('?loan=','');
        let params = queryString.parse(this.props.location.search);
        this.applicantAddress = params.applicant;
        this.loanAddress = params.loan;
        this.applicantAccountName = params.account;
        this.approvalType = params.type;
        
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
        console.log("this Acc name", this.applicantAccountName);
        console.log("this App", this.applicantAddress);
    }

    onCompilationComplete(compiledObject) {

        this.compiledObject = compiledObject;
    }

    onUpdateCredit(creditStatus) {

        const { loanInfo } = this.state,
            creditStatusMessage = creditStatus ? 'Good credit updated!!!' : 'Good credit declined';

        this.setState({ lockOperation: true, progress: 'Processing credit' })

        return new Promise((resolve, reject) => {

            this.resolveUpdateCredit = resolve;
            console.log("NEW CULPRIT 1");
            BlockChain.getInflatedGas(this.compiledObject, ':LoanProgram').then(({inflatedGas, byteCode}) => {
              console.log("NEW CULPRIT 2");
                loanInfo.updateCreditStatus(creditStatus,
                    {from: BlockChain.fromAccount(), data: byteCode, gas:inflatedGas},
                    (error, contract) => {
                        if(error) {
                            reject(error);
                        } else {
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

        const { loanInfo, approvedLoanAmount, applicantDetails, fromAccountAddress } = this.state;

        this.setState({ lockOperation: true, progress: 'Processing loan approval' })
        
        return new Promise((resolve, reject) => {
            this.resolveApproveLoan = resolve;
            BlockChain.getInflatedGas(this.compiledObject, ':LoanProgram').then(({inflatedGas, byteCode}) => {
            console.log("NEW CULPRIT 4");
                try {
                    console.log("try block 1");
                    let approvedEtherAmount = BlockChain.getEtherPrice(parseInt(approvedLoanAmount));
                    //console.log("approvedEtherAmount", approvedEtherAmount);
                    loanInfo.approveLoan(approvedEtherAmount, {from: fromAccountAddress, data: byteCode, gas:inflatedGas, value: approvedEtherAmount},
                        (error, contract) => {
                            if(error) {
                                console.log("NEW error", error);
                                reject(error);
                            } else {
                                console.log("Loan approved successfully ");
                                console.log("applicantDetails ", applicantDetails);
                                this.resolveApproveLoanMessage = 'Loan approved successfully!!!';
                                let applicantLists = '';
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
            this.setState({ approved: true, lockOperation: false, updateInfo: { loanApproved: true }, progress: result })

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

        const { loanInfo, estimatedEMI,  estimatedIntrestRate} = this.state;

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
                                    this.resolveAddDisclosureMessage = 'Estimated Interest Rate and Estimated EMI saved successfully!!!';
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

    render() {

        const {
            loanInfo,
            progress,
            updateInfo,
            editIntrestAndEMI,
            onSaveData,
            lockOperation,
            approved,
            creditStatus
        } = this.state,
        operationDisabled = loanInfo === undefined || lockOperation;

        return <div>
            <LoanView updateInfo = { updateInfo }
                onCompilationComplete = { this.onCompilationComplete }
                loanAddress = {this.loanAddress}
                onLoanStatusNotified = { this.onLoanStatusNotified }
                editIntrestAndEMI = { editIntrestAndEMI }
                onSaveData = { onSaveData } />
            <div class="card mb-2 col-md-8 loan-view manage-loan mar-bot-50">
            {progress &&
                <div className="alert alert-success alert-dismissable fade show"
                    role="alert">{ progress }</div>}
                {( editIntrestAndEMI &&
                    <div class="col-md-12">
                        <div class="form-group row mar-top10 col-md-12">
                                <label htmlFor="input-estimatedEMI" class="col-md-4">Monthly payments</label>
                                <span class="col-md-6">
                                    <input type="text" name="estimatedEMI" onChange={this.onDataChange} class="form-control col-md-6 form-control-sm" placeholder="0" />
                                </span>
                        </div>
                        <div class="form-group row col-md-12">
                            <label htmlFor="input-estimatedIntrestRate" class="col-md-4">Interest rate</label>
                            <span class="col-md-6">
                                <input type="text" name="estimatedIntrestRate" onChange={this.onDataChange} class="form-control col-md-6 form-control-sm" placeholder="0" />
                            </span>
                        </div>
                        
                    </div>
                )}
                { approved }
                {( creditStatus && !approved &&
                    <div class="col-md-12">
                        <div class="form-group row mar-top10 col-md-12">
                            <label htmlFor="input-approvedLoanAmount" class="col-md-4"> {approved} Approved loan amount</label>
                            <span class="col-md-6">
                                <input type="text" name="approvedLoanAmount" onChange={this.onDataChange} class="form-control col-md-6 form-control-sm" placeholder="0" />
                            </span>
                        </div>
                    </div>
                )}
                <p class="p-top text-center">
                {!editIntrestAndEMI && <input type = "button" onClick = { this.onEditIntrestAndEMI } className = "btn btn-success col-md-3 btn-style" value = "Edit Interest and EMI" disabled = { operationDisabled } />}
                {editIntrestAndEMI && <input type = "button" onClick = { this.onSaveIntrestAndEMI } className = "btn btn-success col-md-3 btn-style" value = "Save Interest and EMI" disabled = { operationDisabled } />}
                <input type = "button" onClick = { this.onUpdateCredit.bind(this, true) } className = "btn btn-success col-md-2 btn-style" value = "Approve Credit" disabled = { operationDisabled } />
                <input type = "button" onClick = { this.onUpdateCredit.bind(this, false) } className = "btn btn-success col-md-2 btn-style" value = "Decline Credit" disabled = { operationDisabled } />
                <input type = "button" onClick = { this.onApproveLoan } className = "btn btn-success col-md-3 btn-style" value = "Approve Loan" disabled = { operationDisabled || approved || !creditStatus } />
                </p>
            </div>
        </div>
    }
}

export default Manage;
