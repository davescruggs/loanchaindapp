import React, { Component } from 'react';
import AMNewContract from '../resource/am-new-contract.sol';
import BlockChain from '../../lib/blockchain';
import Solidity from '../../lib/solidity';
import { web3, web3Connection } from '../../web3';
import loader from '../img/tenor.gif';

class NewApplicant extends Component {

    constructor(props) {

        super(props);

        this.state = {
            readyToCompileAndCreateContract: false,
            amNewContract: undefined,
            statusMessage: 'Connecting to block chain plese wait...',
            thisTxHash: undefined,
            contractABI: undefined,
            thisAddress: undefined,
            connected: undefined,
            isDeployInProgress: undefined,
            showABI: false,
            make: 'Honda',
            model: 'CRV',
            year: '2010',
            price: '7500',
            vin: 'some vin number'
        }

        this.compileAndDeployCarContract = this.compileAndDeployCarContract.bind(this);
        this.toogleABI = this.toogleABI.bind(this);
        this.onUpdateContract = this.onUpdateContract.bind(this);

    }

    componentWillMount() {

        Solidity.readSolFile(AMNewContract).then((responseText) => {
            this.setState({ amNewContract: responseText });
        });

        Solidity.autoSetupCompiler().then((compiler) => {
            this.compiler = compiler;
            this.setState({ readyToCompileAndCreateContract : true });
        });

        web3Connection.watch((connected) => {
            this.setState({ connected });            
        }).catch()

    }

    onUpdateContract(newContract, abi) {
        
        if(!newContract.address) {
            this.setState({
                statusMessage: 'Contract transaction send and waiting for mining...',
                thisTxHash: newContract.transactionHash,
                isDeployInProgress: false,
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
        }
    }

    compileAndDeployCarContract() {

        const { make, model, year, price, vin } = this.state,
            contractInput = [make, model, year, price, vin, web3.eth.accounts[0]];

        this.setState({
            statusMessage: 'Compiling and deploying car contract',
            isDeployInProgress: true
        });

        Solidity.compileContract(this.state.amNewContract).then((compilationResult) => {
            
            console.log('compilationResult', compilationResult);
            
            BlockChain.getGasPriceAndEstimate(compilationResult).then(({gasPrice, gasEstimate}) => {

                BlockChain.deployContract(contractInput, compilationResult, this.onUpdateContract, gasPrice, gasEstimate, ':Car')
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

        }).catch((error) => {
            alert(error.toString());
            this.setState({
                statusMessage: 'Compilation error ' + JSON.stringify(error),
                isDeployInProgress: false
            });
        })
    }


    amNewConctract() {
        return this.state.amNewContract;
    }

    compiledAMNewContract() {
        return this.state.compiledAMNewContract;
    }

    toogleABI() {
        this.setState({
            showABI : !this.state.showABI
        })
    }

    onCarDataChange(field, { target }) {
        const { value } = target,   
            { make, model, year, price, vin } = { ...this.state },
            updateState = {make, model, year, price, vin};

        updateState[field] = value;

        updateState.year = (parseInt(updateState.year, 10) || 0).toString();
        updateState.price = parseInt(updateState.price, 10) || 0;

        this.setState(updateState);       
    }
    
    render() {

        const { 
            readyToCompileAndCreateContract,
            statusMessage,
            thisAddress,
            contractABI,
            showABI,
            isDeployInProgress,
            make, model, year, price, vin
        } = this.state;

        return (
        <div>
            {(readyToCompileAndCreateContract && web3.isConnected()) && <div>

                <div className = "container">
                    <div className = "row">
                        <h3>Deploy smart contract</h3> <br />
                        <div className = "col-sm-6">
                            <div className = "form-group">

                                <label>Make</label>
                                <input type = "text"  className = "form-control" value = { make } onChange = { this.onCarDataChange.bind(this, 'make') } /> <br />
                                
                                <label>Model</label>
                                <input type = "text" className = "form-control"  value = { model } onChange = { this.onCarDataChange.bind(this, 'model') } /> <br />

                                <label>Year</label>
                                <input type = "text"  className = "form-control" value = { year } onChange = { this.onCarDataChange.bind(this, 'year') } /> <br />

                                <label>Price</label>
                                <input type = "text" className = "form-control" value = { price } onChange = { this.onCarDataChange.bind(this, 'price') } /> <br />

                                <label>VIN</label>
                                <input type = "text" className = "form-control" value = { vin } onChange = { this.onCarDataChange.bind(this, 'vin') } /> <br />

                                <input type = "button" className = "btn btn-primary" value = "Deploy Contract" onClick = { this.compileAndDeployCarContract } />
                            </div>
                        </div>
                        <div className = "col-sm-6">

                            {isDeployInProgress && <img src = {loader} alt = "" />}

                            {isDeployInProgress === false && <div>
                                <span className = "label-pill label-success">
                                    <h3>
                                        {statusMessage && statusMessage}
                                    </h3>
                                </span>

                                <span className = "badge badge-danger" data-toggle = "collapse" data-target = "#showabi">
                                    <h4>
                                        {thisAddress && thisAddress}
                                    </h4>
                                </span><br /><br />

                                {contractABI && <button type = "button" className = "btn btn-primary" onClick = {this.toogleABI}>{showABI && "Hide ABI"}{!showABI && "Show ABI"}</button>}
                                
                                <br /><br />

                                {showABI && <textarea className = "form-control" rows = "9">
                                    {JSON.stringify(contractABI, 4)}
                                </textarea>}

                            </div>}


                        </div>
                    </div>
                </div>                



            </div>}

            {(!(readyToCompileAndCreateContract && web3.isConnected())) && <p align = "center">
                    <img src = {loader} alt = "" />
            </p>}

        </div>
        );
    }
}

export default NewApplicant;
