import React, { Component, Fragment } from 'react';
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
        <Fragment>
            <a href={'/manageloan?loan=' + this.loanAddress} class="btn btn-success">Show Loan Admin View</a>
            <LoanStatus loanAddress = {this.loanAddress} />
        </Fragment>);
    }
}

export default UserLoanStatus;
