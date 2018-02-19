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

/*
getRepoContributors("jquery", "jquery", function(err, result) {
  console.log("Errors:", err);
  //console.log("result:", result);
  var deserialized = JSON.parse(result);
  for (var entry of deserialized){
    console.log("Avatar_url: ", entry.avatar_url);
    dwonloadImageByURL(entry.avatar_url, )
  }
  return
});
*/

function downloadImageByURL(url, filePath) {
  // ...
  request.get(url)
    .on('error', function(err){
    throw err;
    })
    .pipe(fs.createWriteStream(filePath));
}

downloadImageByURL("https://avatars2.githubusercontent.com/u/2741?v=3&s=466", "avatars/kvirani.jpg")