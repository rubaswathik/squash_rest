var express   = require('express'),
    router    = express.Router(),
    bodyParser= require('body-parser'),
    random_number     = require('random-number'),
    options           = { min:1, max:10000, integer:true},
     Mailer            = require(__root+__core+'modules/Mailer'),
    bcrypt    = require('bcryptjs');

router.use(bodyParser.json());

var User  = __db_model.User,
    Org   = __db_model.Org;    

function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

// CREATES A NEW USER
router.post('/' , function (req, res) {
  var request = req.body;
  request.code = request.code.toString()
  User.findOne({raw:true,where:{mail:request.mail,code:request.code}}).then(function (user) {
    if((user == 0) || (user == null) || (!user)){
      res.status(500).send("Wrong Code");
    }else if(user){
      res.status(200).send("User created successfully");
    } 
  })

});

router.post('/code' , function (req, res) {
  var request = req.body;
  request.code = random_number(options);
    request.password = bcrypt.hashSync(request.password, 8);
    User.findOne({raw:true,where:{mail:request.mail,first_name:request.first_name}}).then(function (user_info) {
      var msg = 'Hi, The verification code for Infranet is '+request.code;
      var arr = [];
      var subject = 'Code For Infranet!';
      if(!user_info){
          User.create(request).then(function(user){
        
      Mailer.sendMail(null,null,request.mail,false,msg,[],subject,cb);
      function cb(data) {
        res.status(200).send({code :request.code});
      }
      },function(err){
        if(err && err.errors[0].message) { return res.status(500).send(err.errors[0].message)} //DUPLICATE ENTRY FOR UNIQUE FIELD
        res.status(500).send("User creation failed");
      })
        }else{
          User.update({code:request.code},{where:{mail:request.mail}}).then(function (update) {
                 Mailer.sendMail(null,null,request.mail,false,msg,[],subject,cb);
      function cb(data) {
        res.status(200).send({code :request.code});
      }
          })
    
        }
    
    })
});

// RETURNS ALL THE USERS IN THE DATABASE
router.get('/', function (req, res) {
  User.findOne({raw:true,where:{user_id:req.userId}}).then(function(user_info){
    var obj={};
    if(user_info.roles.indexOf('RESELLER')>-1){
      obj["reseller_org_id"]=user_info.reseller_org_id
    }
    User.findAll({raw:true,where:obj,order:[['createdAt','DESC']]}).then(function(user){
      res.status(200).send(user)
    },function(err){
      res.status(500).send("There was a problem in finding the Users")
    })
  })
});

// GETS A SINGLE USER FROM THE DATABASE
router.get('/:user_id',  function (req, res) {
  User.findOne({raw:true,where:{user_id:req.params.user_id}}).then(function(user){
    if (!user){return res.status(404).send("No user found.");}
    user.password="";
    res.status(200).send(user);
  },function(err){
    res.status(500).send("There was a problem in finding the user.");
  });
});

//FOR UPDATION USE ONLY _ID

router.put('/:user_id',  function (req, res) {
  var req_body=req.body
  var password=req_body.password
  var status  =req_body.status
  function execute(){
      if(password){
        req_body.password = bcrypt.hashSync(password, 8);
      }else{
        delete password;
      }
      User.update(req.body,{where: {user_id:req.params.user_id}}).then(function(rowsUpdated) {
        if(rowsUpdated == 0) {res.status(500).send("User updation Failed")}
        if(rowsUpdated > 0) {res.status(200).send("User updated successfully")}
      });
  }

  if((req_body.user_id == req.userId) && (status == false)){
      res.status(500).send("Unable to disable the self account");
  }else{
      execute();
  }
});

module.exports = router;