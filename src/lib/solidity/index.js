import _ from 'lodash';

export let Solidity = {

    compiler: undefined,

    compiledObjects: {},

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

                    const compilerVersion ="soljson-v0.4.22+commit.4cb486ee.js";

                    window.BrowserSolc.loadVersion(compilerVersion, (compiler) => {

                        console.log('Ready to create compile and deploy  contracts', compilerVersion);

                        resolve(compiler, compilerVersion);

                    });
                });

            } catch (error) {

                reject(error);
            }

        });
    },

    autoCompileContract: function(file, compilerOverride) {

        const compiler = compilerOverride ? compilerOverride : this.compiler;

        if(compiler !== undefined) {

            return this.compileContract(file, compiler);

        } else {

            return this.autoSetupCompiler().then(() => {

                return this.compileContract(file);

            });
        }

    },


    compileContract: function(file, compilerOverride) {

        return new Promise((resolve, reject) => {

            const compiledObject = this.compiledObjects[file];

            if(compiledObject === undefined) {

                return this.readSolFile(file).then((contract) => {

                    const optimize = 1,
                        compiler = compilerOverride ? compilerOverride : this.compiler;

                    let compilationResult = compiler.compile(contract, optimize);

                    if(compilationResult.errors && JSON.stringify(compilationResult.errors).match(/error/i)) {

                        console.log('Error occured in compilation', compilationResult.errors);

                        console.log('Error message', JSON.stringify(compilationResult.errors));

                        reject(compilationResult.errors);

                    } else {

                        console.log('Compilation successful!!!', compilationResult);

                        this.compiledObjects[file] = compilationResult;

                        resolve(compilationResult);
                    }

                }).catch((error) => {

                    reject(error);

                });

            } else {

                resolve(compiledObject);

            }


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
