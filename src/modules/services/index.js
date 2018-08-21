import React, { Component } from 'react';
import { Redirect } from 'react-router';

class Services extends Component {

    constructor(props) {
        super(props);

        this.state = {
            applicantInfo: undefined
        }
        this.baseURL = '';
        if (window.location.host.indexOf('localhost') == 0) {
            this.baseURL = 'http://localhost:7000';
        }
    }
    
    getApplicantDetails: function () {
        
        console.log("applicant Details");
        await fetch(this.baseURL+'/applicants').then(
            response => response.json()).then(
            resulstData => this.setState(
                { applicantInfo: resulstData }
        ));
        console.log("Applicant Info", this.state.applicantInfo);
    }
}

export default Services;
