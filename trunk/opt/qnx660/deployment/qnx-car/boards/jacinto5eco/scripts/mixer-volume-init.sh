#!/bin/sh

mix_ctl group "Input Gain" volume=25%
mix_ctl group "Line In" capture=on

# Don't switch to headphone output. The driver starts with Line Out enabled, and there is no way to use Headphone out at driver startup.
# If we use this, then the sound quality when using headphones is better, but the early audio chime will not be heard as that will be
# sent on Line Out. Leaving here for future reference - https://jira.bbqnx.net/browse/QCARTWO-4600 (JI:502304)
# mix_ctl switch "Headphone Select" on

