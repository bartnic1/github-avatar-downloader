var request = require('request');
var token = require('./secrets');
var fs = require('fs');

var args = process.argv.slice(2);
var repoOwner = args[0];
var repoName = args[1];

console.log('Welcome to the GitHub Avatar Downloader!');

function getRepoContributors(repoOwner, repoName, cb) {
  var options = {
    url: "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contributors",
    headers: {
      'User-Agent': 'request',
      'Authorization': token.GITHUB_TOKEN
    }
  };
  request(options, function(err, res, body) {
    cb(err, body);
  });
}

function downloadImageByURL(url, filePath) {
  request.get(url)
    .on('error', function(err){
    throw err;
    })
    .pipe(fs.createWriteStream(filePath));
}
if(repoOwner !== undefined && repoName !== undefined){
  getRepoContributors(repoOwner, repoName, function(err, result) {
    var entry_path;
    if(err !== null){
      console.log("Errors:", err);
    }
    var deserialized = JSON.parse(result);
    for (var entry of deserialized){
      entry_path = "./avatars/" + entry.login
      downloadImageByURL(entry.avatar_url, entry_path)
    }
    console.log("Avatar download complete!");
  });
}
else{
  console.log('Invalid input: Must enter "Node download_avatars.js <repoOwner> <repoName>"');
}