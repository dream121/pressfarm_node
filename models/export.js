/***
 * Blank array to store subscribers
 */
var User      = require('./models/User');
var Reporters = require('./models/Reporter');

var exportUser = function() { 
    User.find(function(error, data){
      var userSibscribers = []
      if( !error && data ) {
        data.forEach(function(item) {
          userSibscribers.push({name:item.email, email: item.email});
        });
        console.log("userSibscribers",userSibscribers); 
      } 
    });
}
var exportReporter = function() {
    
    Reporters.find(function(error, data){
      var reporterSibscribers = []
      if( !error && data ) {
        data.forEach(function(item) {
          reporterSibscribers.push({name:item.name,email:item.email});
        });
        console.log("reporterSibscribers",reporterSibscribers);
      } 
    });

}

exports.Reportercsv = function(req, res) {
Reporter.find({},function(err,reporters){
  if (err) {
  console.log("error");
  }else{
  console.log(reporters);
  json2csv({data: reporters, fields: ['_id', 'name', 'email','publication','twitter','_v','url']}, function(err, csv) {
  if (err) console.log(err);
  fs.writeFile('file.csv', csv, function(err) {
    if (err) throw err;
    console.log('file saved');
  });
});
  }
})

};