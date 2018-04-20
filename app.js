const PORT = process.env.PORT || 7000,
    express = require('express');
    path = require('path')
    app = express();


app.locals.blockchainurl = process.env.BLOCKCHAIN_SERVICE_URL;
app.locals.loanprogram = process.env.LOANPROGRAM_CONTRACT_ID;

app.use(express.static(path.join(__dirname, 'build')))

app.get('/urltouse', function(req, res) {
   console.log("urltouse RETURNING::"+req.app.locals.blockchainurl);
    res.send(req.app.locals.blockchainurl);
});

app.get('/loanProgramToUse', function(req, res) {
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
console.log("Started on port"+PORT)
app.listen(PORT)
