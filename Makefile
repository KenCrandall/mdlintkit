SHELL := /bin/bash

NPM ?= npm
NODE_MODULES_STAMP := node_modules/.package-lock.json
# These are repository-local downloads or caches that can be regenerated.
# Keep source inputs such as package-lock.json out of this list.
MRPROPER_PATHS := \
	node_modules \
	.npm \
	.pnpm-store \
	.yarn \
	.cache \
	.playwright \
	.playwright-browsers

.PHONY: deps lint mdfix mrproper

deps: $(NODE_MODULES_STAMP)

$(NODE_MODULES_STAMP): package.json
	$(NPM) install

lint: deps
	$(NPM) run lint:markdown

mdfix: deps
	@set +e; \
	$(NPM) run fix:markdown; \
	status=$$?; \
	if [ $$status -gt 1 ]; then \
		exit $$status; \
	fi

mrproper:
	rm -rf $(MRPROPER_PATHS)
