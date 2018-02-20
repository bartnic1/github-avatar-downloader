require('./node_modules/dotenv/lib/main.js').config();
var request = require('request');
var fs = require('fs');

var args = process.argv.slice(2);
var repoOwner = args[0];
var repoName = args[1];
var lastUser = false;
var lastRepo = false;
var userCount = 0;
var starredReposObj = {};

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

function mostStarred(starredReposObj){
  var maxStars = 0;
  var repoArray = [];
  var valueArray = [];
  var finalStr = '';
  for(var repo in starredReposObj){
    if(starredReposObj[repo] >= maxStars){
      maxStars = starredReposObj[repo];
    }
  }
  while(repoArray.length < 5 || maxStars === 0){
    for(var repo in starredReposObj){
      if(starredReposObj[repo] === maxStars && repoArray.length < 5){
        repoArray.push(repo);
        valueArray.push(maxStars);
      }
    }
    maxStars--;
  }
  for(let i = 0; i < 5; i++){
    finalStr += `[ ${valueArray[i]} stars] ${repoArray[i]}\n`
  }
  console.log(finalStr)
}


function parseStarredData(res, body, totalUsers){
  var parsedStarred = JSON.parse(body);
  var starName;
  if(parsedStarred.length === 0){
    userCount++;
  }
  else{
    for(var j = 0; j < parsedStarred.length; j++){
      starName = parsedStarred[j].full_name;
      if(starredReposObj[starName] === undefined){
        starredReposObj[starName] = 1;
      }
      else{
        starredReposObj[starName]++;
      }
      if(j === parsedStarred.length - 1){
        userCount++;
      }
    }
  }
  if(userCount === totalUsers && lastUser === true){
    mostStarred(starredReposObj, []);
  }
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
    var subOptions = {
      url: '',
      headers: {
        'User-Agent': process.env.USERNAME,
        'Authorization': `token ${process.env.GITHUB_TOKEN}`
      }
    }
    var deserialized = JSON.parse(body);
    for (var i = 0; i < deserialized.length; i++){
      contribStarredURL = deserialized[i].starred_url.split('{')[0];
      subOptions.url = contribStarredURL;
      request(subOptions, function(err, res, body){
        if(err){
          throw err;
        }
        else{
          parseStarredData(res, body, deserialized.length);
        }
      });
      if(i === deserialized.length - 1){
        lastUser = true;
      }
    }
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

keywordCheckAndRun();