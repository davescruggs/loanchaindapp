import React, { Component } from 'react';
import LoanStatus from '../../modules/loan-status';
import { Link } from 'react-router-dom';

class UserLoanStatus extends Component {

    constructor(props) {
        super(props);

        //TODO find the right way to find the key from search
        this.loanAddress = props.location.search.replace('?loan=','');
    }


    render() {
        return (
        <div>
          <a href={'/manageloan?loan=' + this.loanAddress} class="btn btn-primary">Manage Loan</a>
          <LoanStatus loanAddress = {this.loanAddress} />
        </div>);
    }
}

export default UserLoanStatus;
