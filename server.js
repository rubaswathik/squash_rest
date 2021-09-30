var app 			= require('./app'),
	http			= require('http'),
	editJsonFile 	= require('edit-json-file'),	
	port 			= 8017,
	conf 			= editJsonFile(__root+'config.json');
	
http.createServer(app).listen(port,function(){
	conf.get("D") && console.log('Express server listening on port ' + port);
})
