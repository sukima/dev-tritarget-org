serve := node_modules/.bin/serve
tiddlywiki := node_modules/.bin/tiddlywiki
merge_json := ./bin/merge-json
deploy_path := ktohg@tritarget.org:tritarget.org
plugins_src := $(shell find plugins -type f)
plugins_out := $(patsubst plugins/%,wiki/plugins/%,$(plugins_src))
asset_files := $(patsubst public/%,wiki/output/%,$(shell find public -type f))

modified_date = $(shell date +%Y%m%d%H%M%S000)
pgp_fingerprint = FA9F14008BA5A847B0977C06EBD99C92DE767C8A

.PHONY: build-files build clean generated diagrams assets tiddlywiki server devpublic media-build deploy updatekey certs

build:
	@rm -f wiki/tiddlywiki.info
	$(MAKE) -e NODE_ENV=production tiddlywiki
	$(MAKE) assets

devpublic:
ifeq (,$(wildcard devcerts/cert.pem))
	$(serve) --cors public/
else
	$(serve) --cors --ssl-cert ./devcerts/cert.pem --ssl-key ./devcerts/key.pem public/
endif

server:
	@rm -f wiki/tiddlywiki.info
	$(MAKE) -e NODE_ENV=development build-files
ifeq (,$(wildcard devcerts/cert.pem))
	$(tiddlywiki) wiki --listen host=0.0.0.0
else
	$(tiddlywiki) wiki --listen host=0.0.0.0 tls-cert=../devcerts/cert.pem tls-key=../devcerts/key.pem
endif

media-build:
	@rm -f wiki/tiddlywiki.info
	$(MAKE) -e NODE_ENV=development build-files

clean:
	rm -rf wiki devcerts

diagrams:
	cd diagrams && $(MAKE)

certs: devcerts

devcerts:
	mkdir -p $@
	openssl genrsa -out $@/key.pem
	openssl req -new -key $@/key.pem -out $@/csr.pem
	openssl x509 -req -days 9999 -in $@/csr.pem -signkey $@/key.pem -out $@/cert.pem
	rm $@/csr.pem

generated: tiddlers/generated/PGPKeyFile.tid tiddlers/generated/PGPKeyInfo.tid

deploy: build
	rsync -rlvz --delete --exclude-from ./config/rsync-exclude wiki/output/ $(deploy_path)

assets: $(asset_files)

build-files: wiki/tiddlywiki.info wiki/tiddlers wiki/themes generated diagrams $(plugins_out)

tiddlywiki: build-files
	$(tiddlywiki) wiki --build index favicon static feed

wiki/tiddlers:
	ln -s ../tiddlers $@

wiki/themes:
	ln -s ../themes $@

wiki/tiddlywiki.info: config/tiddlywiki.info config/includes.json
	@mkdir -p $(dir $@)
	$(merge_json) config/tiddlywiki.info config/includes.json > $@ || rm $@

wiki/plugins/%: plugins/%
	@mkdir -p $(dir $@)
	cp $< $@

wiki/output/key.info: wiki/output/key
	gpg -v $< > $@

wiki/output/%: public/%
	@mkdir -p $(dir $@)
	cp $< $@

updatekey:
	gpg --armor --export-options export-minimal --export $(pgp_fingerprint) > public/key

tiddlers/generated/PGPKeyFile.tid: public/key
	@echo "Generating $@"
	@echo "modified: $(modified_date)" > $@
	@echo "title: PGPKeyFile" >> $@
	@echo "type: text/plain" >> $@
	@echo "caption: Public Key" >> $@
	@echo >> $@
	@cat $< >> $@

tiddlers/generated/PGPKeyInfo.tid: public/key
	@echo "Generating $@"
	@echo "modified: $(modified_date)" > $@
	@echo "title: PGPKeyInfo" >> $@
	@echo "type: text/plain" >> $@
	@echo "caption: Public Key Info" >> $@
	@echo >> $@
	@gpg --show-keys $< >> $@
