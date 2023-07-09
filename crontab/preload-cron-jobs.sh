#!/bin/bash

# Add the cron job to the system crontab
(crontab -l 2>/dev/null; echo "0 0 1 * * /app/dist/crontab/scripts/cronScriptCheckEmployees.sh") | crontab -

# Start the main process (your application)
exec "$@"
