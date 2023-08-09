FROM bats/bats:latest

WORKDIR /opt/script-tests

COPY . /opt/script-tests

RUN chmod +x /opt/script-tests/*.sh
RUN chmod +x /opt/script-tests/tests/*.bats

WORKDIR /opt/script-tests/tests

CMD ["./"]
