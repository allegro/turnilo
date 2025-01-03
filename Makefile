TURNILO_VERSION := 1.40.2
COMMIT := $(shell git log -1 --pretty=%h)
VERSION := v$(TURNILO_VERSION)-custom-$(COMMIT)
DOCKER_REPO := us-docker.pkg.dev/vgi-pn-277619/data-team/pubnative/turnilo
DOCKER_REPO_DOCKERFILE_FOLDER := .
DOCKER_REPO_VERSION := $(DOCKER_REPO):$(VERSION)
DOCKER_REPO_LATEST := $(DOCKER_REPO):latest

build:
	docker build \
	    --platform linux/amd64 \
	    -t $(DOCKER_REPO_VERSION) \
	    $(DOCKER_REPO_DOCKERFILE_FOLDER)

	docker tag $(DOCKER_REPO_VERSION) $(DOCKER_REPO_LATEST)

publish: publish-latest publish-version

publish-latest: build
 docker push $(DOCKER_REPO_LATEST)

publish-version: build
	docker push $(DOCKER_REPO_VERSION)
