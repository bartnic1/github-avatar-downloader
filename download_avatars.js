var request = require('request');
var token = require('./secrets');
var fs = require('fs');

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

getRepoContributors("jquery", "jquery", function(err, result) {
  var entry_path;
  console.log("Errors:", err);
  var deserialized = JSON.parse(result);
  for (var entry of deserialized){
    entry_path = "./avatars/" + entry.login
    downloadImageByURL(entry.avatar_url, entry_path)
  }
});

function downloadImageByURL(url, filePath) {
  request.get(url)
    .on('error', function(err){
    throw err;
    })
    .pipe(fs.createWriteStream(filePath));
}