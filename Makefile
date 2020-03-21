watch: prettier
	npm run watch

dist/index.js: prettier
	npm run build

prettier:
	npm run format

docker-test:
	docker build -t gabrielfalcao/pyenv-action .
	docker run --rm -ti gabrielfalcao/pyenv-action bash
