 /** @MSS */
var blog = require('wordpress');

var client = blog.createClient({
    /**@MSS
     *remote wordpress installation link and access details **/
    url: "http://blog.press.farm",
    username: "dev",
    password: "#Centreville20120!"
});
/**@MSS
 *blog main controller fetch all blog posts **/ 
exports.index = function(req, res) {
    /**@MSS
     *client object fetching all posts and return to blog view **/
    client.getPosts(function( error, posts ) {
        //console.log(posts);
        if ( posts && !error ) {
            res.render('blog',{
                title:'Blog',
                posts:posts            
            });
        }
    });  
};
/**@MSS
 *blog main controller fetch all blog single post **/
exports.single = function(req, res) {    
    /**@MSS
     *client object fetching all posts and return to blog view **/
    client.getPost(req.param('id'),function( error, posts ) {
        if ( posts && !error ) {
            res.render('single',{
                title:'Blog',
                singleposts:posts            
            });
        }
    });  
};