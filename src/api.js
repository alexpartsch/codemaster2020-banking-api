const {BankingService} = require('./banking');
const bs = new BankingService();

const express = require('express');
const bodyParser = require('body-parser');

const Joi = require('joi');
const { valid } = require('joi');
const validator = require('express-joi-validation').createValidator({});

const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

// Schemas 
const openAccountSchema = Joi.object({
    name: Joi.string().alphanum().min(2).max(64).required(),
    balance: Joi.number().min(0).max(1000000).default(0),
    overdraftFacility: Joi.number().max(0).default(0)
});
const depositSchema = Joi.object({
    amount: Joi.number().min(0).required()
});

app.post('/accounts', validator.body(openAccountSchema), (req, res) => {
    const {name, balance, overdraftFacility} = req.body;
    const newAccount = bs.openAccount(name, balance, overdraftFacility);
    res.status(201);
    res.send(newAccount);
    res.end();
});

app.delete('/accounts/:accountId/balance', validator.body(depositSchema), (req, res) => {
    const {accountId} = req.params;
    const {amount} = req.body;
    if(bs.withdraw(accountId, amount)) {
        res.status(202);
        res.end();
    } else {
        res.status(400);
        res.send("Cannot withdraw over limit!");
        res.end();
    }
});

app.put('/accounts/:accountId/balance', validator.body(depositSchema), (req, res) => {
    const {accountId} = req.params;
    const {amount} = req.body;
    if(bs.deposit(accountId, amount)) {
        res.status(202);
        res.end();
    } else {
        res.status(400);
        res.send("Cannot withdraw over limit!");
        res.end();
    }
});

app.get('/accounts', (req, res) => {
    res.status(200);
    res.send(bs.listAccounts());
    res.end();
});

app.get('/accounts/:accountId', (req, res) => {
    try {
        const account = bs.getAccount(req.params.accountId);
        res.status(200);
        res.send(account);
        res.end();
    } catch(e) {
        res.status(404);
        res.end();
    }
});

app.get('/accounts/:accountId/deposits', (req, res) => {
    res.status(200);
    res.send(bs.listDeposits(req.params.accountId));
    res.end();
});

app.listen(3333);
console.log('Server listening on port 3333');