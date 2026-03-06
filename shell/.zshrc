#Starship shell init script
eval "$(starship init zsh)"
eval "$(rbenv init - zsh)"
#Unizar
alias v="nvim"
alias hendrix="ssh a815877@hendrix-ssh.cps.unizar.es"
alias central='ssh a815877@central.cps.unizar.es'
alias lab000="ssh a815877@lab000.cps.unizar.es"
alias update="~/.config/scripts/updateMacOS.sh"
alias lua="luajit"
#Variables de entorno PATH
export JAVA_HOME="/opt/homebrew/Cellar/openjdk@21/21.0.7/"
export PATH="/opt/homebrew/bin:$PATH"
export PATH="/opt/homebrew/Cellar/openjdk/21.0.1/bin:$PATH"
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
export PATH="/usr/local/bin:$PATH"
export PATH="/usr/bin:$PATH"
export PATH="/opt/homebrew/opt/perl/bin:$PATH"
alias gem="/opt/homebrew/opt/ruby/bin/gem"
#Colores en terminal (para el man sobre todo)
export LESS_TERMCAP_mb=$'\e[1;32m'
export LESS_TERMCAP_md=$'\e[1;32m'
export LESS_TERMCAP_me=$'\e[0m'
export LESS_TERMCAP_se=$'\e[0m'
export LESS_TERMCAP_so=$'\e[01;33m'
export LESS_TERMCAP_ue=$'\e[0m'
export LESS_TERMCAP_us=$'\e[1;4;31m'
export NVM_DIR="$HOME/.nvm"
  [ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"  # This loads nvm
  [ -s "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm" ] && \. "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm"


test -e "${HOME}/.iterm2_shell_integration.zsh" && source "${HOME}/.iterm2_shell_integration.zsh"
# zsh macos completions
#enable compression
autoload -U compinit
compinit
# add path
fpath=(/opt/homebrew/share/zsh/site-functions $fpath)

# The following lines have been added by Docker Desktop to enable Docker CLI completions.
fpath=(/Users/javi/.docker/completions $fpath)
autoload -Uz compinit
compinit
# End of Docker CLI completions

# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
#__conda_setup="$('/opt/anaconda3/bin/conda' 'shell.zsh' 'hook' 2> /dev/null)"
#if [ $? -eq 0 ]; then
#    eval "$__conda_setup"
#else
#    if [ -f "/opt/anaconda3/etc/profile.d/conda.sh" ]; then
#        . "/opt/anaconda3/etc/profile.d/conda.sh"
#    else
#        export PATH="/opt/anaconda3/bin:$PATH"
#    fi
#fi
#unset __conda_setup
# <<< conda initialize <<<

[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
