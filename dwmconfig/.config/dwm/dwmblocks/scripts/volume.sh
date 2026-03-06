#!/bin/sh
vol="$(pamixer --get-volume)"

if [ "$vol" -gt "70" ]; then
	icon=""
elif [ "$vol" -lt "20" ]; then
	icon=""
else
	icon=""
fi



#echo ^c#C678DD^"[$icon $vol%]"
echo "[$icon $vol%]"
