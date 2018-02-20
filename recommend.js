require('./node_modules/dotenv/lib/main.js').config();
var request = require('request');
var fs = require('fs');

var args = process.argv.slice(2);
var repoOwner = args[0];
var repoName = args[1];

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
    else{
      cb(err, res, body);
    }
  });
}

function deserializeData(err, res, body){
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

  }
}


function keywordCheckAndRun(){
  if(repoOwner !== undefined && repoName !== undefined){
    getRepoContributors(repoOwner, repoName, deserializeData);
  }
  else{
    console.log('Invalid input: Must enter "Node download_avatars.js <repoOwner> <repoName>"');
  }
}