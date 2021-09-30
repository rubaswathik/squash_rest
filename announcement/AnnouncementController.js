var express 	 = require('express'),
	router 		 = express.Router(),
	bodyParser 	 = require('body-parser'),
    editJsonFile = require('edit-json-file'),
   	Mailer       = require(__root+__core+'modules/Mailer'),
    conf 	     = editJsonFile(__root+'config.json');

router.use(bodyParser.json());

var Announcement 	= __db_model.Announcement;

router.post('/', function(req,res){
	var msg = (
		'Hi,<br><br>'+
		'There is a  new Announcement from Intranet is <br><br>'+req.body.description+'<br>'+
		'Regards,<br>'+
		'Intranet'
	)
	var arr = [];
	var subject = 'Announcement From Intranet!';
    var ids = req.body.notify.split(',')
	Announcement.create(req.body).then(function(Announcementinfo){		
		Mailer.sendMail(null,null,ids,false,msg,[],subject,cb);
		function cb(data) {
	        res.status(200).send("Announcement Created Successfully");
	    }	      
	},function(err){
		res.status(500).send("Problem In Creating Announcement");
	})
});

router.get('/:user_id',function(req,res){
	Announcement.findAll({raw:true,where:{user_id:req.params.user_id},order:[['createdAt','DESC']]}).then(function(data){
			res.status(200).send(data);
	},function(err){
		conf.get('D') && console.log("err",err);
	})		
})

router.put('/:announcement_id', function(req,res){
	Announcement.update(req.body,{where:{announcement_id:req.params.announcement_id}}).then(function(Announcementinfo){			      
	    var msg = (
			'Hi,<br><br>'+
			'There is a  updated Announcement from Intranet is <br><br>'+req.body.description+'<br>'+
			'Regards,<br>'+
			'Intranet'
		)
      	var arr = [];
      	var subject = 'Updated Announcement From Intranet!';

      	var ids = req.body.notify.split(',')
      	Mailer.sendMail(null,null,ids,false,msg,[],subject,cb);
		function cb(data) {
        	res.status(200).send("Announcement Updated Successfully");
      	}	 
	},function(err){
		res.status(500).send("Problem In updating Announcement");
	})
});

module.exports=router;