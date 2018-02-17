import React, { Component } from 'react';
import LoanStatus from '../../modules/loan-status';


class UserLoanStatus extends Component {

    constructor(props) {
        super(props);

        //TODO find the right way to find the key from search    
        this.loanAddress = props.location.search.replace('?loan=','');
    }


    render() {
        
        return <LoanStatus loanAddress = {this.loanAddress} />
    }
}

export default UserLoanStatus;