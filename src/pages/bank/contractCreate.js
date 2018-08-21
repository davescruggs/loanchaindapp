import React, { Component, Fragment } from 'react';
import { Redirect } from 'react-router';
import ContractForm from '../../modules/contract-form';
import ContractFile from '../../modules/resource/loanchain.sol';


class ContractCreate extends Component {

    constructor(props) {
        super(props);

        this.loggedUserInfo = JSON.parse(localStorage.getItem("accountInfo"));
        if(this.loggedUserInfo) {
            this.accountId = this.loggedUserInfo.accountId;
            this.accountname = this.loggedUserInfo.accountname;
        }
        this.state = {
            redirectToLoanDetails: undefined,
            existingContracts: '',
            accountId: this.accountId,
            accountName: this.accountname,
        }

        this.onNewLoanProgramCreated = this.onNewLoanProgramCreated.bind(this);
        this.baseURL = '';
        if (window.location.host.indexOf('localhost') == 0) {
            this.baseURL = 'http://localhost:7000';
        }
    }

    async componentDidMount() {
        await fetch(this.baseURL+'/contracts/').then(
            response => response.json() ).then(
            resulstData => this.setState(
                { existingContracts: resulstData }
        )).catch((err) => {
            console.log("error", err);
       });
    }

    onNewLoanProgramCreated(loanContract, componentState) {
        const { existingContracts } = this.state;
        const newContractInfo = [{ 
            name: componentState.form.loanProgramName.value,
            contractid: loanContract.address,
        }]
        let finalObj;
        if(existingContracts != '') {
            finalObj = existingContracts.concat(newContractInfo);
        } else {
            finalObj = newContractInfo;
        }
        this.createContractInfo(newContractInfo);
        console.log('newContractInfo ', newContractInfo);
        console.log('loanContract ', loanContract);
        console.log('componentState ', componentState.form.loanProgramName.value);
        this.setState({ redirectToLoanDetails: '/contractlist' });
    }

    createContractInfo(contractInfo) {
        console.log("contractInfo", contractInfo);
        (async () => {
            const rawResponse = await fetch(this.baseURL+'/contract/create', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(contractInfo)
            });
            const content = await rawResponse.json();
            console.log("rawResponse", content);
          })();
    }

    render() {
        const props = {
            contractFile : ContractFile,
            moduleTitle: 'Create Loan Program',
            contractName: ':LoanProgram',
            processCommandText: 'Create',
            fromAccountAddress: this.state.accountId,
            form: {
                loanProgramName: {title: 'Loan Program Name', name:'name', value: '', styleclass: 'col-md-12'},
            }
        },
        { redirectToLoanDetails } = this.state;
        return (
        <div class="card mb-2 col-md-10 list-left">
            <div class="form-group">
                <div> 
                    <h5 class=" mb-0 py-2 font-weight-light">{props.moduleTitle}</h5>
                </div>
                <div id="body-create" class="" aria-labelledby="header-create">
                    <div class="card-body">
                        <ContractForm
                            { ...props }
                            onContractCreated = { this.onNewLoanProgramCreated } />
                            { redirectToLoanDetails && window.location.assign(redirectToLoanDetails) }
                    </div>
                </div>
            </div>
        </div>
        );
    }
}

export default ContractCreate;
