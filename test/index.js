/* eslint-disable no-console */
const { EOL } = require('os');
const path = require('path');
const fs = require('fs');
const { Harness, Suite, SpecReporter } = require('zunit');

const pkg = require(path.join(process.cwd(), 'package.json'));

const yup = require('yup');
const yupByExample = require('../src');

yup.addMethod(yup.Schema, 'example', yupByExample);

const config = getConfig();

loadRequiredModules().then(() => {
  const options = getDiscoveryOptions();
  new Suite(config.name).discover(options).then((suite) => {
    const harness = new Harness(suite);

    const interactive = String(process.env.CI).toLowerCase() !== 'true';
    const reporter = new SpecReporter({ colours: interactive });

    harness.run(reporter).then((report) => {
      if (report.failed) process.exit(1);
      if (report.incomplete) {
        console.log(`One or more tests were not run!${EOL}`);
        process.exit(2);
      }
      if (config.exit) process.exit();
    });
  });
});

function getConfig() {
  return { name: pkg.name, require: [], ...loadConfigFromPackageJson(), ...loadConfigFromDefaultLocations(), ...loadConfigFromSpecifiedLocation(process.argv[2]) };
}

function loadConfigFromSpecifiedLocation(configPath) {
  return configPath && require(path.resolve(configPath));
}

function loadConfigFromDefaultLocations() {
  return ['.zUnit.json', '.zUnit.js']
    .map((candidate) => {
      const configPath = path.resolve(candidate);
      return fs.existsSync(configPath) && require(configPath);
    })
    .find(Boolean);
}

function loadConfigFromPackageJson() {
  return pkg.zUnit;
}

function getDiscoveryOptions() {
  const options = {};
  if (config.directory) Object.assign(options, { directory: path.resolve(config.directory) });
  if (config.pattern) Object.assign(options, { pattern: new RegExp(config.pattern) });
  return options;
}

async function loadRequiredModules() {
  return config.require.reduce(async (p, modulePath) => {
    await p;
    return import(path.resolve(modulePath));
  }, Promise.resolve());
}
