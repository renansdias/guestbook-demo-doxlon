#####################
# V A R I A B L E S ##
#####################

aws_ecr_url = 296250302159.dkr.ecr.eu-west-1.amazonaws.com
repo_name   = guestbook
service_port = 30111
node_port = $(shell expr $(service_port) - 15000)
go_workspace = go-workspace
guestbook_base_dir = $(go_workspace)/src/github.com/renansdias/guestbook-demo-doxlon

###############
# M A C R O S #
###############

LOGIN_DOCKER  := $(shell aws ecr get-login --region eu-west-1)
GIT_REV_PARSE := $(shell git rev-parse HEAD | cut -c1-6 | tr -d '\n')

GOPATH := ${PWD}/$(go_workspace)
export GOPATH

###############
# C O M M O N #
###############

prepare:
	mkdir -p $(go_workspace)/bin
	mkdir -p $(go_workspace)/pkg
	mkdir -p $(go_workspace)/src/github.com/renansdias/guestbook-demo-doxlon/
	rsync -av --exclude '$(go_workspace)' . $(guestbook_base_dir)

install: prepare
	cd $(guestbook_base_dir) && \
	go get -v -t -d ./...

clean-workspace:
	rm -rf $(go_workspace)

authenticate-docker:
	$(LOGIN_DOCKER)

#######################
# P R O D U C T I O N #
#######################

prod-build-image:
	cd $(guestbook_base_dir) && \
		sed -i 's/__NODE_PORT__/$(node_port)/g' main.go && \
		sed -i 's/__NODE_PORT__/$(node_port)/g' Dockerfile && \
		go build -o guestbook_bin main.go && \
		docker build -t $(aws_ecr_url)/$(repo_name):$(GIT_REV_PARSE) .

prod-push-image: authenticate-docker
	docker push $(aws_ecr_url)/$(repo_name):$(GIT_REV_PARSE)

prod-deploy:
	sed -i 's/__NODE_PORT__/$(node_port)/g' ops/kubernetes/deployment.production.json
	sed -i 's/__SERVICE_PORT__/$(service_port)/g' ops/kubernetes/service.production.json
	sed -i 's/__VERSION__/$(GIT_REV_PARSE)/g' ops/kubernetes/deployment.production.json

	kubectl apply -f ops/kubernetes/deployment.production.json
	kubectl apply -f ops/kubernetes/service.production.json

prod-rollback:
	kubectl rollout undo deployment dpl-guestbook --namespace doxlon

prod-clean: 
	docker images $(aws_ecr_url)/$(repo_name) \
		--filter "before=$(aws_ecr_url)/$(repo_name):$(GIT_REV_PARSE)" \
		-q | xargs docker rmi -f || true

