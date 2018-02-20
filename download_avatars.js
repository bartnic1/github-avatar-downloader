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
      'Authorization': process.env.GITHUB_TOKEN
    }
  };
  request(options, function(err, res, body) {
    cb(err, body);
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

//This function covnerts data into a deserialized object format, and calls the
//download function in order to generate new images in a specified directory
function deserializeData(err, result){
  var entry_path;
  if(err !== null){
    console.log("Errors:", err);
  }
  var deserialized = JSON.parse(result);
  for (var entry of deserialized){
    entry_path = "./avatars/" + entry.login;
    downloadImageByURL(entry.avatar_url, entry_path);
  }
  console.log("Avatar download complete!");
}

//This part runs the code only if key variables are defined from the terminal
if(repoOwner !== undefined && repoName !== undefined){
  getRepoContributors(repoOwner, repoName, deserializeData);
}
else{
  console.log('Invalid input: Must enter "Node download_avatars.js <repoOwner> <repoName>"');
}

