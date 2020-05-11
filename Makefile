.PHONY: default watch release build format lint test clean

NODE_VERSION	:= v12.16.1
GIT_ROOT	:= $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
NODE_ROOT	:= $(GIT_ROOT)/node_modules
NODE_BIN	:= $(NODE_ROOT)/.bin

typescript	:= $(NODE_BIN)/tsc
eslint		:= $(NODE_BIN)/eslint
prettier	:= $(NODE_BIN)/prettier
ncc		:= $(NODE_BIN)/ncc
jest		:= $(NODE_BIN)/jest

default: $(NODE_ROOT) release

ifeq ($(shell node -v),$(NODE_VERSION))
$(NODE_ROOT) $(NODE_BIN):
	npm install
else
$(NODE_ROOT) $(NODE_BIN):
	@echo "\033[1;33mWARNING: This project is tested with node $(NODE_VERSION) only.\033[0m"
	@echo "\033[1;33mWARNING: Your node version is $(shell node -v) instead.\033[0m"
	npm install
endif

$(typescript) $(eslint) $(prettier) $(ncc) $(jest): | $(NODE_BIN)
	npm install

watch: format | $(typescript)
	npm run watch

dist/index.js: | lib/pyenv-action.js
	npm run release

lib/pyenv-action.js: | $(typescript)
	npm run build

release: clean dist/index.js

build: format
	npm run build

format: | $(prettier)
	npm run format

lint: | $(eslint)
	npm run lint

test: | $(jest)
	npm run test

test-watch: | $(jest)
	npm run test-watch

clean:
	rm -f dist/index.js
