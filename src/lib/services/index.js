import React, { Component } from 'react';
import { Redirect } from 'react-router';

export const Services = {

    //baseURL: window.location.origin,
    baseURL:  window.location.host.indexOf('localhost') == 0 ? 'http://localhost:7000': '',
    
    getApplicantDetails: async function () {
        
        console.log("applicant baseURL", this.baseURL);
        if (window.location.host.indexOf('localhost') == 0) {
            this.baseURL = 'http://localhost:7000';
        }
        //console.log("applicant Details", this.baseURL);
        /*fetch(this.baseURL+'/applicants').then(
            response => response.json()).then(
            resulstData => this.setState(
                { applicantInfo: resulstData }
        ));*/
        //console.log("Applicant Info", this.state.applicantInfo);
        try {
            let applocantInfo;
            await fetch(this.baseURL+'/applicants').then(
                response => response.json()).then(
                resulstData => {
                    applocantInfo = resulstData;
                });
            console.log("test applocantInfo", applocantInfo);
            return applocantInfo;
        } catch(error) {
            console.log("Weeo", error);
        }
    },

    async getLoanHistory(loanReference) {
        let loanHistories = '';
        console.log("BASE URL", this.baseURL);
        await fetch(this.baseURL+'/loanhistory/'+ loanReference).then(
            response => response.json() ).then(
            resulstData =>   loanHistories = resulstData
        ).catch((err) => {
            console.log("error", err);
        });
        return loanHistories;
    }
}
export default Services;