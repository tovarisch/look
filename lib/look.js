var	nodetime 		= require('nodetime'),
	Observer		= require("./observer"),
	agentio 		= require('nodetime/lib/agent.io'),	
	agent 			= new (require('./agent'))();

//Агент оставил чисто как заглушку внутреннего механизма нодтайм
agentio.createClient = function () {
	return agent;
};

module.exports.start = function (port, host) {
	var observer = new Observer(port, host);

	observer.listen(function (data) {
		switch (data.cmd) {
			case 'init' :
				// observer.send({ cmd: 'init', args: { socket: data.args.socket, transactions: nodetime.transactions } });
				return;
			case 'transactions-start' :
				nodetime.transactions = true;
				nodetime.resume();
				break;
			case 'transactions-stop' :
				nodetime.pause();
				nodetime.transactions = false;
				break;
		}

		agent.request(data);
	});

	agent.on('request', function (data) {
		observer.send(data);
	});

	agent.on('command', function (data) {
		observer.send(data);
	});

	agent.on('message', function (data) {
		observer.send(data);
	});

	nodetime.profile({ server: 'localhost', accountKey: 'session', silent: true, transactions: false });
};