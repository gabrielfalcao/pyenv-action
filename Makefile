.PHONY: default watch release build format lint test docker-test

default: release

watch: format
	npm run watch

dist/index.js: format
	npm run build
	npm run test
	npm run release

release: dist/index.js

build: format
	npm run build

format:
	npm run format

lint:
	npm run lint

test:
	npm run test

test-watch:
	npm run test-watch

docker-test:
	docker build -t gabrielfalcao/pyenv-action .
	docker run --rm -ti gabrielfalcao/pyenv-action bash
