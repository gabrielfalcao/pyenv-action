NODE_VERSION	:= v16
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
	npm install -g yarn@latest
	yarn
else
$(NODE_ROOT) $(NODE_BIN):
	@echo "\033[1;33mWARNING: This project is tested with node $(NODE_VERSION).\033[0m"
	@echo "\033[1;33mWARNING: Your node version is $(shell node -v) instead.\033[0m"
	npm install -g yarn@latest
	yarn
endif

install $(typescript) $(eslint) $(prettier) $(ncc) $(jest): | $(NODE_BIN)
	yarn add $(shell echo $@ | sed 's,$(NODE_ROOT)/,,g')@latest

watch: format | $(typescript)
	npm run watch

dist/index.js: | $(NODE_BIN) lib/pyenv-action.js
	npm run release

lib/pyenv-action.js: | $(typescript)
	npm run build

release: clean test dist/index.js

build: format | $(NODE_BIN)
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
	git clean -Xdf __tests__
	rm -f dist/index.js

node-check: $(NODE_BIN) $(NODE_ROOT)
	@echo BIN $(NODE_BIN)
	@echo ROOT $(NODE_ROOT)


.PHONY: \
    build \
    clean \
    default \
    format \
    install \
    lint \
    node-check \
    release \
    test \
    watch
