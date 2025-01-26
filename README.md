# How to get this runable?

## Installation

1. In a terminal run `git clone https://github.com/hkurtagic/HelpMeImStuck.git`
2. Navigate to the project's root directory
3. Add a `.local.env` file to the project's root directory with following variables (add a different value instead of `[custom value]`):
   - `JWT_SECRET=[custom value]`
   - `JWT_REFRESH_SECRET=[custom value]`
4. Run `deno install --allow-scripts=npm:sqlite3@5.1.7` in the root folder

## Startup

5. Run `deno task backend start`
6. In a second terminal also navigate to the project's root folder and run `deno task frontend dev`
   - If this does not work instead:
     1. use `cd ./frontend`
     2. then run `npm run dev`
7. In a webbrowser navigate to [http://localhost:5173/](http://localhost:5173/ "HelpMeImStuck").

Info: The backend runs on [http://localhost:5173/](http://localhost:5173/ "HelpMeImStuck")

### Development commands

deno task [frontend|backend] [command] [parameter]

frontend:

- dev Start the development server
- build Output the static site
- lint Run the linter
- preview Run a http server locally and serve the build project

backend:

- start Start the development server

deno test ./test/[frontend|backend]
