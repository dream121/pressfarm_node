 var mongoose    = require('mongoose');
var bcrypt      = require('bcrypt-nodejs');
var crypto      = require('crypto');
var nodemailer = require('nodemailer');
var Reporter  = require('../models/Reporter');
var secrets = require('../config/secrets');
var fs          = require('fs');
var collections = ["reporters"];
var validator = require('node-validator');
var validator = require('validator');
exports.index=function(req,res){
   Reporter.find({}, null, { sort: 'publication' }, function (err, reporters) {
    res.render('import', {
      title: 'Import contacts',
      reporters: reporters,

    });
  });
}
exports.deletereporters=function(req,res){
	 console.log(req.body);
	var locks = req.body;
        var arr = Object.keys(locks);
	var deleted=0;
        console.log("arr",arr);
	arr.forEach(function(entry) {
	Reporter.remove({'_id':entry},function (err, resp) {
	if(err)
	{
		console.log('error',err)
	}else{
		deleted=1;
	}
	})	
});
	
Reporter.find({}, null, { sort: 'publication' }, function (err, reporters) {
    res.render('import', {
      title: 'Import contacts',
      reporters: reporters,
      

    });
  });

	req.flash('success', { msg: +arr.length+' Reporters deleted successfully' });

}

exports.importer = function(req, res) {
    //var mongoose = require('mongoose');
    console.log("in contacts importer");
    console.log(req.files.contacts);
    
    var add1 = [];
    var success=0;
    var emailerr=0;
    var notfilled=0;
    if (req.files.contacts) {
    var lineList = fs.readFileSync('uploads/'+req.files.contacts.name).toString().split('\n');
    var s=1;
            if (lineList.length){

                for ( var j=0; j<s;j++) {
                    var line = lineList.shift();
                    line.split(',').forEach(function (entry, i) {
	
	
                        add1[i] = entry.replace(/"/g, "");

                       // console.log("field",add1[i]);
                    });
                   // console.log("length ",add1.length);
                    
                   
                    if (add1.length > 3 && add1[0] == "name" && add1[1] == "email" && add1[2] == "publication" && add1[3] == "twitter" && add1[4] == "url") {
 //lineList.shift(); // Shift the headings off the list of records.
    console.log(lineList);
    lineList.pop();
 // Shift the headings off the list of records.
        var add = [];
       
        function createDocRecurse() {
            //console.log("inside loop");
            //console.log(lineList.length);
            //console.log(lineList);
	    var s=lineList.length;

           //console.log("lineList.length",lineList.length);
            if (lineList.length){

                for ( var j=0; j<s;j++) {
                    var line = lineList.shift();
                    line.split(',').forEach(function (entry, i) {
                        add[i] = entry.replace(/"/g, "");  
                    });
                    //console.log(add[0]);
                    if (add[0] && add[1] && add[2] && add[3] && add[4]){
                    var registration = new Reporter({'name':add[0],'email':add[1], 'publication':add[2],'twitter':add[3],'url':add[4]});
                    
                    //console.log("registration",registration);
                    if (validator.isEmail(add[1])) {
                       //console.log("valid email");
                        registration.save(function(err,res){
				if(err)
				{
				 //console.log("not saved",err);	
				}else
				{
				 //console.log("saved",res);
				}
			});
		
                        //mail(add[1]);
                        success=success+1;
                    }
                    else{
                           emailerr=emailerr+1;
                    }}else
                    {
                    notfilled=notfilled+1;     

		  
		    }
                }
            }

         }
   // req.flash('success', { msg: 'Contacts Added Successfully to Pressman and a mail has been sent with Username and password to them' });
    createDocRecurse();
    if (success>0) {
	req.flash('success', { msg: +success+' Contact Added Successfully to Pressman and a mail has been sent with Username and password to them' });
    }
       if (emailerr>0) {
	req.flash('errors', { msg: +emailerr+ ' Email incorrect.' });
    }
     if(notfilled>0){
      req.flash('errors', { msg: +notfilled+ 'rows not filled completely' });
}
    }
     else{
                console.log("not inserted");
                req.flash('errors', { msg: 'Csv file not in proper format according to database schema' });
        }

    }
    
    createDocRecurse();
  
    
    
      
    function mail(email){
	
	//console.log(email);
		//console.log(pass);
    var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'Mailgun',
	  auth: {
          user: secrets.mailgun.user,
          pass: secrets.mailgun.password
        }
      });
      var mailOptions = {
        to: email,
        from: 'contact@press.farm',
        subject: 'Successfully Registered',
        text: 'You are Successfully registered as reporters into pressfarm.\n'+
	"Please Login to  http://" + req.headers.host + "/reporters \n\n"+
	'Thanks for registering with us'
		
		        
      };
      smtpTransport.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
});
      //req.flash('success', { msg: 'Contacts Added Successfully to Pressman and a mail has been sent with Username and password to them' }); 
    }
       //req.flash('success', { msg: 'Contacts Added Successfully to Pressman and a mail has been sent with Username and password to them' });
       res.render('import');
		    
	    }
		    
		    }
		   
	    
    else{
	console.log('no file');
	req.flash('errors', { msg: 'Please select csv file.' });
	res.render('import');
    }
};
