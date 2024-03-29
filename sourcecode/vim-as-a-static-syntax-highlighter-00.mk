sourcecode_src := $(shell find sourcecode -type f)
sourcecode_html := $(patsubst \
	sourcecode/%,wiki/sourcecode/%.html,$(sourcecode_src))
sourcecode_tid := $(patsubst \
	sourcecode/%,tiddlers/sourcecode/%.tid,$(sourcecode_src))

.PHONY: generated

generated: $(sourcecode_tid) \
	tiddlers/generated/sourcecode.css \
	tiddlers/generated/PGPKeyFile.tid \
	tiddlers/generated/PGPKeyInfo.tid

wiki/sourcecode/%.html: sourcecode/%
	@mkdir -p $(@D)
	SOURCE_FILE="$<" \
		TARGET_FILE="$@" \
		vim -N -E -s \
		-c "source scripts/sourcecode-to-html.vim" \
		$< \
		>/dev/null

tiddlers/sourcecode/%.tid: wiki/sourcecode/%.html
	@mkdir -p $(@D)
	SOURCE_FILE="$(patsubst wiki/sourcecode/%.html,%,$<)" \
		TARGET_FILE="$@" \
		./bin/sourcecode-html < $< > $@

tiddlers/generated/sourcecode.css: $(sourcecode_html)
	cat $^ | ./bin/sourcecode-css > $@
