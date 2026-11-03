
function __complete_wizcli
    set -lx COMP_LINE (commandline -cp)
    test -z (commandline -ct)
    and set COMP_LINE "$COMP_LINE "
    /Users/perezja2/Downloads/wizcli
end
complete -f -c wizcli -a "(__complete_wizcli)"

