#!/bin/sh

with_umask ()
{
        local oldmask ret
        [ "$#" -ge 1 ] || return

        oldmask=$(umask) || return
        umask "$1" || return
        shift

        ret=0
        "$@" || ret=$?

        umask "${oldmask?}"
        return "${ret:?}"
}

tools_ssh_keygen ()
{
        local ssh_etcdir ssh_vardir type filename etclink varkey
        ssh_etcdir="/etc/ssh"
        ssh_vardir="/var/etc/ssh"

        mkdir -p "$ssh_vardir"
        for type in rsa
        do
                filename="ssh_host_${type:?}_key"
                etclink="${ssh_etcdir?}/${filename:?}"
                varkey="${ssh_vardir?}/${filename:?}"

                if [ ! -f "${etclink:?}" ]  # link currently invalid
                then
                        ssh-keygen -t "${type:?}" -N '' -f "${varkey:?}" || return
                fi
        done
}

tools_sshd ()
{
        local x
        {
                with_umask 022 tools_ssh_keygen
                x=/var/chroot/sshd
                mkdir -p "$x/."
                chmod 0755 "$x"
                ssh_path=$(command -v sshd) && "$ssh_path"
        } &
}

#This script is intended to run once/boot only, at startup
running=/dev/shmem/ssh-start.run
[ -e $running ] && exit

tools_sshd;

touch $running
unset running
