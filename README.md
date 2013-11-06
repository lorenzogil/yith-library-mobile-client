# Yith Library Mobile App

## Getting started

This project uses [Grunt](http://www.gruntjs.com) for automation. Custom
tasks can be added to `Gruntfile.js`. Here are some examples:

**Run the tests**:

```bash
$ grunt test
```

**Launch a local server** so you can try the app in a desktop browser:

```bash
$ grunt server
```

**Deploy the app to the phone for the first time**:

```bash
$ grunt push
$ grunt reset
```

**Subsequent deploys to the phone**:

```bash
$ grunt push
```

## Grunt tasks

### Run JSHint

[JSHint](http://www.jshint.com) is a JavaScript linter that will not
only spot syntactic errors, but will also warn you about bad practises
or wrong style conventions.

You can edit the file `.jshintrc` to setup your own rules. Some rules
that have been included in this file are:

- Maximum line length of 80 characters.
- 2-space indentation, with white spaces.
- Forbid use of undeclared vars.
- Enforce camel case naming convention.
- Etc.

You can run JSHint on all JavaScript files in `scripts` (and
subdirectories) with:

```bash
$ grunt jshint
```

**Note**: Sometimes you will need to include 3rd-party code that do not
comform to these rules. If you put your 3rd-party (or legacy) code in
the `scripts/vendor` directory, it will be ignored by JSHint.

### Launch a server

You can launch a HTTP server, with `/` pointing at the app's `build`
directory.

```bash
$ grunt server
```

This task will:

  - Clean temporary directories
  - Run JSHint.
  - Compile SASS files.
  - Minify all Gaia's Building Blocks in one single CSS file'.
  - Build the app into `build`.
  - Run a server in [0.0.0.0:9000](http://0.0.0.0:9000)
  - Watch for changes in Sass, HTML and JavaScript files and copy
    them in the `build` directory.

### Build the app

Building the app compiles and copies all the relevant app files to
a `build` directory. You can then run a server from there, or zip the
app.

This task will:

- Run JSHint.
- Clean build temporary files.
- Compile SASS files.
- Minify all Gaia's Building Blocks in one single CSS file'.
- Copy all the app files to `build`


### Zip a release

The way to distribute a packaged Firefox OS app is to get a zip file
with the build. You can do this with the `release` task.

```bash
$ grunt release
```

This task will:

- Delete any previous release's zip.
- Build the app.
- Zip an `application.zip` file with the `build` directory.

### Firefox OS tasks

There are several tasks to manage the Firefox OS device. You will need
**to enable the `Remote debugging`** option in your phone to use these
tasks. You can do this in the `Settings` app and then: `Device
information > More Information > Developer`.

#### Install the app

This will:

- Build a release in `application.zip`
- Push `applicatin.zip` to the phone
- Reset the B2G process

```bash
$ grunt push
```

A prompt will appear in your phone asking if you want to establish
a connection. **Your phone will need to be unlocked** for this to show
up.

**NOTE:** When you install the app for the first time, you will need to
do a B2G reset for it to appear in the homescreen.

```bash
$ grunt push
$ grunt reset
```

#### Reboot B2G

When things go wrong, you might need to reboot the Boot2Gecko process:

```bash
$ grunt reset
```

#### Output the log

This will output the device's log into the console:

```bash
$ grunt log
```

### Clean temporary files

Some tasks create temporary directories or minified files. These are:

- `app/.tmp`
- `build`
- `app/styles/gaiabb/all.css`
- `application.zip`

You can wipe them out with:

```bash
$ grunt clean
```

Note that this will also delete Sass' cache files, that are being stored
in `app/.tmp`.

### Run tests

Test use [Mocha](http://visionmedia.github.io/mocha/) as spec-based
framework, [Sinon](http://www.sinonjs.org) to create mocks and stubs,
and [Chai](http://www.chaijs.com/) for the expectations.

You can run tests in the shell with:

```bash
$ grunt test
```

This will use PhantomJS as web browser, which is webkit-based. You
probably want to run your tests in a Firefox Nightly browser with:

```bash
$ grunt server:test
```

This will start a web server in [0.0.0.0:9002](0.0.0.0:9002) with your
test suite loaded in `/`.

