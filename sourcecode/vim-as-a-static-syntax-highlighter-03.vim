0,/^<body/ delete
/^<\/body/,$ delete
1s/id='\(.*\)'/class="\1"/
call append(0, [
      \'title: ' .. $SOURCE_FILE,
      \'type: text/prs.sourcecode',
      \''
      \])
saveas! $TARGET_FILE
quitall
