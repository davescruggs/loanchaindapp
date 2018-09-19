import React, { Component, Fragment } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import queryString from 'query-string';
import BlockChain from '../../lib/blockchain';
import currencyImage from '../../modules/img/currency.png';
import { Services } from '../../lib/services';
import moment  from 'moment';
import ContractForm from '../../modules/contract-form';

class ApplicantLoanHistory extends Component {

    constructor(props) {
        super(props);
        let params = queryString.parse(this.props.location.search);
        this.applicantAddress = params.applicant;
        this.loanAddress = params.loan;
        this.applicantName = params.applicantName;
        this.loggedUserInfo = JSON.parse(localStorage.getItem("accountInfo"));
        if(this.loggedUserInfo) {
            this.accountId = this.loggedUserInfo.accountId;
        }
        this.state = {
            fromAccountAddress: this.accountId,
            loanHistories: [],
            tranactionHistories: []
        }
    }

    async componentDidMount(){
        await Services.getLoanHistory(this.loanAddress).then(
            response => this.getLoanTransactionDetails(response[this.loanAddress] ))
        .catch((err) => {
            console.log("error", err);
        });
    }

    async getLoanTransactionDetails(histories) {
        
        //const { histories } = this.state;
        var tranactionHistory = [];
        console.log("Histories histories ", histories);
        if(histories != undefined) {
                const createdTransaction = await BlockChain.getTransactionInfo(histories.createdHash, "Loan created");
                tranactionHistory.push(createdTransaction);
                
                const appliedTransaction = BlockChain.getTransactionInfo(histories.appliedHash, "Applied loan program");
                tranactionHistory.push(appliedTransaction);
                
                for(let i=0; i<histories.creditStatusTrans.length;i++) {
                    const creditTransaction = BlockChain.getTransactionInfo(histories.creditStatusTrans[i], "Updated credit status");
                    tranactionHistory.push(creditTransaction);
                }

                for(let j=0; j<histories.monthlyPayTrans.length;j++) {
                    const monthlyPayTransaction = BlockChain.getTransactionInfo(histories.monthlyPayTrans[j], "Updated monthly payments");
                    tranactionHistory.push(monthlyPayTransaction);
                }
                const approvedTransaction = BlockChain.getTransactionInfo(histories.approveLoanTrans, "Loan approved");
                tranactionHistory.push(approvedTransaction);
                var index = tranactionHistory.indexOf("");
                if(index > -1) {
                    tranactionHistory.splice(index, 1);
                }
        }
        this.setState({ tranactionHistories : tranactionHistory })
    }

    render() {
        const { tranactionHistories } = this.state;
        console.log("tranactionHistories ", tranactionHistories);
        return (<div>
                    <div className="menu-bar-contracthistory col-md-12">
                        <div className="row">
                            <div className="col-md-9">
                                <div className="">
                                        <span className="text-white"> Transaction History {this.applicantName} </span>
                                </div>
                                <div className="col-md-6 pull-right">&nbsp;</div>
                            </div>
                            <div className="col-md-3 pull-right hide">  
                                
                            </div>
                        </div>
                    </div>
                    <div className="mb-2 col-md-12">
                            <table className="table">
                                <thead className="thead-light">
                                    <tr>
                                        <th>TxHash</th>
                                        <th>Created On</th> 
                                        <th>From</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                    { tranactionHistories.length > 0 ?
                                    <tbody className="tbody-light">
                                        { 
                                            tranactionHistories.map(tranactionHistory => {
                                            return (
                                            <tr> 
                                                <td>
                                                    <Link to={'/viewtransaction?transaction=' + tranactionHistory.transaction}>{tranactionHistory.transaction}</Link>
                                                </td>
                                                <td>{moment.unix(tranactionHistory.timestamp).fromNow()} ({moment.unix(tranactionHistory.timestamp).toString()})</td>
                                                <td>{tranactionHistory.from}</td>
                                                <td>{tranactionHistory.type}</td>
                                            </tr>
                                            )
                                        })
                                        }
                                    </tbody> :
                                    <tbody className="tbody-light">
                                        <tr>
                                            <td colSpan="10" className="text-center">No Transactions..</td>
                                        </tr>
                                    </tbody>
                                    }
                            </table>
                        </div>
                </div>
        );
    }
}

export default ApplicantLoanHistory;