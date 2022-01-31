
SGBD = sqlite

run: ./cfg/private.json
	node --trace-warnings ./index.js

./cfg/private.json:
	echo "please, fill the file ./cfg/private.json"
	echo "Please set the databgase access in sequelizeURL - example: $(SGBD):///some.db.file"
	cp ./cfg/example.private.json ./cfg/private.json

install: install_base install_sgbd audit

install_base:
	npm i

install_sgbd: install_$(SGBD)

install_sqlite:
	npm i sqlite3

audit:
	npm audit