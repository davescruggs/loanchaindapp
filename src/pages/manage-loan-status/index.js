import React, { Component } from 'react';
import LoanStatus from '../../modules/loan-status';
import BlockChain from '../../lib/blockchain';


class ManageLoanStatus extends Component {

    constructor(props) {
        super(props);

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
            creditStatus: undefined
        }

        //TODO find the right way to find the key from search
        this.loanAddress = props.location.search.replace('?loan=','');

        this.onCompilationComplete = this.onCompilationComplete.bind(this);
        this.onLoanStatusNotified = this.onLoanStatusNotified.bind(this);
        this.onApproveLoan = this.onApproveLoan.bind(this);
        this.onEditIntrestAndEMI = this.onEditIntrestAndEMI.bind(this);
        this.onSaveIntrestAndEMI = this.onSaveIntrestAndEMI.bind(this);

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

        const { loanInfo } = this.state;

        this.setState({ lockOperation: true, progress: 'Processing loan approval' })

        return new Promise((resolve, reject) => {
            this.resolveApproveLoan = resolve;
            console.log("Loan approved resolveApproveLoan ", this.resolveApproveLoan);
            console.log("Loan approved reject ", reject);
console.log("NEW CULPRIT 3");
            BlockChain.getInflatedGas(this.compiledObject, ':LoanProgram').then(({inflatedGas, byteCode}) => {
    console.log("NEW CULPRIT 4");
    console.log("inflatedGas ", inflatedGas);
    console.log("byteCode ", byteCode);
    console.log("BlockChain.fromAccount() ", BlockChain.fromAccount());
    console.log("BlockChain Loan Info ", loanInfo);
                try {
                    console.log("try block 1");
                    loanInfo.approveLoan({from: BlockChain.fromAccount(), data: byteCode, gas:inflatedGas},
                        (error, contract) => {
                            if(error) {
                                console.log("NEW error", error);
                                reject(error);
                            } else {
                                console.log("Loan approved successfully ");
                                this.resolveApproveLoanMessage = 'Loan approved successfully!!!';
                            }
                        }
                    );
                } catch(error) {
                    console.log("error  BlockChain Loan Approve Info ", error);
                }
                setTimeout(resolve, 50000);

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

    onSaveIntrestAndEMI() {

        const { loanInfo } = this.state;

        this.setState({ lockOperation: true, progress: 'Processing emi and interest rate' })

        this.setState({
            onSaveData: ((state) => {
                const { estimatedEMI, estimatedIntrestRate } = state;

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

                    this.setState({ lockOperation: false, editIntrestAndEMI: false, progress: result })

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
            <LoanStatus updateInfo = { updateInfo }
                onCompilationComplete = { this.onCompilationComplete }
                loanAddress = {this.loanAddress}
                onLoanStatusNotified = { this.onLoanStatusNotified }
                editIntrestAndEMI = { editIntrestAndEMI }
                onSaveData = { onSaveData } />
            {progress &&
                <div className="alert alert-success alert-dismissable fade show"
                    role="alert">{ progress }</div>}
            <p className="d-flex">
                {!editIntrestAndEMI && <input type = "button" onClick = { this.onEditIntrestAndEMI } className = "btn btn-success mr-2" value = "Edit Interest and EMI" disabled = { operationDisabled } />}
                {editIntrestAndEMI && <input type = "button" onClick = { this.onSaveIntrestAndEMI } className = "btn btn-success mr-2" value = "Save Interest and EMI" disabled = { operationDisabled } />}
                <input type = "button" onClick = { this.onUpdateCredit.bind(this, true) } className = "btn btn-success mr-2" value = "Approve Credit" disabled = { operationDisabled } />
                <input type = "button" onClick = { this.onUpdateCredit.bind(this, false) } className = "btn btn-success mr-2" value = "Decline Credit" disabled = { operationDisabled } />
                <input type = "button" onClick = { this.onApproveLoan } className = "btn btn-success ml-auto" value = "Approve Loan" disabled = { operationDisabled || approved || !creditStatus } />
            </p>
        </div>
    }
}

export default ManageLoanStatus;
