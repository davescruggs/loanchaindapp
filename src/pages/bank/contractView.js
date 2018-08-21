import React, { Component, Fragment } from 'react';
import { Redirect } from 'react-router';
import ContractForm from '../../modules/contract-form';
import userList from '../../modules/resource/applicantlist.json';

class ContractView extends Component{
    constructor(props) {
        super(props);

        
    }
    
render() {
    const props = { 
        moduleTitle: 'Applicant List'
    }
  
    return (
        <div class="card mb-2">
            <div class="card-header" id="header-create" data-toggle="collapse" data-target="#body-create" aria-expanded="false" aria-controls="body-create">
                <p class="mb-0 py-2 font-weight-light">
                    <i class="icon-folder-create"></i> {props.moduleTitle}
                </p>
            </div>
        <div class="form-group">
        <table id="t01">
        <tr>
    <th>Loan Program</th> 
    <th>Contract Id</th> 
  </tr>
 
  {
      userList.map(function(userList){
          return <tr><td>{userList.data['loantype']}</td>
           <td>{userList.key}</td>
            </tr>
      })
 }  
     </table>
      </div>
      </div>
    );

   }
}

export default ContractView;