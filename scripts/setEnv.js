const argIdentifier = "--file=";
const errorMessage = `Misuse of script. Syntax node path_to_script ${argIdentifier}'path_to_env_file' \"[npm cmd] [node cmd]\"`;
const args = process.argv;
args.splice(0, 2);

const octopus = require("./index");
if(args.length <2){
	//throw new Error("This script expects exactly one argument as path to a JSON file that contains env variables that need to be set up.");
	octopus.handleError(errorMessage);
}

let fileArg = args.shift();
if(fileArg.indexOf(argIdentifier) === -1){
	octopus.handleError(errorMessage);
}
fileArg = fileArg.replace(argIdentifier, "");

let envJson = {};
try{
	envJson = require(fileArg);
}catch(err){
	console.log("env file not found or contains an invalid JSON!");
}

let fileArgDevel = "./env.json.devel";
let fs = require("fs");
if(fs.existsSync(fileArgDevel)){
	envJson["DEV"]= true;
	console.log("Running in DEVELOPMENT mode");
} else {
	console.log("Running in STABLE (FREEZED) mode");
};

const {spawn} = require("child_process");
for(let prop in envJson){
	let preventFlag = `PREVENT_${prop}`;
	if(process.env[preventFlag] === "true"){
		console.log(`Env variable ${prop} not set due to flag ${preventFlag} value: ${process.env[preventFlag]}`);
		continue;
	}
	process.env[prop] = envJson[prop];
}
console.log("Environment was updated.");

const spawn_cmd = args.join(" ");

console.log("Preparing to execute cmd", spawn_cmd);
const ps = spawn(spawn_cmd, undefined, {shell: true, stdio: "inherit"});

ps.on('close', (code) => {
  process.exit(code);
});

