#!/bin/sh
case "$(echo "Shutdown\nRestart\nLogout\nSuspend\nLock" | dmenu \
    -nb "${COLOR_BACKGROUND:-#151515}" \
    -nf "${COLOR_DEFAULT:-#aaaaaa}" \
    -sf "${COLOR_HIGHLIGHT:-#589cc5}" \
    -sb "#1a1a1a" \
    -b -i -p \
    "Power:" -l 5)" in
        Shutdown) echo "" > /home/javi/.config/i3/current_song 
		   systemctl poweroff
		  ;;
        Restart) echo "" > /home/javi/.config/i3/current_song 
		 systemctl reboot
		 ;;
        Logout) kill -HUP $XDG_SESSION_PID;;
        Suspend) echo "" > /home/javi/.config/i3/current_song 
		 systemctl suspend
		;;
        Lock) /home/javi/.config/i3/lockin.sh
	      ;;
esac
