var fs = require("fs");
var request = require("request");
var localStorage = require('localStorage');
var url = require('url');
/**
 * / route
 *
 * @class User
 */
var keyMap={};
var keyMapContract=[];
var IndexRoute = (function () {
    function IndexRoute() {
    }
    /**
     * Create the routes.
     *
     * @class Ind-exRoute
     * @method create
     * @static
     */
    IndexRoute.create = function (router) {
        
        router.post("/create", async function (req, res, next) {
            var map={};
            console.log("POST CALL Test");
            var body = '';
            var requestData = '';
            try {
                    requestData = req.body;//JSON.parse(body);
                    var userName = Object.keys(requestData);
                    console.log("userName", userName);
                    keyMap[userName]= requestData;
                    res.status(200);
                    res.json(keyMap[userName]);
            }  catch (err) {
                console.log("Console Error ", err);
                res.status(500);
                res.json(err);
            }
        });

        router.get("/applicants", function (req, res, next) {
            console.log("applicants");
            res.status(200).json(keyMap);
        });
        
        router.get("/applicants/:username/", function (req, res, next) {
            var requestParams = req.params;
            var username = requestParams.username;
            console.log("applicant", username);
            res.status(200).json(keyMap[username]);
        });

        router.post("/contract/create", async function (req, res, next) {
            console.log("POST CALL Contract");
            var body = '';
            var requestData = '';
            try {
                    requestData = req.body;
                    finalObject = keyMapContract.concat(requestData);
                    keyMapContract = finalObject;
                    res.status(200);
                    res.json(keyMapContract);
            }  catch (err) {
                console.log("Console contract error ", err);
                res.status(500);
                res.json(err);
            }
        });
        
        router.get("/contracts", function (req, res, next) {
            res.status(200).json(keyMapContract);
        });

        router.get("/accounts", function (req, res, next) {
            var blockchainurl = url.parse(process.env.BLOCKCHAIN_SERVICE_URL);
            console.log("blockchainurl", blockchainurl);
            var blockchainHost = blockchainurl ? blockchainurl.hostname: 'localhost:5000';
            request.get({
                "headers": { "content-type": "application/json" },
                "url": "https://g5zr7zqn17.execute-api.us-east-1.amazonaws.com/dev/datastore/" + blockchainHost
            }, function (error, response, body) {
                if (error) {
                    res.send(error);
                }
                res.send(body);
            });
        });

        router.post("/auth/user", async function (req, res, next) {
            var blockchainurl = process.env.BLOCKCHAIN_SERVICE_URL ? url.parse(process.env.BLOCKCHAIN_SERVICE_URL): '';
            //var blockchainHost = blockchainurl.hostname;
            console.log("blockchainurl", blockchainurl);
            var blockchainHost = (blockchainurl.hostname != null) ? blockchainurl.protocol+'//'+blockchainurl.hostname: 'http://localhost:5000';
            var requestData = '';
            //blockchainHost = 'http://localhost:5000';
            var accountDetails = '';
            try {
                    try {
                        requestData = req.body;
                      } catch (e) {
                        console.log("Error, not a valid JSON string");
                      }
                    await request.get({
                    "headers": { "content-type": "application/json" },
                    "url": blockchainHost+'/accounts'
                    }, async function (error, response, resulstData) {
                    if (error) {
                        console.log("localStorage requestData error", error);
                        res.send(error);
                    }
                    accountDetails = JSON.parse(resulstData);
                    console.log("localStorage requestData", accountDetails);
                    var authUser = '';
                    var userStatus = '';
                    await accountDetails.filter(accountDetail => {
                        console.log("localStorage accountDetail", accountDetail);
                        if (requestData.username == accountDetail.accountName && requestData.password == accountDetail.password) {
                            console.log("localStorage accountDetail", accountDetail);
                            localStorage.setItem('isLoggedIn', true);
                            localStorage.setItem("userInfo", accountDetail);
                            authUser = accountDetail;
                            userStatus = accountDetail.status;
                        }
                    });
                    if( authUser != '' && userStatus == 'active') {
                        res.status(200);
                        res.send(authUser);
                        console.log("localStorage authUser", requestData);
                    } else if (authUser != '' && userStatus == 'inactive') {
                        res.status(401);
                        console.log("localStorage 401", requestData);
                        res.send({ errorMessage: 'User account has inactive!!' });
                    } else {
                        res.status(401);
                        console.log("localStorage 401", requestData);
                        res.send({ errorMessage: 'Username or Password is not invalid' });
                    }
                });
            //})
            }  catch (err) {
                console.log("Console Error ", err);
                res.status(500);
                res.json(err);
            }
        });

    };
    return IndexRoute;
})();
exports.IndexRoute = IndexRoute;
