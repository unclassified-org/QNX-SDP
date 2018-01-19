read_conf ()
{
	local oldifs pref k v ws cr ret
	if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]
	then
		echo "Usage: read_conf NEW_IFS [ENV_PREFIX]" >&2
		return 2
	fi
	
	ret=0
	cr=$(print '\r')
	oldifs=${IFS+x$IFS}
	IFS=$1
	pref=${2-CONF_}
	while :
	do
		k=''
		if ! read -r k v
		then
			if [ -n "${k?}" ]
			then
				for v in "file doesn't end with newline" \
						"last line ignored ($k=...)"
				do
					echo "config.ksh:read_conf: ${v:?}">&2
				done
				ret=1
			fi
			break
		fi
		
		# strip whitespace from k (note tab and space in square brackets)
		ws=${k%%[!	 ]*}  # get whitespace at beginning of k
		k=${k#"$ws"}
		ws=${k##*[!	 ]}  # get whitespace at end of k
		k=${k%"$ws"}
		unset ws
		
		# strip trailing carriage return from v,
		# in case it was edited in Windows
		v=${v%"$cr"}
		
		case "$k" in
		["#;"]*)
			# comment line
			;;
		[0-9]* | *[!a-zA-Z0-9_]*)
			echo "read_conf got bad key: ${k?}" >&2
			;;
		*)
			eval "${pref?}${k?}=\${v?}"
			;;
		esac
	done
	unset IFS
	[ -n "${oldifs?}" ] && IFS=${oldifs#?}
	return "${ret:?}"
}
