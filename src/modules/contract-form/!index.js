import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import BlockChain from '../../lib/blockchain';
import Solidity from '../../lib/solidity';
import { web3Connection } from '../../web3';
import loader from '../img/tenor.gif';
import 'react-datepicker/dist/react-datepicker.css';

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
            associateForm: props.associateForm,
            commandDisabled: props.commandDisabled,
            errmsg:"",
            startDate: moment()
        }

        this.compileAndDeployCarContract = this.compileAndDeployCarContract.bind(this);
        this.onUpdateContract = this.onUpdateContract.bind(this);
        this.onDataChange = this.onDataChange.bind(this);
        this.handleChange = this.handleChange.bind(this);


    }

    componentWillReceiveProps(props) {
        this.setState({
            moduleTitle: props.moduleTitle,
            contractName: props.contractName,
            processCommandText: props.processCommandText,
            form: props.form,
            associateForm: props.associateForm,
            commandDisabled: props.commandDisabled
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

    handleChange(date) {
        this.setState({
          startDate: date
        });
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

            const contractInput = Object.keys(this.state.form).map((item) => {
                return this.state.form[item].value;
            }),
            contractName = this.state.contractName,
            { compilationResult } = this.state;

            this.setState({
                statusMessage: 'Compiling and deploying contract',
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

        const updateState = { ...this.state.form },
        { value } = target;
        
        //updateState[field].isError = updateState[field].validate(value);

        /*console.log('onDataChange', field);
        updateState[field].value = updateState[field].validate ? updateState[field].validate(value) : value;*/

        this.setState( { form: updateState } );

        if(this.props.onDataChange) {
            this.props.onDataChange({ ...this.state });
        }
    //}
    }

    // renderForm(form) {
    //     const { associateForm } = this.state;
    //     return Object.keys(form).map((sections, index) => {
    //         let section = form[sections];
    //         return (
    //             <Fragment>
    //                 {isNaN(Number(sections)) &&
    //                     <h6>{sections}</h6>}
    //                 <div key={section}
    //                     className={(!associateForm) ?
    //                         "form-row mb-3": "mb-3 border-bottom border-light"}>
    //                     {
    //                         Object.keys(section).map((item) => {
    //                             const { title, value, readOnly, className } = section[item];
    //                             return <div key={item}
    //                                     className={(!associateForm) ?
    //                                     ("form-group " + className): "form-group row align-items-center"}>
    //                                 <label for={"input-" + item}
    //                                     className={associateForm ? "col-sm-3 text-right": ""}>{title}</label>
    //                                 <div className={associateForm ? "col-sm-9": ""}>
    //                                     <input id={"input-" + item}
    //                                         type="text"
    //                                         class="form-control form-control-sm"
    //                                         placeholder={ value }
    //                                         onChange = { this.onDataChange.bind(this, item) }
    //                                         readOnly = { readOnly } />
    //                                 </div>
    //                             </div>
    //                         })
    //                     }
    //                 </div>
    //             </Fragment>
    //         );
    //     });
    // }
    renderForm(form) {
        console.log("formform ", form)
        if( form != undefined)
        return Object.keys(form).map((item) => {
            const { title, value, readOnly, inputType, isError, error, styleclass } = form[item];
            if (Array.isArray(value)) {
                return <div key={item} className={"form-group col-md-4 "+ styleclass}>
                 <label for={"select-" + item}>{title}</label>
                  <select class="form-control form-control-sm">
                    {
                        value.map((v, i) => {
                            return <option key={i} value={v}>{v}</option>;
                        })
                    }
                   </select> 
                </div>;
            }
            else if((inputType)=="date"){
                return <div key={item} className="form-group col-md-4">
                 <label for={"input-" + item}>{title}</label>
               <DatePicker className="form-control form-control-sm"
               dateFormat="DD-MMM-YYYY"
               scrollableYearDropdown
        selected={this.state.startDate}
        onChange={this.handleChange}
    />
                </div>
            }
            else {
                return <div key = {item} className={"form-group col-md-4 "+ styleclass}>
                    <label for={"input-" + item}>{title}</label>
                    <input
                    id={"input-" + item}
                    type="text" class="form-control form-control-sm"
                    placeholder={ value } onChange = { this.onDataChange.bind(this, item) } 
                    readOnly = { readOnly } />
                   {isError && <span>{error}</span>}
                    
                        {/* {!value && <span>{this.state.error}</span>} */}
                    
                </div>
            }
        });
    }

    render() {
        const {
            moduleTitle,
            processCommandText,
            compilationResult,
            connected,
            isDeployInProgress,
            form,
            associateForm,
            commandDisabled
        } = this.state;
        console.log("moduleTitle", moduleTitle)
        return (
        <Fragment>
            { (compilationResult && connected) &&
                <Fragment>
                    <div class="row">
                        <div className={(associateForm) ? "col-md-6": "col-md-12"}>
                            <div class="row">
                                { this.renderForm(form) }
                            </div>
                            { (!associateForm && moduleTitle != 'Aplicant Info') && 
                                <input type="button"
                                    className="btn btn-success"
                                    value={processCommandText}
                                    onClick={this.compileAndDeployCarContract}
                                    disabled={isDeployInProgress || commandDisabled} />}
                        </div>
                        {associateForm &&
                        <div className="col-md-6">
                            <div class="row">
                            { this.renderForm(associateForm) }
                        </div>
                        </div>}
                    </div>
                    {(!associateForm) &&
                        <Fragment>
                            { isDeployInProgress &&
                                <div className="loader">
                                    <img src = {loader} alt = ""/>
                                </div>
                            }
                        </Fragment>
                    }
                </Fragment>
            }

            {(!(compilationResult && connected)) &&
                <div className="loader">
                    <img src = {loader} alt = ""/>
                </div>
            }
        </Fragment>
        );
    }
}

export default ContractForm;
