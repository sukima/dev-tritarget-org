syntax on
set t_Co=256
source $HOME/.vimrc
set noswapfile
set viminfofile=NONE
set background=light
edit
set tabstop=2
set expandtab
let g:html_no_progress = 1
let g:html_number_lines = 0
let g:html_expand_tabs = 1
runtime syntax/2html.vim
saveas! $TARGET_FILE
quitall
