import Web3 from 'web3';
import Config from './config.js';
import axios from 'axios';



export let blockChainConfiguredLocation = undefined;
const serverValue = axios.get('/urltouse').then((result) => {
      blockChainConfiguredLocation = result.data;
      console.log('blockChainConfiguredLocation', blockChainConfiguredLocation);
    });

export let loanprogramContract = undefined;
const loanValue = axios.get('/loanProgramToUse').then((result) => {
      loanprogramContract = result.data;
      console.log('loanprogramContract', loanprogramContract);
    });



export const web3 = new Web3(new Web3.providers.HttpProvider(blockChainConfiguredLocation));

export const web3Manager = Web3;

export const web3Connection = {

    retry: () => {
        web3.setProvider(new Web3.providers.HttpProvider(blockChainConfiguredLocation));
        //console.log('Web3 Connection Retry', web3);
    },

    watch: (notifier, checkInterval) => {

        return new Promise((resolve) => {

            let connected = web3.isConnected();

            notifier(connected);

            setInterval(() => {

                if(!web3.isConnected()) {

                    connected = false;

                    notifier(connected);

                    resolve(connected);

                    web3Connection.retry();

                } else if(!connected) {

                    connected = true;

                    notifier(connected);

                    resolve(connected);
                }

            }, checkInterval ? checkInterval : 3000);

        });
    }

}
