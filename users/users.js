const express = require('express');
const bodyParser = require('body-parser');
const options = require('.././options').options;
const assert = require('assert');
const https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const axios = require('axios');



function Users() {
  this.baseUrl = options.ws_url;
}


Users.prototype.hello =function(){
        console.log('Successful');
        //return axios.get;
    
}


Users.prototype.register =function(body){
        const dataofbody = {firstname:body.firstname,lastname:body.lastname};
        return axios.put(`${this.baseUrl}/users/${body.email}?pw=${body.password}`,dataofbody,{ maxRedirects: 0})
        .then((response) => {
          const location = response.headers.location;
          const statusofresponse = response.status;
            return response;
        }).catch((err)=>{
                //console.log(err);
                if(err.response.status===303){
                    console.log(303);
                    return err.response.data;
//                    var data = {status:err.response.status}
//                    return data;
                }
                
                //console.log(err.response.status);
        });
    
}


Users.prototype.getUser = function(token) {
    return axios.get(`${this.baseUrl}/users/${token.id}`,{ maxRedirects: 0,headers: {Authorization: `Bearer ${token.token}`}})
        .then((response) => {
          const statusofresponse = response.status;
            console.log(statusofresponse);
            return response;
        });
  
}

Users.prototype.loginuser =function(email,pass){
        const dataofbody = {pw:pass};
        return axios.put(`${this.baseUrl}/users/${email}/auth`,dataofbody,{ maxRedirects: 0})
        .then((response) => {
            return response.data;
        }).catch((err)=>{
                console.log(err);
                if(err.response.status===401){
                    console.log(303);
                    return err.response.data;
             }
                else if(err.response.status===404){
                    
                    console.log(404);
                    return err.response.data;
                }
        });

}
module.exports = new Users();
