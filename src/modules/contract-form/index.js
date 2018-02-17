import React, { Component } from 'react';
import BlockChain from '../../lib/blockchain';
import Solidity from '../../lib/solidity';
import { web3Connection } from '../../web3';
import loader from '../img/tenor.gif';

class ContractForm extends Component {

    constructor(props) {

        super(props);

        this.state = {
            compilationResult: undefined,
            statusMessage: undefined,
            thisTxHash: undefined,
            contractABI: undefined,
            thisAddress: undefined,
            connected: undefined,
            isDeployInProgress: undefined,
            contractFile : props.contractFile,
            moduleTitle: props.moduleTitle,
            contractName: props.contractName,
            processCommandText: props.processCommandText,
            form: props.form,
            associateForm: props.associateForm
        }

        this.compileAndDeployCarContract = this.compileAndDeployCarContract.bind(this);
        this.onUpdateContract = this.onUpdateContract.bind(this);

    }

    componentWillReceiveProps(props) {
        this.setState({
            moduleTitle: props.moduleTitle,
            contractName: props.contractName,
            processCommandText: props.processCommandText,
            form: props.form,
            associateForm: props.associateForm
        });
    }

    componentWillMount() {

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

            this.setState({
                statusMessage: 'Compiling and deploying car contract',
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

            const contractInput = Object.keys(this.state.form).map((item) => {
                return this.state.form[item].value;
            }),
            contractName = this.state.contractName,
            { compilationResult } = this.state;

            this.setState({
                statusMessage: 'Compiling and deploying car contract',
                isDeployInProgress: true
            });

            
            BlockChain.getGasPriceAndEstimate(compilationResult, contractName).then(({gasPrice, gasEstimate}) => {

                BlockChain.deployContract(contractInput, compilationResult, this.onUpdateContract, gasPrice, gasEstimate, contractName)
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

    onDataChange(field, { target }) {
        const { value } = target,   
            updateState = { ...this.state.form };

        console.log('onDataChange', field);
        updateState[field].value = updateState[field].validate ? updateState[field].validate(value) : value;

        this.setState( { form: updateState } );
    }

    renderForm(form) {
        return Object.keys(form).map((item) => {
            const { title, value, readOnly } = form[item];
            return <div key = {item} >
                <label>{title}</label>
                <input type = "text"  className = "form-control" value = { value } onChange = { this.onDataChange.bind(this, item) } readOnly = { readOnly } /> <br />
            </div>
        });
    }
    
    render() {
        
        const { 
            moduleTitle,
            processCommandText,
            compilationResult,            
            connected,
            isDeployInProgress,
            statusMessage,
            form,
            associateForm
        } = this.state;

        return (
        <div>
            {(compilationResult && connected) && <div>

                <div className = "container">
                    <div className = "row">
                        <h3>{ moduleTitle }</h3> <br />
                        
                        <div className = "col-sm-6">
                            <div className = "form-group">
                                
                                { this.renderForm(form) }

                                <input type = "button" className = "btn btn-primary" value = { processCommandText } onClick = { this.compileAndDeployCarContract } disabled = {isDeployInProgress} />

                            </div>
                        </div>

                        {associateForm && <div className = "col-sm-6">
                            { this.renderForm(associateForm) }
                        </div>}

                        {(!associateForm) && <div className = "col-sm-6">
                            { statusMessage }
                            {isDeployInProgress && <img src = {loader} alt = "" />}
                        </div>}
                    </div>
                </div>                



            </div>}

            {(!(compilationResult && connected)) && <p align = "center">
                <img src = {loader} alt = "" />
            </p>}

        </div>
        );
    }
}

export default ContractForm;
