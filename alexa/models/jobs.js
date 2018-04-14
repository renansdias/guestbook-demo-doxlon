module.exports = {
	guestbook: {
		namespace: "doxlon",
		folderName: "guestbook",
		spokenName: "guestbook application",
		jobType: {
			deploy: {
				production: "guestbook-prod-deploy"
			},
			rollback: {
				production: "guestbook-prod-rollback"
			}
		}
	}
}