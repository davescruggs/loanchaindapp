import React, { Component, Fragment } from 'react';
import { Redirect } from 'react-router';
import ContractForm from '../../modules/contract-form';
import userList from '../../modules/resource/applicantlist.json';
import BlockChain from '../../lib/blockchain';
import currencyImage from '../../modules/img/currency.png';

class Contract extends Component{
    constructor(props) {
        super(props);
        this.state = {
            contractDetails: '',
        };
        this.baseURL = '';
        if (window.location.host.indexOf('localhost') == 0) {
            this.baseURL = 'http://localhost:7000';
        }
        this.loggedUserInfo = JSON.parse(localStorage.getItem("accountInfo"));
        if(this.loggedUserInfo) {
            this.accountId = this.loggedUserInfo.accountId;
        }
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
    
render() {
    const props = { 
        moduleTitle: 'Contracts List'
    },
    { contractDetails } = this.state
    console.log("contractDetails", contractDetails);
    //let contractInfo = JSON.parse(contractDetails);
    return (
        <div>
            <div className="menu-bar col-md-12">
                <div className="row">
                        <div className="col-md-9">
                            <div className="">
                                    <span className="text-white"> Loan Programs </span>
                            </div>
                            <div className="col-md-6 pull-right"> &nbsp;</div>
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
            <div className="mb-2 col-md-10 list-left">
                    <div> 
                            <span className="pull-right">
                                <a href="/contractcreate" className="btn btn-xs btn-primary" ><i className="fa fa-plus"></i> CREATE </a>
                            </span>
                    </div>
                    <table className="table">
                        <thead className="thead-light">
                            <tr>
                                <th>Loan Program Name</th>
                                <th>Loan Program Id</th>
                            </tr>
                        </thead>
                        { contractDetails.length > 0 ?
                        <tbody className="tbody-light">
                            { 
                                contractDetails.map(contractDetail => {
                                return (
                                <tr> 
                                    <td>{contractDetail.name}</td>
                                    <td>{contractDetail.contractid}</td>
                                </tr>
                                )
                                })
                            }
                        </tbody> :
                        <tbody className="tbody-light">
                            <tr>
                                <td colspan="3" class="text-center">No Records..</td>
                            </tr>
                        </tbody>
                        }
                    </table>
            </div>
        </div>
    );

   }
}

export default Contract;