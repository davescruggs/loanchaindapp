import React, { Component, Fragment } from 'react';
import queryString from 'query-string';
import BlockChain from '../../lib/blockchain';
import currencyImage from '../../modules/img/currency.png';
import { Services } from '../../lib/services';
import moment  from 'moment';

class ViewTransaction extends Component {

    constructor(props) {
        super(props);
        let params = queryString.parse(this.props.location.search);
        this.transactionId = params.transaction;
        this.loggedUserInfo = JSON.parse(localStorage.getItem("accountInfo"));
        if(this.loggedUserInfo) {
            this.accountId = this.loggedUserInfo.accountId;
        }
        this.state = {
            fromAccountAddress: this.accountId,
            transactions: ''
        }
    }

    async componentDidMount(){

        const transactionInfo = BlockChain.getTransactionInfo(this.transactionId);
        this.setState({ transactions : transactionInfo })
    }

    render() {
        const { transactions } = this.state;
        console.log("transactions ", transactions);
        const totalBlocks = BlockChain.getTotalBlocks();
        const confirmations = totalBlocks - transactions.number;
        return (<div>
                    <div className="menu-bar-contracthistory col-md-12">
                        <div className="row">
                            <div className="col-md-9">
                                <div className="">
                                        <span className="text-white"> Transaction </span>
                                </div>
                                <div className="col-md-6 pull-right">&nbsp;</div>
                            </div>
                            <div className="col-md-3 pull-right hide">  
                               
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12 row">
                    <div className="col-md-2">&nbsp;</div>
                    <div className="col-md-8 card">
                    <div>
                        <div className="page-header">Transaction Infomartion</div>
                        <div className="col-md-12">
                                <label className="col-md-3 loan-label">TxHash: </label>
                                <span className="col-md-5 loan-content-text">{transactions.transaction}</span>
                        </div>
                        <div className="col-md-12">
                                <label className="col-md-3 loan-label">TxReceipt Status: </label>
                                <span className="col-md-5 loan-content-text text-green">Success</span>
                        </div>
                        <div className="col-md-12">
                                <label className="col-md-3 loan-label">Block Height: </label>
                                <span className="col-md-5 loan-content-text">{transactions.number} {"("+confirmations+ " Confirmations)"}</span>
                        </div>
                        <div className="col-md-12">
                                <label className="col-md-3 loan-label">TimeStamp: </label>
                                <span className="col-md-5 loan-content-text">{moment.unix(transactions.timestamp).fromNow()} ({moment.unix(transactions.timestamp).toString()})</span>
                        </div>
                        <div className="col-md-12">
                                <label className="col-md-3 loan-label">From: </label>
                                <span className="col-md-5 loan-content-text">{transactions.from}</span>
                        </div>
                        <div className="col-md-12">
                                <label className="col-md-3 loan-label">To: </label>
                                <span className="col-md-5 loan-content-text">{transactions.to}</span>
                        </div>
                        <div className="col-md-12">
                                <label className="col-md-3 loan-label">Value: </label>
                                <span className="col-md-5 loan-content-text">{parseInt(transactions.value)} ETHER</span>
                        </div>
                        <div className="col-md-12">
                                <label className="col-md-3 loan-label">Gas Limit: </label>
                                <span className="col-md-5 loan-content-text">{transactions.gasLimit}</span>
                        </div>
                        <div className="col-md-12">
                                <label className="col-md-3 loan-label">Gas Used: </label>
                                <span className="col-md-5 loan-content-text">{parseInt(transactions.gasUsed)}</span>
                        </div>
                        <div className="col-md-12">
                                <label className="col-md-3 loan-label">Gas Price: </label>
                                <span className="col-md-5 loan-content-text">{BlockChain.getEtherFromPrice(parseInt(transactions.gasPrice))}</span>
                        </div>
                        <div className="col-md-12">
                                <label className="col-md-3 loan-label">Gas Used: </label>
                                <span className="col-md-5 loan-content-text">{parseInt(transactions.gasUsed)}</span>
                        </div>
                        <div className="col-md-12">
                                <label className="col-md-3 loan-label">Nonce: </label>
                                <span className="col-md-5 loan-content-text">{transactions.nonce}</span>
                        </div>
                        <div className="col-md-12">
                                <label className="col-md-3 loan-label">Size: </label>
                                <span className="col-md-5 loan-content-text">{transactions.size}</span>
                        </div>
                        <div className="col-md-12">
                                <label className="col-md-3 loan-label">Miner: </label>
                                <span className="col-md-5 loan-content-text">{transactions.miner}</span>
                        </div>
                        <div className="col-md-12">
                                <label className="col-md-3 loan-label">Input Data: </label>
                                <span className="col-md-5 loan-content-text">{transactions.input}</span>
                        </div>
                    </div>
                    </div>
                    </div>
                </div>
        );
    }
}

export default ViewTransaction;