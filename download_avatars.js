require('./node_modules/dotenv/lib/main.js').config();
var request = require('request');
var fs = require('fs');

var args = process.argv.slice(2);
var repoOwner = args[0];
var repoName = args[1];
var storageDirectory = "./"+repoName.toString()+"-avatars";

console.log('Welcome to the GitHub Avatar Downloader!');

//This function retrieves a JSON file from a specific github repoOwner and repoName.
function getRepoContributors(repoOwner, repoName, cb) {
  var options = {
    url: "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contributors",
    headers: {
      'User-Agent': process.env.USERNAME,
      'Authorization': `token ${process.env.GITHUB_TOKEN}`
    }
  };
  request(options, function(err, res, body) {
    if(err){
      throw err;
    }
    cb(err, res, body);
  });
}
//This function downloads an image from a given URL to a relative filepath
function downloadImageByURL(url, filePath) {
  request.get(url)
    .on('error', function(err){
      throw err;
    })
    .pipe(fs.createWriteStream(filePath));
}

//This function converts data into a deserialized object format, and calls the
//download function in order to generate new images in a specified directory

//It also tests whether the resource was found, or
function deserializeData(err, res, result){
  var entry_path;
  if(err){
    throw err;
  }
  else if(res.statusCode === 404){
    console.log("Resource not found");
  }
  else if(res.statusCode === 401 || res.statusCode === 403){
    console.log("Unauthorized or Forbidden access to resource");
  }
  else{
    var deserialized = JSON.parse(result);
    for (var entry of deserialized){
      entry_path = storageDirectory + '/' + entry.login;
      downloadImageByURL(entry.avatar_url, entry_path);
    }
    console.log("Avatar download complete!");
  }
}

//This part performs secondary tests, running only if key variables are defined from the terminal
function runTests(){
  if(repoOwner !== undefined && repoName !== undefined){
    getRepoContributors(repoOwner, repoName, deserializeData);
  }
  else{
    console.log('Invalid input: Must enter "Node download_avatars.js <repoOwner> <repoName>"');
  }
}

//This functiont tests whether a .env file exists, and if so, whether it has the necessary entries.
function envCheck(){
  fs.readdir("./", function(err, files){
    var envFound = false;
    for(var file of files){
      if(file === ".env"){
        envFound = true;
        if(process.env.USERNAME === null || process.env.USERNAME === undefined){
          console.log("No key USERNAME found");
        }
        else if(process.env.GITHUB_TOKEN === null || process.env.GITHUB_TOKEN === undefined){
          console.log("No key GITHUB_TOKEN found");
        }
        else{
          runTests();
        }
      }
    }
    if(envFound === false){
      console.log(".env file not found!");
    }
  });
}

//This function checks if the avatars directory exists before running further tests.
//If not, it creates it.
function avatarCheck(){
  fs.readdir(storageDirectory, function(err, files){
    if(err){
      fs.mkdir(storageDirectory, function(){
        envCheck();
      });
    }
    else{
      envCheck();
    }
  });
}

//This runs the program
avatarCheck();