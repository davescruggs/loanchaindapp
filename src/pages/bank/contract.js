import React, { Component, Fragment } from 'react';
import { Redirect } from 'react-router';
import ContractForm from '../../modules/contract-form';
import userList from '../../modules/resource/applicantlist.json';

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
        <div class="card mb-2 col-md-10 list-left">
        <div class="form-group">
            <div> 
                <h5 class=" mb-0 py-2 font-weight-light">{props.moduleTitle}
                    <span class="pull-right">
                        <a href="/contractcreate" class="btn btn-xs btn-primary" ><i class="fa fa-plus"></i> Create </a>
                    </span>
                </h5>
            </div>
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Loan Program Name</th>
                        <th>Loan Program Id</th>
                    </tr>
                </thead>
                    { contractDetails.length > 0 ?
                    <tbody>
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
                    <tr>
                        <td colspan="3" class="text-center">No Records..</td>
                    </tr>
                    }
        </table>
      </div>
      </div>
    );

   }
}

export default Contract;