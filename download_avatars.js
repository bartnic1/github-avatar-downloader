require('./node_modules/dotenv/lib/main.js').config();
var request = require('request');
var fs = require('fs');

var args = process.argv.slice(2);
var repoOwner = args[0];
var repoName = args[1];

console.log('Welcome to the GitHub Avatar Downloader!');

//This function retrieves a JSON file from a specific github repoOwner and repoName.
function getRepoContributors(repoOwner, repoName, cb) {
  var options = {
    url: "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contributors",
    headers: {
      'User-Agent': process.env.USERNAME,
      'Authorization': 'token '+ process.env.GITHUB_TOKEN
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
//downloadimage function in order to generate new images in a specified directory

//It also tests whether the resource was found, or whether access is restricted.
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

//This function tests whether a .env file exists, and if so, whether it has the necessary entries.
//This is the last check before the program runs.
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
          getRepoContributors(repoOwner, repoName, deserializeData);
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
function startDirChecks(){
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

//This starts the checks and, if they pass, the program
function keywordCheck(){
  if(repoOwner !== undefined && repoName !== undefined){
    storageDirectory = "./"+repoName.toString()+"-avatars"
    startDirChecks();
  }
  else{
    console.log('Invalid input: Must enter "Node download_avatars.js <repoOwner> <repoName>"');
  }
}

//Run the first function to start the testing process
keywordCheck();