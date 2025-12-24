some docs are in `.docs/` dir in current project - check them for pocketbase docs and for quasar docs

use reproducable builds, so put commands into makefile.

don't try to read whole file, at first check its line number. if it's greater than 100, then use grep / sed / less / head / tail / etc - don't read whole file.


check what you wrote.

configure eslint for frontend and use it before commits

configure prettier for frontend and use it before commits

you have to decompose ideas into features and challenge yourself it it's a good way to implement

before implementing a new feature please:
- condence context
- architect new feature in a new separate numbered file inside special folder
- create new todo list in that file
- condence context again
- implement the feature following architecture and todo list.

