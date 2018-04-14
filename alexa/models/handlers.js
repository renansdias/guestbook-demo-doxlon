const request = require('request')
const util = require('util')
const jobs = require('./jobs')

const PRODUCTION = "production"
const DEPLOY = "deploy"
const ROLLBACK = "rollback"

const GUESTBOOK = "guestbook"

var verified = false

module.exports = {
	'LaunchRequest': function() {
		this.attributes['speechOutput'] = this.t("WELCOME_MESSAGE", this.t("SKILL_FULL_NAME"))
		this.emit(':tell', this.attributes['speechOutput'])
	},
	'DeployGuestbookProdIntent': function() {
		if (!verified) {
			this.attributes['name'] = "DeployGuestbookProdIntent"
			this.emit(":ask", this.t("DOUBLE_CHECK_DEPLOY", jobs[GUESTBOOK].spokenName, PRODUCTION))
		} else {
			verified = false
			fullUrl = buildBaseUrl(GUESTBOOK, DEPLOY, PRODUCTION)

			self = this

			request(fullUrl, function(err, res, body) {
				if (err != null) {
					console.log("Error: ")
					console.log(err)

					context.fail(err)
				}

				self.emit(':tell', self.t("JUST_BEEN_DEPLOYED", jobs[GUESTBOOK].spokenName, PRODUCTION))
			})
		}
	},
	'RollbackGuestbookProdIntent': function() {
		if (!verified) {
			this.attributes['name'] = "RollbackGuestbookProdIntent"
			this.emit(":ask", this.t("DOUBLE_CHECK_ROLLBACK", jobs[GUESTBOOK].spokenName, PRODUCTION))
		} else {
			verified = false
			fullUrl = buildBaseUrl(GUESTBOOK, ROLLBACK, PRODUCTION)

			self = this

			request(fullUrl, function(err, res, body) {
				if (err != null) {
					console.log("Error: ")
					console.log(err)

					context.fail(err)
				}

				self.emit(':tell', self.t("JUST_BEEN_ROLLEDBACK", jobs[GUESTBOOK].spokenName, PRODUCTION))
			})
		}
	},
	'AMAZON.YesIntent': function() {
		verified = true

		this.emit(this.attributes['name'])
	},
	'AMAZON.NoIntent': function() {
		verified = false

		this.emit(":tell", "That's fine. Your request has been cancelled.")
	}
}