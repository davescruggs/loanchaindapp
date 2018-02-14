import _ from 'lodash';

export let Solidity = {

    compiler: undefined,

    autoSetupCompiler: function(wait) {
        
        return new Promise((resolve, reject) => {

            setTimeout(() => {
                
                return this.getCompiler().then((compiler, compilerVersion) => {
                    
                    this.compiler = compiler;

                    console.log('Compiler setup successful!!!', compilerVersion);

                    resolve(compiler);

                }).catch((error) => {

                    console.log('Compiler setup failed', error);

                    reject(error);

                })

            }, wait ? wait : 1000);   

        });
    },

    getCompiler: function() {

        return new Promise((resolve, reject) => {

            try {

                console.log('BrowserSolc Our log', window.BrowserSolc);
                
                window.BrowserSolc.getVersions((soljsonSources, soljsonReleases) => {
    
                    const compilerVersion = soljsonReleases[_.keys(soljsonReleases)[0]];
    
                    console.log('Browser-solc compiler version',compilerVersion);
    
                    window.BrowserSolc.loadVersion(compilerVersion, (compiler) => {                    
    
                        console.log('Ready to create compile and deploy car contracts', compilerVersion);
    
                        resolve(compiler, compilerVersion);
    
                    });
                });                

            } catch (error) {

                reject(error);
            }            

        });       
    },
    

    compileContract: function(contract, compilerOverride) {
        
        return new Promise((resolve, reject) => {

            const optimize = 1,
                compiler = compilerOverride ? compilerOverride : this.compiler;
    
            let compilationResult = compiler.compile(contract, optimize);

            if(compilationResult.errors && JSON.stringify(compilationResult.errors).match(/error/i)) {
                
                console.log('Error occured in compilation', compilationResult.errors);

                console.log('Error message', JSON.stringify(compilationResult.errors));

                reject(compilationResult.errors);
            } 

            console.log('Compilation successful!!!', compilationResult);

            resolve(compilationResult);

        });

    },

    readSolFile: function(file) {

        return new Promise((resolve, reject) => {

            try {

                const rawFile = new XMLHttpRequest();
                
                rawFile.open('GET', file, false);

                rawFile.onreadystatechange = () => {

                    if((rawFile.readyState === 4) && ((rawFile.status === 200 || rawFile.status === 0))) {

                        resolve(rawFile.responseText);

                    }
                }
            
                rawFile.send(null);                            

            } catch(error) {

                reject(error);

            }

        });

    }
}

export default Solidity;