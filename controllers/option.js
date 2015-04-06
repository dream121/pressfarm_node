var Option = require('../models/options');
var collections = ["options"];

exports.index = function(req, res){
    
 res.render('options', { title: 'Add_options'})
};
exports.addoption = function(req, res){
    name=req.body.name;
    value=req.body.value;
    var opt = new Option({'_id':name,'name':name,'value':value});
    opt.save(function(err,res){
                                if(err)
                                {
                                 console.log("not saved",err);
                                }else
                                 {
                                 console.log("saved",res);
                                }
                        });
 res.render('options', { title: 'Add_options'})
};