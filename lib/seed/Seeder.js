// Seeder
// -------

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const mkdirp = require('mkdirp');
const Bluebird = require('bluebird');
const { filter, includes, template, extend } = require('lodash');

// The new seeds we're performing, typically called from the `knex.seed`
// interface on the main `knex` object. Passes the `knex` instance performing
// the seeds.
function Seeder(knex) {
  this.knex = knex;
  this.config = this.setConfig(knex.client.config.seeds);
}

// Runs seed files for the given environment.
Seeder.prototype.run = async function(config) {
  this.config = this.setConfig(config);
  return this._listAll().then((all) => {
    const files =
      config && config.specific
        ? all.filter((file) => file === config.specific)
        : all;

    return this._runSeeds(files);
  });
};

// Creates a new seed file, with a given name.
Seeder.prototype.make = function(name, config) {
  this.config = this.setConfig(config);
  if (!name)
    Bluebird.rejected(
      new Error('A name must be specified for the generated seed')
    );
  return Bluebird.resolve(
    this._ensureFolder(config)
      .then(() => this._generateStubTemplate())
      .then((tmpl) => this._writeNewSeed(name)(tmpl))
  );
};

// Lists all available seed files as a sorted array.
Seeder.prototype._listAll = async function(config) {
  this.config = this.setConfig(config);
  const loadExtensions = this.config.loadExtensions;
  return promisify(fs.readdir)(this._absoluteConfigDir()).then((seeds) =>
    filter(seeds, function(value) {
      const extension = path.extname(value);
      return includes(loadExtensions, extension);
    }).sort()
  );
};

// Gets the seed file list from the specified seed directory.
Seeder.prototype._seedData = function() {
  return Bluebird.join(this._listAll());
};

// Ensures a folder for the seeds exist, dependent on the
// seed config settings.
Seeder.prototype._ensureFolder = async function() {
  const dir = this._absoluteConfigDir();
  try {
    await promisify(fs.stat)(dir);
  } catch (e) {
    await promisify(mkdirp)(dir);
  }
};

// Run seed files, in sequence.
Seeder.prototype._runSeeds = function(seeds) {
  seeds.forEach((seed) => this._validateSeedStructure(seed));
  return this._waterfallBatch(seeds);
};

// Validates seed files by requiring and checking for a `seed` function.
Seeder.prototype._validateSeedStructure = function(name) {
  const seed = require(path.join(this._absoluteConfigDir(), name));
  if (typeof seed.seed !== 'function') {
    throw new Error(`Invalid seed file: ${name} must have a seed function`);
  }
  return name;
};

// Generates the stub template for the current seed file, returning a compiled template.
Seeder.prototype._generateStubTemplate = function() {
  const stubPath =
    this.config.stub ||
    path.join(__dirname, 'stub', this.config.extension + '.stub');
  return promisify(fs.readFile)(stubPath).then((stub) =>
    template(stub.toString(), { variable: 'd' })
  );
};

// Write a new seed to disk, using the config and generated filename,
// passing any `variables` given in the config to the template.
Seeder.prototype._writeNewSeed = function(name) {
  const { config } = this;
  const dir = this._absoluteConfigDir();
  return async function(tmpl) {
    if (name[0] === '-') name = name.slice(1);
    const filename = name + '.' + config.extension;
    await promisify(fs.writeFile)(
      path.join(dir, filename),
      tmpl(config.variables || {})
    );
    return path.join(dir, filename);
  };
};

// Runs a batch of seed files.
Seeder.prototype._waterfallBatch = async function(seeds) {
  const { knex } = this;
  const seedDirectory = this._absoluteConfigDir();
  const log = [];
  for (const seedName of seeds) {
    const seedPath = path.join(seedDirectory, seedName);
    const seed = require(seedPath);
    try {
      await seed.seed(knex);
      log.push(seedPath);
    } catch (originalError) {
      const error = new Error(
        `Error while executing "${seedPath}" seed: ${originalError.message}`
      );
      error.original = originalError;
      error.stack =
        error.stack
          .split('\n')
          .slice(0, 2)
          .join('\n') +
        '\n' +
        originalError.stack;
      throw error;
    }
  }
  return [log];
};

Seeder.prototype._absoluteConfigDir = function() {
  return path.resolve(process.cwd(), this.config.directory);
};

Seeder.prototype.setConfig = function(config) {
  return extend(
    {
      extension: 'js',
      directory: './seeds',
      loadExtensions: [
        '.co',
        '.coffee',
        '.eg',
        '.iced',
        '.js',
        '.litcoffee',
        '.ls',
        '.ts',
      ],
    },
    this.config || {},
    config
  );
};

module.exports = Seeder;
