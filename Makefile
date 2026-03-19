SHELL := /bin/bash

NPM ?= npm
NODE_MODULES_STAMP := node_modules/.package-lock.json
MARKDOWNLINT_DOC_SUBMODULE := vendor/markdownlint
MARKDOWNLINT_DOC_SUBMODULE_BRANCH := main
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

.PHONY: deps lint mdfix mrproper setup update vendor-docs

deps: $(NODE_MODULES_STAMP)

$(NODE_MODULES_STAMP): package.json
	$(NPM) install

setup: vendor-docs deps

vendor-docs:
	git submodule update --init --depth 1 $(MARKDOWNLINT_DOC_SUBMODULE)
	git -C $(MARKDOWNLINT_DOC_SUBMODULE) sparse-checkout init --no-cone
	git -C $(MARKDOWNLINT_DOC_SUBMODULE) sparse-checkout set /doc/

update: vendor-docs
	@set -e; \
	git submodule update --remote --depth 1 $(MARKDOWNLINT_DOC_SUBMODULE); \
	git -C $(MARKDOWNLINT_DOC_SUBMODULE) sparse-checkout init --no-cone; \
	git -C $(MARKDOWNLINT_DOC_SUBMODULE) sparse-checkout set /doc/; \
	if git diff --quiet -- $(MARKDOWNLINT_DOC_SUBMODULE); then \
		echo "$(MARKDOWNLINT_DOC_SUBMODULE) is already up to date."; \
		exit 0; \
	fi; \
	submodule_commit=$$(git -C $(MARKDOWNLINT_DOC_SUBMODULE) rev-parse --short=12 HEAD); \
	submodule_subject=$$(git -C $(MARKDOWNLINT_DOC_SUBMODULE) log -1 --format=%s HEAD); \
	git add $(MARKDOWNLINT_DOC_SUBMODULE); \
	git commit --only -m "Update vendor-docs to $$submodule_commit" \
		-m "Upstream markdownlint $(MARKDOWNLINT_DOC_SUBMODULE_BRANCH): $$submodule_subject" \
		-- $(MARKDOWNLINT_DOC_SUBMODULE)

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
