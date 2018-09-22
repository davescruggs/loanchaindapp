import Web3 from 'web3';
import Config from './config.js';
import axios from 'axios';



export let blockChainConfiguredLocation = undefined;
this.baseURL = '';
if (window.location.host.indexOf('localhost') == 0) {
    this.baseURL = 'http://localhost:7000';
}
const serverValue = axios.get(this.baseURL+'/urltouse').then((result) => {
    blockChainConfiguredLocation = result.data;
    console.log('blockChainConfiguredLocation', blockChainConfiguredLocation);
});

export let loanprogramContract = undefined;
const loanValue = axios.get(this.baseURL+'/loanProgramToUse').then((result) => {
    loanprogramContract = result.data;
    console.log('loanprogramContract', loanprogramContract);
});

console.log('blockChainConfiguredLocation After', blockChainConfiguredLocation);
export const web3 = new Web3(new Web3.providers.HttpProvider(blockChainConfiguredLocation));
export const web3Manager = Web3;

export const web3Connection = {

    retry: () => {
        web3.setProvider(new Web3.providers.HttpProvider(blockChainConfiguredLocation));
        console.log('Retrying  hard', web3);
    },

    watch: (notifier, checkInterval,connected) => {

        return new Promise((resolve) => {
            let connected = false;
            notifier(connected);
            setInterval(() => {
               console.log("AM I CONNECTED ", connected);

                if(!connected){
                  if (!web3.isConnected()) {
                      notifier(connected);
                      resolve(connected);
                      web3Connection.retry();
                  } else {
                      connected = true;
                      console.log("RESET CONNECTED ", connected);
                      notifier(connected);
                      resolve(connected);
                  }
                }
            }, checkInterval ? checkInterval : 1000);
        });
    }

}

function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }
