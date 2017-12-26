#!/usr/bin/env nodejs

'use strict';

//nodejs dependencies
const fs = require('fs');
const process = require('process');

//external dependencies
const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const mustache = require('mustache');
const cookieParser = require('cookie-parser');

//local dependencies
const options = require('./options').options;
const users = require('./users/users');

const assert = require('assert');

const STATIC_DIR = 'statics';
const TEMPLATES_DIR = 'templates';

const USER_COOKIE = 'usercookie';



/*************************** Route Handling ****************************/
function setupRoutes(app) {
    app.use('/', bodyParser.json());
    app.use(cookieParser());
    app.use('/hello', function(req, res) { res.json({ hello: 'world' }); });
    app.get('/', redirecttopage(app));
    app.use(bodyParser.urlencoded({extended: true}));
    app.get('/login.html', loginpage(app));
    app.post('/login.html', loginpage(app));
    app.get('/myaccount.html', myaccount(app));
    app.get('/register.html', registeraccount(app));
    app.get('/logout.html', logoutuser(app));
    app.post('/register.html', registeraccount(app));
}


function logoutuser(app){
    return function(req,res){
        res.clearCookie(USER_COOKIE);
        res.redirect('/login.html');
            
    }        
}

function loginpage(app){
    return function(req,res){
        var isDisplay = (typeof req.query.submit ==='undefined')
        if(isDisplay){
            res.send(doMustache(app,'login',{}));
        }
        else {
            var email = req.query.email;
            var pw = req.query.password;
            if(typeof email!=='undefined'&& typeof pw!=='undefined'&& email.trim().length!==0&&pw.trim().length!==0){
                    app.users.loginuser(email,pw).then((json)=>{
                        console.log(json);
                            if(json.status==='ERROR_NOT_FOUND'){
                                const errors = { qError: 'User not found'};
                                const formvalues = {email:email};
                                const dataonerror = {errors,formvalues};
                                res.send(doMustache(app, 'login', dataonerror));
                            }
                            else if(json.status==='ERROR_UNAUTHORIZED'){
                                    const errors = { qError: 'Passwords is incorrect'};
                                    const formvalues = {email:email};
                                    const dataonerror = {errors,formvalues};
                                    res.send(doMustache(app, 'login', dataonerror));
                            }
                            else{
                            res.cookie(USER_COOKIE,{token:json.authToken,id:email}, { maxAge: 86400*1000 });
                            res.redirect('/myaccount.html');
                            }
                    });
                    
            }
            else{
                   const errors = { qError: 'Fields cannot have only whitespaces'};
                   const formvalues = {email:email};
                   const dataonerror = {errors,formvalues};
                   res.send(doMustache(app, 'login', dataonerror)); 
            }
            
        }
    }        
}

function redirecttopage(app){
    return function(req,res){
        const isDisplay = (typeof req.query.submit ==='undefined')
        if(isDisplay){
            const usertokenfromcookie = req.cookies[USER_COOKIE];
            const hastoken = (typeof usertokenfromcookie !== 'undefined')
            if(hastoken){
                 console.log("Goto Account Page");
                 res.redirect('/myaccount.html');
            }
            else{
            console.log("Goto Login Page");
            res.redirect('/login.html');
            }
        }
        else {
                
        }
    }        
}

function myaccount(app){
    return function(req,res){
        const isDisplay = (typeof req.query.submit ==='undefined')
        if(isDisplay){
            const usertokenfromcookie = req.cookies[USER_COOKIE];
            const hastoken = (typeof usertokenfromcookie !== 'undefined')
            if(hastoken){
                app.users.getUser(usertokenfromcookie).then((json)=>{
                    const data = json.data;
                    res.send(doMustache(app,'myaccount',data));
                    });
                
            }
            else{
                console.log('cookie not present Account page');
                res.redirect('/login.html');
            }

        }
        else {
                
        }
    }        
}

function registeraccount(app){
    return function(req,res){
        const isDisplay = (typeof req.body.submit ==='undefined')
        if(isDisplay){
            console.log('Came here');
            res.send(doMustache(app,'register',{}));
        }
        else {
            
            var body = req.body;
            var firstname = req.body.firstname;
            var lastname = req.body.lastname;
            var email = req.body.email;
            var pw = req.body.password;
            var pwvalidation = req.body.passwordconfirmation;
            if(pw!==pwvalidation){
                console.log("Passwords dont match");
                const errors = { qError: 'Passwords fields do not match'};
                const formvalues = {fname:firstname,lname:lastname,email:email};
                const dataonerror = {errors,formvalues};
                res.send(doMustache(app, 'register', dataonerror));
                
            }
            else{
                if(firstname.trim().length!==0&&lastname.trim().length!==0&&email.trim().length!==0&&pw.trim().length!==0&&pwvalidation.trim().length!==0){
                    app.users.register(body).then((output)=>{
                        if(output.status==='EXISTS'){
                                console.log('User Exists');
                                const errors = { qError: 'User email already exists'};
                                const formvalues = {fname:firstname,lname:lastname,email:email};
                                const dataonerror = {errors,formvalues};
                                res.send(doMustache(app, 'register', dataonerror));
                        }
        
                        
                        else{
                            res.cookie(USER_COOKIE,{token:output.data.authToken,id:email}, { maxAge: 86400*1000 });
                            res.redirect('/myaccount.html');
                        }

                        
                        }).catch((errors)=>{
                            console.log("Logging errors here");
                            console.log(errors);
                        });
                
                }
                else{
                    const errors = { qError: 'Fields cannot have only whitespaces'};
                   const formvalues = {fname:firstname,lname:lastname,email:email};
                   const dataonerror = {errors,formvalues};
                   res.send(doMustache(app, 'register', dataonerror)); 
                }
                
            }
            
        }    
    }
}


/************************ Utility functions ****************************/


function doMustache(app, templateId, view) {
  const templates = {};
  return mustache.render(app.templates[templateId], view, templates);
}

function errorPage(app, errors, res) {
  if (!Array.isArray(errors)) errors = [ errors ];
  const html = doMustache(app, 'errors', { errors: errors });
  res.send(html);
}
  
/*************************** Initialization ****************************/

function setupTemplates(app) {
  app.templates = {};
  for (let fname of fs.readdirSync(TEMPLATES_DIR)) {
    const m = fname.match(/^([\w\-]+)\.ms$/);
    if (!m) continue;
    try {
      app.templates[m[1]] =
	String(fs.readFileSync(`${TEMPLATES_DIR}/${fname}`));
    }
    catch (e) {
      console.error(`cannot read ${fname}: ${e}`);
      process.exit(1);
    }
  }
}

function setup() {
  process.chdir(__dirname);
  const port = options.port;
  const app = express();
  app.use(cookieParser());
  app.locals.ws_url = options.ws_url;
  setupTemplates(app);
  app.users = users;
  app.use(express.static(STATIC_DIR));
  app.use(bodyParser.urlencoded({extended: true}));
  setupRoutes(app);
  https.createServer({
    key: fs.readFileSync(`${options.sslDir}/key.pem`),
    cert: fs.readFileSync(`${options.sslDir}/cert.pem`),
  }, app).listen(port, function() {
    console.log(app.locals.ws_url);
    console.log(`listening on port ${port}`);
  });
}

setup();
