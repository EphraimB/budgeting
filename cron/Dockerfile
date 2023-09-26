FROM alpine

# Install PostgreSQL client and other necessary utilities
RUN apk add --no-cache postgresql-client util-linux

# Set global environment variables for cron
ENV SHELL=/bin/sh
ENV PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

WORKDIR /app

RUN mkdir -p /app/tmp && touch /app/tmp/cronjob.lock

# Add the cron job to the system crontab
RUN echo "0 0 1 * * /app/scripts/employeeChecker.sh > /app/cron.log 2>&1" >> /var/spool/cron/crontabs/root

# Start the cron service and run the app
CMD crond -l 2 -b && npm run start

# Expose port
EXPOSE 8080

ENV PORT 8080
