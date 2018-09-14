
import { web3 } from '../../web3';

export const BlockChain = {

    getGasPriceAndEstimate: function(result, contractName) {

        return new Promise((resolve, reject) => {

            const byteCode = '0x' + result.contracts[contractName].bytecode;
            
            console.log('byteCode', byteCode);

            console.log('contractName', contractName);
            try {
                web3.eth.getGasPrice((err, gasPrice) => {                
                
                    if(err) {
        
                        console.log('deployment web3.eth.getGasPrice error', err);
        
                        reject(err);
        
                    } else {
                        
                        console.log('current gasPrice (gas / ether)', gasPrice);
        
                        web3.eth.estimateGas({data: byteCode}, (err, gasEstimate) => {
        
                            if(err) {
        
                                console.log('deployment web3.eth.estimateGas error', err);
        
                                reject(err);
        
                            } else {
        
                                console.log('deployment web3.eth.estimateGas amount', gasEstimate);
                                
                                resolve({gasPrice, gasEstimate, byteCode});
                            }

                        });
                    }
                }); 
            } catch (error) {
                console.log("error ", error);
            }         

        });
                
    },

    getInflatedGas: function(result, contractName) {
        return this.getGasPriceAndEstimate(result, contractName).then(({gasPrice, gasEstimate, byteCode}) => {
            return {inflatedGas: Math.round(1.2 * gasEstimate), gasPrice, gasEstimate, byteCode};
        });
    },


    deployContract: function(contractInput, result, onUpdateContract, gasPrice, gasEstimate, contractName, fromAccountAddress) {
        

        return new Promise((resolve, reject) => {

            const carContract = result.contracts[contractName],
            abi = JSON.parse(carContract.interface),
            bytecode = '0x' + carContract.bytecode,
            myContract = web3.eth.contract(abi);

            fromAccountAddress = fromAccountAddress ? fromAccountAddress : web3.eth.accounts[0];

            console.log('carContract', carContract);              
            console.log('bytecode', JSON.stringify(bytecode));
            console.log('abi', JSON.stringify(abi));
            console.log('myContract', myContract);
            console.log('fromAccountAddress', fromAccountAddress);
            console.log('default Account', web3.eth.accounts[0]);

                            
            const inflatedGasCost = Math.round(1.2 * gasEstimate),
                ethCost = gasPrice * inflatedGasCost / 10000000000 / 100000000,
                warnings = result.errors ? JSON.stringify(result.errors) + ',' : ''; // show warnings if they exist


            console.log('gasEstimate', gasEstimate);
            console.log('gasPrice', gasPrice);
            console.log(warnings + 'Compiled! (inflated) estimateGas amount: ' + inflatedGasCost + ' (' + ethCost+ ' Ether)');
            console.log('deploye contractInput', ...contractInput);
            myContract.new(...contractInput, {from: fromAccountAddress, data: bytecode, gas: inflatedGasCost},
                //  {from:web3.eth.accounts[0],data:bytecode,gas:inflatedGasCost},
                (err, newContract) => { 

                    console.log('newContract', newContract);

                    if(err) {

                        console.log('deployment err', err);
                        
                        reject(err);

                    } else {
            
                        if(!newContract.address) {

                            console.log('Contract transaction send: TransactionHash waiting for mining', newContract.transactionHash);
                            console.log('Transaction hash', newContract.transactionHash);
                            console.log('Contract Address', 'waiting to be mined for contract address...');

                        } else {

                            console.log('Contract deployed!!!', 'Contract deployed successfully !!! ');
                            console.log('Contract mined! Address', newContract.address);
                            console.log('newContract Mined', newContract);
                        }

                        onUpdateContract(newContract, abi);

                        resolve(newContract);
                    }
                }
            );            

        });

    },
    
    getContract: function(compiledObject, contractName, contractAddress) {        

        console.log("compiledObject ", compiledObject);
        console.log("contractName ", contractName);
        console.log("contractAddress ", contractAddress);
        return new Promise((resolve, reject) => {
            try {
                if(compiledObject) {
                    const contract = compiledObject.contracts[contractName],
                        abi = JSON.parse(contract.interface),
                        myContract = web3.eth.contract(abi),
                        contractFound = myContract.at(contractAddress);
                    console.log("contract details  ", contract);
                    if((contractFound) && (contractFound.address.trim() !== '')) {
                        
                        resolve(contractFound);

                    } else {

                        reject({error: true, errorContractNotFound: true});
                        
                    }
                } else {
                    reject({error: true, errorCompiledObjectNotValid: true});
                }
            } catch(error) {
                reject(error);
            }

        });

    },
    
    fromAccount: function() {
        return web3.eth.accounts[0];
    },

    getUserBalance: function(accountId) {
        try {
            return web3.fromWei(web3.eth.getBalance(accountId), "ether").toNumber();
        } catch (error) {
            console.log( "getUserBalance ", error)
        }
    },

    getEtherPrice: function(amount) {
        return web3.toWei(amount, "ether");
    },

    getEtherFromPrice: function(amount) {
        return web3.fromWei(amount, "ether");
    },

    deployContractFromABI: function(contractInput, result, onUpdateContract, gasPrice, gasEstimate, contractName, fromAccountAddress) {
        
        
        return new Promise((resolve, reject) => {

            const carContract = result.name,
            abi = JSON.parse(result.abi),
            //bytecode = '0x' + carContract.bytecode,
            myContract = web3.eth.contract(abi);
            fromAccountAddress = fromAccountAddress ? fromAccountAddress : web3.eth.accounts[0];
            const myContractInstance = myContract.at(result.contractid);
            const inflatedGasCost = Math.round(1.2 * gasEstimate),
                ethCost = gasPrice * inflatedGasCost / 10000000000 / 100000000;
                //warnings = result.errors ? JSON.stringify(result.errors) + ',' : ''; // show warnings if they exist
            var transactionObject = {
                from: fromAccountAddress,
                gas: 3000000,
                gasPrice: 3000
            };
            console.log('contractInput contractInput', ...contractInput);
            console.log('contractInput myContractInstance', myContractInstance);
            console.log('contractInput transactionObject', transactionObject);
            try {
                myContractInstance.apply(...contractInput, transactionObject, (err, newContract) => { 

                    if(err) {
                        console.log('deployment err', err);
                        reject(err);
                    } else {
                        console.log('newContract success', newContract);
                        if(!newContract.address) {
                            console.log('Contract transaction send: TransactionHash waiting for mining', newContract.transactionHash);
                            console.log('Transaction hash', newContract.transactionHash);
                            console.log('Contract Address', 'waiting to be mined for contract address...');
                        } else {
                            console.log('Contract deployed!!!', 'Contract deployed successfully !!! ');
                            console.log('Contract mined! Address', newContract.address);
                            console.log('newContract Mined', newContract);
                        }
                        onUpdateContract(newContract, abi);
                        resolve(newContract);
                    }
                });
            } catch(error) {
                console.log('error error', error);
            }
            /*console.log('carContract', carContract);              
            console.log('bytecode', JSON.stringify(bytecode));
            console.log('abi', JSON.stringify(abi));
            console.log('myContract', myContract);*/
                            
            /*const inflatedGasCost = Math.round(1.2 * gasEstimate),
                ethCost = gasPrice * inflatedGasCost / 10000000000 / 100000000,
                warnings = result.errors ? JSON.stringify(result.errors) + ',' : ''; // show warnings if they exist


            console.log('gasEstimate', gasEstimate);
            console.log('gasPrice', gasPrice);
            console.log(warnings + 'Compiled! (inflated) estimateGas amount: ' + inflatedGasCost + ' (' + ethCost+ ' Ether)');
            console.log('deploye contractInput', ...contractInput);
            /*myContract.new(...contractInput, {from: fromAccountAddress, data: bytecode, gas: inflatedGasCost},
                //  {from:web3.eth.accounts[0],data:bytecode,gas:inflatedGasCost},
                (err, newContract) => { 

                    console.log('newContract', newContract);

                    if(err) {

                        console.log('deployment err', err);
                        
                        reject(err);

                    } else {
            
                        if(!newContract.address) {

                            console.log('Contract transaction send: TransactionHash waiting for mining', newContract.transactionHash);
                            console.log('Transaction hash', newContract.transactionHash);
                            console.log('Contract Address', 'waiting to be mined for contract address...');

                        } else {

                            console.log('Contract deployed!!!', 'Contract deployed successfully !!! ');
                            console.log('Contract mined! Address', newContract.address);
                            console.log('newContract Mined', newContract);
                        }

                        onUpdateContract(newContract, abi);

                        resolve(newContract);
                    }
                }
            );*/         

        });

    },

    getGasPriceAndEstimateFromABI: function(result, contractName) {

        return new Promise((resolve, reject) => {

            const byteCode = result.abi;
            //web3.eth.contract(result.abi).at(result.contractid);
            
            //console.log('byteCode', byteCode);

            console.log('contractName', contractName);

            web3.eth.getGasPrice((err, gasPrice) => {                
            
                if(err) {
    
                    console.log('deployment web3.eth.getGasPrice error', err);
    
                    reject(err);
    
                } else {
                    
                    console.log('current gasPrice (gas / ether)', gasPrice);
    
                    web3.eth.estimateGas({data: result.abi}, (err, gasEstimate) => {
    
                        if(err) {
    
                            console.log('deployment web3.eth.estimateGas error', err);
    
                            reject(err);
    
                        } else {
    
                            console.log('deployment web3.eth.estimateGas amount', gasEstimate);
                            
                            resolve({gasPrice, gasEstimate, byteCode});
                        }

                    });
                }
            });            

        });
                
    },
}

export default BlockChain;