var express       = require('express'),
    router        = express.Router(),
    bodyParser    = require('body-parser'),
    editJsonFile  = require('edit-json-file'),
    fileUpload     = require('express-fileupload'),
    jwt           = require('jsonwebtoken'),
    bcrypt        = require('bcryptjs'),
    exec          = require('child_process').exec,
    fs            = require('fs');
    
var config      = require(__root +__core+'config'),
    Mailer      = require(__root+__core+'modules/Mailer'),
    conf        = editJsonFile(__root +"config.json");
    
router.use(bodyParser.json());
router.use(fileUpload());

var User            = __db_model.User;
var Org             = __db_model.Org;

var remote_domain = conf.get('remote_domain'),
    remote_port   = conf.get('remote_port'),
    method_get    = 'GET',
    api           = '/api/auth'

router.post('/login', function(req, res) {
  var req_body=req.body
  User.findOne({raw:true,where: {first_name: req_body.username}}).then(function(user){
    if((user == 0) || (user == null) || (!user)){
      return res.status(404).send('No user found.');
    }else{
      // check if the password is valid
      var passwordIsValid = bcrypt.compareSync(req_body.password, user.password);

      if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

      //if user is found and password is valid
      // create a token
      var user_id=user.user_id
      var token = jwt.sign({ id: user_id }, config.secret, {
        expiresIn: conf.get('expires_time') // expires in 15 mins
      });
      //return the information including token as JSON
      res.status(200).send({ auth: true, token: token, userId:user_id, expireMin: conf.get('expires_time'), first_name:user.first_name, last_name:user.last_name});
    }
  },function(err){
    return res.status(500).send('There was a problem in finding the user');
  });
});

router.get('/logout', function(req, res) {
  res.status(200).send({ auth: false, token: null });
});

module.exports = router;