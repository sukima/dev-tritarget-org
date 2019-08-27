babel := node_modules/.bin/babel
tiddlywiki := node_modules/.bin/tiddlywiki
merge_json := ./bin/merge-json
deploy_path := ktohg@tritarget.org:tritarget.org
polyfill := wiki/plugins/babel-polyfill/files/polyfill.min.js
plugins_src := $(shell find plugins -type f)
plugins_out := $(patsubst plugins/%,wiki/plugins/%,$(plugins_src))
asset_files := $(patsubst public/%,wiki/output/%,$(shell find public -type f))

.PHONY: build-files build clean generated diagrams assets tiddlywiki server media-build deploy

build:
	@rm -f wiki/tiddlywiki.info
	$(MAKE) -e NODE_ENV=production tiddlywiki
	$(MAKE) assets

server:
	@rm -f wiki/tiddlywiki.info
	$(MAKE) -e NODE_ENV=development build-files
	$(tiddlywiki) wiki --listen host=0.0.0.0

media-build:
	@rm -f wiki/tiddlywiki.info
	$(MAKE) -e NODE_ENV=development build-files

clean:
	rm -rf wiki

diagrams:
	cd diagrams && $(MAKE)

generated: tiddlers/generated/PGPKeyFile.tid tiddlers/generated/PGPKeyInfo.tid

deploy: build
	rsync -rlvz --delete --exclude-from ./config/rsync-exclude wiki/output/ $(deploy_path)

assets: $(asset_files)

build-files: wiki/tiddlywiki.info wiki/tiddlers generated diagrams $(polyfill) $(plugins_out)

tiddlywiki: build-files
	$(tiddlywiki) wiki --build index favicon static feed

$(polyfill): node_modules/babel-polyfill/dist/polyfill.min.js
	@mkdir -p $(dir $@)
	cp $< $@

wiki/tiddlers:
	ln -s ../tiddlers $@

wiki/tiddlywiki.info: config/tiddlywiki.info config/includes.json
	@mkdir -p $(dir $@)
	$(merge_json) config/tiddlywiki.info config/includes.json > $@ || rm $@

wiki/plugins/%.js: plugins/%.js
	@mkdir -p $(dir $@)
	$(babel) $< --out-file $@

wiki/plugins/%: plugins/%
	@mkdir -p $(dir $@)
	cp $< $@

wiki/output/key.info: wiki/output/key
	gpg -v $< > $@

wiki/output/%: public/%
	@mkdir -p $(dir $@)
	cp $< $@

tiddlers/generated/PGPKeyFile.tid: public/key
	@echo "Generating $@"
	@echo "modified: $(date +%Y%m%d%H%M%S000)" >> $@
	@echo "title: PGPKeyFile" >> $@
	@echo "type: text/plain" >> $@
	@echo "caption: Public Key" >> $@
	@echo >> $@
	@cat $< >> $@

tiddlers/generated/PGPKeyInfo.tid: public/key
	@echo "Generating $@"
	@echo "modified: $(date +%Y%m%d%H%M%S000)" >> $@
	@echo "title: PGPKeyInfo" >> $@
	@echo "type: text/plain" >> $@
	@echo "caption: Public Key Info" >> $@
	@echo >> $@
	@gpg -v $< >> $@
