#Starship shell init script
eval "$(starship init zsh)"
eval "$(rbenv init - zsh)"
#Unizar
alias v="nvim"
alias hendrix="ssh a815877@hendrix-ssh.cps.unizar.es"
alias lab000="ssh a815877@lab000.cps.unizar.es"
alias logisim="java -jar /Users/javi/Documents/uni/22_aoc2_rep/logisim-2.7.2-cs3410-20140215.jar"
alias mysql="/usr/local/mysql/bin/mysql -u root -p"
alias vhdl="/Users/javi/.config/scripts/sshDirac2.sh"
#ADSIS2
alias lab102On='ssh a815877@central.cps.unizar.es "/usr/local/etc/wake -y lab102-207"'
alias lab102-207='ssh a815877@lab102-207.cps.unizar.es'
alias lab102State='ssh a815877@central.cps.unizar.es "lab102.sh"'
alias backupo18='scp -r a815877@lab102-207.cps.unizar.es:/home/a815877/as2folder /Users/javi/Documents/uni/32_adsis2/pr1'
alias central='ssh a815877@central.cps.unizar.es'
alias update="~/.config/scripts/updateMacOS.sh"
alias sshcasa="ssh -Y javi@85.251.107.114"
#Variables de entorno PATH
export PATH="/opt/homebrew/bin:$PATH"
export PATH="~/software/flutterSDK/flutter/bin:$PATH"
export PATH="/opt/homebrew/Cellar/openjdk/21.0.1/bin:$PATH"
export JAVA_HOME="/opt/homebrew/Cellar/openjdk/21.0.1"
export PATH="/usr/local/mysql/bin:$PATH"
export PATH="/opt/homebrew/anaconda3/bin:$PATH"
export PATH="/usr/local/bin:$PATH"
export PATH="/usr/bin:$PATH"
#Colores en terminal (para el man sobre todo)
export LESS_TERMCAP_mb=$'\e[1;32m'
export LESS_TERMCAP_md=$'\e[1;32m'
export LESS_TERMCAP_me=$'\e[0m'
export LESS_TERMCAP_se=$'\e[0m'
export LESS_TERMCAP_so=$'\e[01;33m'
export LESS_TERMCAP_ue=$'\e[0m'
export LESS_TERMCAP_us=$'\e[1;4;31m'
# Configuración de Perl para dependencias de ruby
PATH="/Users/javi/perl5/bin${PATH:+:${PATH}}"; export PATH;
PERL5LIB="/Users/javi/perl5/lib/perl5${PERL5LIB:+:${PERL5LIB}}"; export PERL5LIB;
PERL_LOCAL_LIB_ROOT="/Users/javi/perl5${PERL_LOCAL_LIB_ROOT:+:${PERL_LOCAL_LIB_ROOT}}"; export PERL_LOCAL_LIB_ROOT;
PERL_MB_OPT="--install_base \"/Users/javi/perl5\""; export PERL_MB_OPT;
PERL_MM_OPT="INSTALL_BASE=/Users/javi/perl5"; export PERL_MM_OPT;

test -e "${HOME}/.iterm2_shell_integration.zsh" && source "${HOME}/.iterm2_shell_integration.zsh"

