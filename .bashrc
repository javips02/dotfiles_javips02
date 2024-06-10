#
# ~/.bashrc
#

# If not running interactively, don't do anything
[[ $- != *i* ]] && return
alias ls='ls --color=auto'
alias grep='grep --color=auto'
PS1='[\u@\h \W]\$ '

# Alias personales
alias v="nvim"
alias update="~/.config/scripts/updateArchLinux.sh"
# Alias de Unizar
alias central="ssh a815877@central.cps.unizar.es"
alias hendrix="ssh a815877@hendrix-ssh.cps.unizar.es"
# Starship shell prompt
eval "$(starship init bash)"
