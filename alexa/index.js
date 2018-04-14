var Alexa = require('alexa-sdk');

var jobs = require('./models/jobs')
var handlers = require('./models/handlers')
var languageStrings = require('./models/languages')

var APP_ID = process.env.APP_ID;

var jenkinsBaseUrl = process.env.JENKINS_BASE_URL;
var jenkinsJobToken = process.env.JENKINS_JOB_TOKEN;
var jenkinsUser = process.env.JENKINS_USER;
var jenkinsUserApiToken = process.env.JENKINS_USER_API_TOKEN;

exports.handler = function(event, context) {
	var alexa = Alexa.handler(event, context);
	alexa.APP_ID = APP_ID;
	alexa.resources = languageStrings;
	alexa.registerHandlers(handlers);
    alexa.execute();
}

buildBaseUrl = function(service, jobType, environment) {
	console.log("Building the base URL");

	fullUrl = 'http://' + jenkinsUser 
			            + ':' 
						+ jenkinsUserApiToken 
						+ '@' 
						+ jenkinsBaseUrl 
						+ '/job/'
						+ jobs[service].namespace
						+ '/job/'
						+ jobs[service].folderName
						+ '/job/'
						+ jobs[service].jobType[jobType][environment]
						+ '/'
						+ 'build'
						+ '?token=' 
						+ jenkinsJobToken

	console.log("Full URL: " + fullUrl)

	return fullUrl;
}
