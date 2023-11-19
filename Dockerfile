FROM postgres:16-bookworm

RUN apt-get update && apt-get install -y curl

# Install the pg_cron extension
RUN apt-get -y install postgresql-16-cron

RUN apt-get update && apt-get install -y \
    postgresql-plpython3-16

RUN echo "shared_preload_libraries='pg_cron'" >> /usr/share/postgresql/postgresql.conf.sample
RUN echo "cron.database_name='budgeting'" >> /usr/share/postgresql/postgresql.conf.sample

COPY sql/zgetPayrollsByEmployee.txt /

# restart postgres to load the new config
RUN service postgresql restart