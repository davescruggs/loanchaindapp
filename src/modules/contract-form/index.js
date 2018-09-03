import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import BlockChain from '../../lib/blockchain';
import Solidity from '../../lib/solidity';
import { web3Connection } from '../../web3';
import loader from '../img/tenor.gif';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css'

class ContractForm extends Component {

    constructor(props) {

        super(props);
        console.log("props", props);
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
            fromAccountAddress: props.fromAccountAddress,
            loanForm: props.loanForm,
            contractDetails: props.contractDetails,
            dob: moment()
        }
        

        this.compileAndDeployCarContract = this.compileAndDeployCarContract.bind(this);
        this.onUpdateContract = this.onUpdateContract.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentWillReceiveProps(props) {
        this.setState({
            moduleTitle: props.moduleTitle,
            contractName: props.contractName,
            processCommandText: props.processCommandText,
            form: props.form,
            associateForm: props.associateForm,
            loanForm: props.loanForm,
            commandDisabled: props.commandDisabled
        });
    }

    componentWillMount() {

        var contractCompilationResult = localStorage.getItem("compilationResult");
        if(!contractCompilationResult){

        Solidity.autoCompileContract(this.state.contractFile).then((compilationResult) => {

            console.log('compilationResult', compilationResult);
            this.setState({ compilationResult });
            localStorage.setItem('compilationResult', JSON.stringify(compilationResult))
            this.onCompilationComplete(compilationResult);

        }).catch((error) => {

            this.setState({
                statusMessage: 'Compilation error ' + JSON.stringify(error),
                compilationResult: undefined,
                isDeployInProgress: false
            });

        });
    } else {
        var compilationResult = JSON.parse(contractCompilationResult);
        console.log('compilationResult Storage', compilationResult);
        this.setState({ compilationResult });
        this.onCompilationComplete(compilationResult);
    }

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
            console.log("Welcome props", this.state.form);
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
            var keyToDelete = "header";
            delete this.state.form.keyToDelete 
            let applicantContractInput = [];
            console.log("Welcome props compilationResult", this.state.form);
            const contractInput = Object.keys(this.state.form).map((item) => {
                    applicantDetails['"'+this.state.form[item].title+'"'] = this.state.form[item].value;
                    console.log("Welcome props compilationResult [item]", this.state.form[item].title );
                    if(this.state.form[item].inputType != 'label' && this.state.form[item].title != 'Last name') {
                        let name = '';
                        if(this.state.form[item].title == 'First name') { 
                            name = this.state.form['firstName'].value +' '+this.state.form['lastName'].value;
                            console.log("name ", name);
                            applicantContractInput.push(name);
                        } else {
                            applicantContractInput.push(this.state.form[item].value);
                        }
                        return this.state.form[item].value;
                    }
            }),
            contractName = this.state.contractName,
            { compilationResult } = this.state;
            let fromAccountAddress = this.state.fromAccountAddress
            this.setState({
                statusMessage: 'Compiling and deploying contract',
                isDeployInProgress: true
            });
            console.log("contractInput contractInput", contractInput);
            console.log("contractInput applicantContractInput", applicantContractInput);
            BlockChain.getGasPriceAndEstimate(compilationResult, contractName).then(({gasPrice, gasEstimate}) => {

                BlockChain.deployContract(applicantContractInput, compilationResult, this.onUpdateContract, gasPrice, gasEstimate, contractName, fromAccountAddress)
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
        console.log('target ', target);
        const { value } = target,
        updateState = { ...this.state.form };
        console.log('updateState ', updateState);
        console.log('onDataChange', field);
        updateState[field].value = updateState[field].validate ? updateState[field].validate(value) : value;
        this.setState( { form: updateState } );

        if(this.props.onDataChange) {
            this.props.onDataChange({ ...this.state });
        }
    }
    
    handleChange(date) {
        this.setState({
            dob: date
          });
      }
    renderForm(form) {
        console.log("formform ", form)
        if( form != undefined)
        return Object.keys(form).map((item) => {
            const { title, value, readOnly, inputType, isError, error, styleclass, styleId, options } = form[item];
            if (Array.isArray(value)) {
                return <div key={item} className={"form-group col-md-4 "+ styleclass}>
                 <label for={"select-" + item}>{title}</label>
                  <select className="form-control form-control-sm" onChange = { this.onDataChange.bind(this, item) } value={this.state.value} name={item} >
                    {
                        value.map((v, i) => {
                            return <option key={i} value={v}>{v}</option>;
                        })
                    }
                   </select> 
                </div>;
            } else if(inputType == 'select') {
                    console.log("Input Log", inputType);
                    return <div key={item} className={"form-group col-md-4 "+ styleclass}>
                        <label for={"select-" + item}>{title}</label>
                            <select className="form-control form-control-sm" onChange = { this.onDataChange.bind(this, item) } value={this.state.value} name={item}>
                            { (options) &&
                                options.map((option) => {
                                    return <option value={option} selected>{option}</option>
                                })
                            }
                            </select>
                    </div>
            } else if(inputType == 'radio') {
                console.log("Input options", options);
                return <div key={item} className={"form-group col-md-4 "+ styleclass}>
                    <label for={"select-" + item}>{title}</label>
                        <div className="">
                        { (options) &&
                            options.map((option) => {
                                return <label className="radio-inline" onChange = { this.onDataChange.bind(this, item) }>
                                        <input type="radio" className="radio" value={option} name="gender" /> {option} 
                                </label>
                            })
                        }
                        </div>
                </div>
            } else if((inputType)=="date"){
                return <div key={item} className="form-group col-md-4">
                 <label for={"input-" + item}>{title}</label>
                    <DatePicker className="form-control form-control-sm"  value= {this.state.dob} 
                    dateFormat="DD-MMM-YYYY" 
                    peekNextMonth
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    selected={this.state.dob}
                    onChange={this.handleChange} onBlur={ this.onDataChange.bind(this, item) }/>
                </div>
            } else if((inputType)=="label") {
                return <div className={"form-group col-md-12 "+ styleclass}>
                            <h6 className="applicant-header">{title}</h6>
                       </div>
            } else if((inputType)=="password") {
                return <div key = {item} className={"form-group col-md-4 "+ styleclass}>
                    <label for={"input-" + item}>{title}</label>
                    <input
                    id={"input-" + item}
                    type="password" className="form-control form-control-sm"
                    placeholder={ value } onChange = { this.onDataChange.bind(this, item) } 
                    readOnly = { readOnly } />
                   {isError && <span>{error}</span>}
                </div>
            } else {
                return <div key = {item} className={"form-group col-md-4 "+ styleclass}>
                    <label for={"input-" + item}>{title}</label>
                    <input
                    id={"input-" + item}
                    type="text" className="form-control form-control-sm"
                    placeholder={ value } onChange = { this.onDataChange.bind(this, item) } 
                    readOnly = { readOnly } />
                   {isError && <span>{error}</span>}
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
            commandDisabled,
            statusMessage,
            loanForm
        } = this.state;

        return (
        <Fragment>
            { (compilationResult && connected) &&
                <Fragment>
                    <div className="row">
                        <div className={(associateForm) ? "col-md-12": "col-md-12"}>
                            <div className="row">
                                { this.renderForm(form) }
                            </div>
                            {loanForm &&
                                <div className="row">
                                    
                                    { this.renderForm(loanForm) }
                                </div>
                            }
                            { (!associateForm) &&  form != undefined &&
                                <input type="button"
                                    className="btn btn-success"
                                    value={processCommandText}
                                    onClick={this.compileAndDeployCarContract}
                                    disabled={isDeployInProgress || commandDisabled} />}
                        </div>
                        
                        {associateForm &&
                        <div className="col-md-12">
                            <div className="row">
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
                <span className="error-msg">{ statusMessage } </span>
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
