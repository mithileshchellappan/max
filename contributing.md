## Contributing to Max

Max is an independent fork of Bruno. Contributions should preserve Bruno compatibility where possible while keeping Max's cloud workspace behavior explicit and well tested.

### Technology Stack

Max is built using React, Electron, and Convex.

Libraries we use

- CSS - Tailwind
- Code Editors - Codemirror
- State Management - Redux
- Icons - Tabler Icons
- Forms - formik
- Schema Validation - Yup
- Request Client - axios
- Filesystem Watcher - chokidar
- i18n - i18next

> [!IMPORTANT]
> You would need [Node v22.x or the latest LTS version](https://nodejs.org/en/). We use npm workspaces in the project

## Development

Max is a desktop app. Below are the instructions to run Max.

> Note: We use React for the frontend and rsbuild for build and dev server.

## Install Dependencies

```bash
# use nodejs 22 version
nvm use

# install deps
npm i --legacy-peer-deps
```

### Local Development

#### Build packages

##### Option 1

```bash
# build packages
npm run build:graphql-docs
npm run build:bruno-query
npm run build:bruno-common
npm run build:bruno-converters
npm run build:bruno-requests
npm run build:schema-types
npm run build:bruno-filestore

# bundle js sandbox libraries
npm run sandbox:bundle-libraries --workspace=packages/bruno-js
```

##### Option 2

```bash
# install dependencies and setup
npm run setup
```

#### Run the app

##### Option 1

```bash
# run react app (terminal 1)
npm run dev:web

# run electron app (terminal 2)
npm run dev:electron
```

##### Option 2

```bash
# run electron and react app concurrently
npm run dev
```

#### Customize Electron `userData` path

If `ELECTRON_USER_DATA_PATH` env-variable is present and its development mode, then `userData` path is modified accordingly.

e.g.

```sh
ELECTRON_USER_DATA_PATH=$(realpath ~/Desktop/max-test) npm run dev:electron
```

This will create a `max-test` folder on your Desktop and use it as the `userData` path.

### Troubleshooting

You might encounter a `Unsupported platform` error when you run `npm install`. To fix this, you will need to delete `node_modules` and `package-lock.json` and run `npm install`. This should install all the necessary packages needed to run the app.

```shell
# Delete node_modules in sub-directories
find ./ -type d -name "node_modules" -print0 | while read -d $'\0' dir; do
  rm -rf "$dir"
done

# Delete package-lock in sub-directories
find . -type f -name "package-lock.json" -delete
```

### Testing

```bash
# run bruno-schema tests
npm run test --workspace=packages/bruno-schema

# run bruno-query tests
npm run test --workspace=packages/bruno-query

# run bruno-common tests
npm run test --workspace=packages/bruno-common

# run bruno-converters tests
npm run test --workspace=packages/bruno-converters

# run bruno-app tests
npm run test --workspace=packages/bruno-app

# run bruno-electron tests
npm run test --workspace=packages/bruno-electron

# run bruno-lang tests
npm run test --workspace=packages/bruno-lang

# run bruno-toml tests
npm run test --workspace=packages/bruno-toml

# run tests over all workspaces
npm test --workspaces --if-present
```

### Raising Pull Requests

- Please keep the PR's small and focused on one thing
- If a change touches cloud workspace behavior, include the role/import/concurrency implications in the PR description
- Keep user-facing branding as Max; use Bruno/Bru only for upstream compatibility, file formats, package names, or historical attribution
- Please follow the format of creating branches
  - feature/[feature name]: This branch should contain changes for a specific feature
    - Example: feature/dark-mode
  - bugfix/[bug name]: This branch should contain only bug fixes for a specific bug
    - Example bugfix/bug-1
