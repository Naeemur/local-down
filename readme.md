# local-down
A simple, easy, one dependency (nodejs) local server with some handy features. Only one source file does it all.

## Usage
1) copy serve.js into desired folder
2) open the folder in a terminal and run "node serve"
the folder will be served on localhost and the device IP address (on port 80 by default)

## Options
```
-n {ext}     no indexing mode. serves /some/path/ as /some/path/index.html file, has optional {ext} extension (default: html)
-p {port}    opens the server in {port}
-f {folder}  serves the {folder} instead of CWD
-s           silent mode (disables logging)
```
