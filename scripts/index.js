const path = require("path");
//path.resolve(path.join(__dirname, "./../octopus.json"));
const CONFIG_FILE_PATH = path.resolve("./octopus.json");

function createBasicConfig(...configParts) {
	return {"workDir": ".", "dependencies": [...configParts]};
}

function readConfig() {
	let config;
	try {
		console.log("Looking for configuration file at path", CONFIG_FILE_PATH);
		config = require(CONFIG_FILE_PATH);
	} catch (err) {
		if (err.code === "MODULE_NOT_FOUND") {
			console.log("Configuration file octopus.json not found. Creating a new config object.");
			config = createBasicConfig();
			let privateSkyRepo;
			console.log("Looking for PRIVATESKY_REPO_NAME as env variable. It can be used to change what PrivateSky repo will be user: psk-release or privatesky.");
			if(typeof process.env.PRIVATESKY_REPO_NAME !== "undefined"){
				privateSkyRepo = process.env.PRIVATESKY_REPO_NAME;
			}else{
				privateSkyRepo = "privatesky";
			}
			// we need a default privatesky instance in order to have access to Brick Storage
			config.dependencies.push(
				{
					"name": "privatesky",
					"src": `http://github.com/privatesky/${privateSkyRepo}.git`,
					"actions": [
						{
							"type": "smartClone",
							"target": ".",
							"collectLog": false
						},
						{
							"type": "execute",
							"cmd": `cd ./privatesky && npm install && npm run build`
						}
					]
				});
		} else {
			throw err;
		}
	}
	return config;
}

function updateConfig(config, callback) {
	const fs = require("fs");
	try {
		fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(config), callback);
	} catch (e) {
		callback(e);
	}
}

function runConfig(config, callback) {
	if(typeof config === "function"){
		callback = config;
		config = undefined;
	}
	
	if(typeof config === "undefined"){
		config = readConfig();
	}
	
	const updater = require("../Deployer");

	updater.setTag("[Octopus]");
	updater.run(config, callback);
}

function handleError(...args){
	const exitCode = 1;
	console.log(...args);
	console.log("Exit code:", exitCode);
	process.exit(exitCode);
}

module.exports = {
	createBasicConfig,
	readConfig,
	updateConfig,
	runConfig,
	handleError
};
