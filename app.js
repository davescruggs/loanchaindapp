//import { IndexRoute } from "./src/routes/index";
var index = require("./src/routes/index");
var bodyParser = require("body-parser");
var request = require("request");

const PORT = process.env.PORT || 7000,
    express = require('express');
    path = require('path')
    app = express();
    app.use(bodyParser.json());
    //mount query string parser
    app.use(bodyParser.urlencoded({
        extended: true
    }));

app.locals.blockchainurl = process.env.BLOCKCHAIN_SERVICE_URL;
app.locals.loanprogram = process.env.LOANPROGRAM_CONTRACT_ID;
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
app.use(express.static(path.join(__dirname, 'build')))
var baseURL = '';

app.get('/urltouse', function(req, res) {
    console.log("urltouse RETURNING::"+req.app.locals.blockchainurl);
    res.send(req.app.locals.blockchainurl);
});

app.get(baseURL+'/loanProgramToUse', function(req, res) {
    console.log("loanProgramToUse RETURNING::"+req.app.locals.loanprogram);
    res.send(req.app.locals.loanprogram);
});

app.get('/manageLoan', function(req, res){
    var uid = req.params.uid,
        path = req.params[0] ? req.params[0] : 'index.html';
    res.sendfile(path, {root: './build'});
});

app.get('/loanstatus', function(req, res){
    var uid = req.params.uid,
        path = req.params[0] ? req.params[0] : 'index.html';
    res.sendfile(path, {root: './build'});
});

app.get('/loanstatus', function(req, res){
    var uid = req.params.uid,
        path = req.params[0] ? req.params[0] : 'index.html';
    res.sendfile(path, {root: './build'});
});

app.get('/loans', function(req, res){
    var uid = req.params.uid,
        path = req.params[0] ? req.params[0] : 'index.html';
    res.sendFile(path, {root: './build'});
});
app.get('/newapplicant', function(req, res){
    var uid = req.params.uid,
        path = req.params[0] ? req.params[0] : 'index.html';
    res.sendFile(path, {root: './build'});
});
app.get('/loanview', function(req, res){
    var uid = req.params.uid,
        path = req.params[0] ? req.params[0] : 'index.html';
    res.sendFile(path, {root: './build'});
});
app.get('/login', function(req, res){
    var uid = req.params.uid,
        path = req.params[0] ? req.params[0] : 'index.html';
    res.sendFile(path, {root: './build'});
});
app.get('/brokerlist', function(req, res){
    var uid = req.params.uid,
        path = req.params[0] ? req.params[0] : 'index.html';
    res.sendFile(path, {root: './build'});
});
app.get('/brokerview', function(req, res){
    var uid = req.params.uid,
        path = req.params[0] ? req.params[0] : 'index.html';
    res.sendFile(path, {root: './build'});
});
app.get('/contractlist', function(req, res){
    var uid = req.params.uid,
        path = req.params[0] ? req.params[0] : 'index.html';
    res.sendFile(path, {root: './build'});
});
app.get('/contractcreate', function(req, res){
    var uid = req.params.uid,
        path = req.params[0] ? req.params[0] : 'index.html';
    res.sendFile(path, {root: './build'});
});
app.get('/approveloan', function(req, res){
    var uid = req.params.uid,
        path = req.params[0] ? req.params[0] : 'index.html';
    res.sendFile(path, {root: './build'});
});
app.get('/banklist', function(req, res){
    var uid = req.params.uid,
        path = req.params[0] ? req.params[0] : 'index.html';
    res.sendFile(path, {root: './build'});
});
app.get('/contractexplore', function(req, res){
    var uid = req.params.uid,
        path = req.params[0] ? req.params[0] : 'index.html';
    res.sendFile(path, {root: './build'});
});
app.get('/transactions', function(req, res){
    var uid = req.params.uid,
        path = req.params[0] ? req.params[0] : 'index.html';
    res.sendFile(path, {root: './build'});
});
app.get('/viewtransaction', function(req, res){
    var uid = req.params.uid,
        path = req.params[0] ? req.params[0] : 'index.html';
    res.sendFile(path, {root: './build'});
});
app.post('/update/events', async function(req, res){

    var requestData = req.body;
    var organization = req.query.org;
    
    console.log("requestData For Saleforce updation ", requestData);
    console.log("organization ", organization);
    var salesforeceAccessToken = process.env['SALESFORCE_'+organization+'_ACCESS_TOKEN'];
    //var salesforceCredentials = process.env['SALESFORCE_'+organization+'_CREDENTIALS'];
    var salesforeceURL = process.env['SALESFORCE_'+organization+'_URL'];
    var sfCredentials = Buffer.from(salesforeceAccessToken, 'base64').toString('ascii');
    var credentials = sfCredentials.split(":");
    var accessToken = await getAccessToken(salesforeceURL, credentials[0], credentials[1], credentials[2], credentials[3], requestData);
    console.log("requestData For salesforeceURL ", salesforeceURL);
    console.log("requestData For credentials ", credentials);
    res.status(200);
    res.send('Event published');
});

async function getAccessToken(url, clientId, clientSecret, username, password, requestData) {

    var salesforceCredentialsURL = url+'/services/oauth2/token?grant_type=password&client_id='+clientId+'&client_secret='+clientSecret+'&username='+username+'&password='+password;
    console.log("salesforceCredentialsURL", salesforceCredentialsURL);
    await request.post({
            "headers": 
            { 
                "content-type": "application/json" ,
            },
            "url": salesforceCredentialsURL
        }, (error, response) => {
            if(error)  {
               console.log('Error: '+error);
            } else {
                const accessToken = JSON.parse(response.body);
                console.log("getAccessToken : "+ accessToken.access_token);
                updatePlatFormEvents(url, accessToken.access_token, requestData)
            }
    });
}

async function updatePlatFormEvents(salesforeceURL, accessToken, requestData) {
    console.log("requestData For salesforeceURL ", salesforeceURL);
    console.log("requestData For requestData ", requestData);
    console.log("requestData For salesforeceAccessToken ", accessToken);
    await request.post(
        {
            "headers": 
            { 
                "content-type": "application/json" ,
                "Authorization": "Bearer "+accessToken
            },
            "url": salesforeceURL+"/services/data/v43.0/sobjects/loanEvent__e/",
            "body": JSON.stringify(requestData)
        }, (error, response, body) =>  {
            if(error) 
            {
               console.log('Error: '+error);
            }
            else
            {
                console.log("Interest Event Published: "+body);
            }
        });
}

console.log("Started on port"+PORT)
var router = express.Router();
index.IndexRoute.create(router);
app.use(router);
app.listen(PORT)
