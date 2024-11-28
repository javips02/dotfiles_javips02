# .bashrc

# Source global definitions
if [ -f /etc/bashrc ]; then
    . /etc/bashrc
fi

# User specific environment
if ! [[ "$PATH" =~ "$HOME/.local/bin:$HOME/bin:" ]]; then
    PATH="$HOME/.local/bin:$HOME/bin:$PATH"
fi
export PATH

# Sección de aliases #
# LOCAL #
alias v="nvim"
alias updatef="~/.config/scripts/updateFedora.sh"
# UNIZAR #
alias hendrix="ssh a815877@hendrix-ssh.cps.unizar.es"
alias central="ssh a815877@central.cps.unizar.es"
# Variables de entorno
export LIBVA_DRIVER_NAME=iHD
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export PATH=$JAVA_HOME/bin:$PATH
eval "$(starship init bash)"
