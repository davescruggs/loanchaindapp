import React, { Component, Fragment } from 'react';
import { Redirect } from 'react-router';
import ContractForm from '../../modules/contract-form';
import userList from '../../modules/resource/applicantlist.json';
import { Solidity } from '../../lib/solidity';
import { web3Connection } from '../../web3';
import { BlockChain } from '../../lib/blockchain';
import ContractFile from '../../modules/resource/loanchain.sol';

class ContractCreate extends Component{
    constructor(props) {
        super(props);
        this.state = {
            form: props.form,
            existingContracts: '',
            contractFile: undefined,
            compilationResult: undefined
          };
        this.onSubmitContract = this.onSubmitContract.bind(this);
        this.contractDeployment = this.contractDeployment.bind(this);
        this.autoCompileContract = this.autoCompileContract.bind(this);
        this.baseURL = '';
        if (window.location.host.indexOf('localhost') == 0) {
            this.baseURL = 'http://localhost:7000';
        }
    }

    onSubmitContract(event) {
        
        const contractData = new FormData(event.target);
        this.setState(
            { existingContracts: "se" }
        )
        const { existingContracts } = this.state;
        console.log("contract" , contractData.get("contract-name"));
        const newContractInfo = [{ 
                name: contractData.get("contract-name"),
                contractid: contractData.get("contract-id"),
                abi: contractData.get("contract-abi"),
        }]
        let finalObj;
        console.log("existingContracts TYPE", existingContracts);
        if(existingContracts != '') {
            finalObj = existingContracts.concat(newContractInfo);
        } else {
            finalObj = newContractInfo;
        }
        console.log("existingContracts TYPE", finalObj);
        this.createContractInfo(newContractInfo);
        //window.location.assign('/contracts');
        event.preventDefault();
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

    contractDeployment () {
        const ContractFile = document.getElementById("contract-detail").value;
        //console.log(ContractFile);
        this.setState( { contractFile: ContractFile });
        this.autoCompileContract();
    }

    autoCompileContract() {

        console.log('autoCompileContract');
        Solidity.autoCompileContract(this.state.contractFile).then((compilationResult) => {

            console.log('compilationResult', compilationResult);

            this.setState({ compilationResult });

            this.onCompilationComplete(compilationResult);

        }).catch((error) => {

            this.setState({
                statusMessage: 'Compilation error ' + JSON.stringify(error),
                compilationResult: undefined,
                isDeployInProgress: false
            });

        });

        web3Connection.watch((connected) => {
            this.setState({ connected });
        }).catch();

    }

    onCompilationComplete(compiledObject) {
        return new Promise(() => {
            const { onCompilationComplete } = this.props;

            if(onCompilationComplete) {
                onCompilationComplete(compiledObject, { ...this.state })
            }

        }).catch((error) => {
            console.log('Error getting compiled object', error)
        });
    }

    onUpdateContract(newContract, abi) {

        if(!newContract.address) {
            this.setState({
                statusMessage: 'Contract transaction send and waiting for mining...',
                thisTxHash: newContract.transactionHash,
                isDeployInProgress: true,
                contractABI: abi,
                thisAddress: 'waiting to be mined for contract address...'
            });

        } else {
            this.setState({
                statusMessage: 'Contract deployed successfully !!! ',
                thisTxHash: newContract.transactionHash,
                isDeployInProgress: false,
                contractABI: abi,
                thisAddress: newContract.address
            });

            this.onContractCreated(newContract);
        }

    }

    onContractCreated(contract) {
        return new Promise(() => {
            const { onContractCreated } = this.props;

            if(onContractCreated) {
                onContractCreated(contract, { ...this.state })
            }

        }).catch((error) => {
            console.log('Contract created object error', error)
        });
    }

    compileAndDeployCarContract() {

        if(this.props.onSubmit) {
            if(this.props.contractName == 'Create Applicant') {
                console.log("Welcome");
                console.log("Welcome props",this.props);
            }
            this.setState({
                statusMessage: 'Compiling and deploying contract',
                isDeployInProgress: true
            });

            this.props.onSubmit(this.state.form).then((response) => {

                if(!response.redirect) {
                    this.setState({
                        statusMessage: response,
                        isDeployInProgress: false
                    });
                }

            }).catch((error) => {
                this.setState({
                    statusMessage: error,
                    isDeployInProgress: false
                });
            })

        } else {
            const applicantDetails = {};
            const contractInput = Object.keys(this.state.form).map((item) => {
                applicantDetails['"'+this.state.form[item].title+'"'] = this.state.form[item].value;
                return this.state.form[item].value;
            }),
            contractName = this.state.contractName,
            { compilationResult } = this.state;
            let fromAccountAddress = this.state.fromAccountAddress
            console.log("Welcome props compilationResult", this.state);
            this.setState({
                statusMessage: 'Compiling and deploying contract',
                isDeployInProgress: true
            });
            BlockChain.getGasPriceAndEstimate(compilationResult, contractName).then(({gasPrice, gasEstimate}) => {

                BlockChain.deployContract(contractInput, compilationResult, this.onUpdateContract, gasPrice, gasEstimate, contractName, fromAccountAddress)
                .catch((error) => {
                    this.setState({
                        statusMessage: 'deployment error: ' + error,
                        isDeployInProgress: false
                    });
                });

            }).catch((error) => {
                this.setState({
                    statusMessage: 'deployment web3.eth.getGasPrice error: ' + error,
                    isDeployInProgress: false
                });
            });
        }

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
            moduleTitle: 'Create Contract'
        }
      
        return (
            <div class="card mb-2 col-md-10 list-left">
                <div> 
                    <h5 class=" mb-0 py-2 font-weight-light">{props.moduleTitle}
                    </h5>
                </div>
                <div id="body-create" class="" aria-labelledby="header-create">
                    <form onSubmit={this.onSubmitContract}>
                        <div class="card-body">
                                <div class="col-md-12">
                                    <div class="row">
                                        <div class="form-group col-md-6">
                                                <label for="input-name">Loan Program Name</label>
                                                <input type="text" id="contract-name" class="form-control form-control-sm" name="contract-name" placeholder="Contract Name" />
                                        </div>
                                    </div>
                                    <div class="row hide">
                                        <div class="form-group col-md-12">
                                                <label for="input-name">Contract ABI</label>
                                                <textarea name="contract-abi" id="contract-abi" rows="15" class="form-control form-control-sm"></textarea>
                                        </div>
                                    </div>
                                    <input type="submit" class="btn btn-success" value="Create" />
                                </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default ContractCreate;