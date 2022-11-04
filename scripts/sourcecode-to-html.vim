syntax on
set t_Co=256
source $HOME/.vimrc
set noswapfile
set viminfofile=NONE
set background=light
colorscheme solarized
edit
let g:html_no_progress = 1
let g:html_number_lines = 0
runtime syntax/2html.vim
saveas! $TARGET_FILE
quitall
