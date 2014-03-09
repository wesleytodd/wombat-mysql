// Requirements
var util = require('util'),
	_ = require('lodash');

module.exports = function(wombat) {

	var MySQL = function(conf) {
		// Merge options
		this.options = _.extend({}, MySQL.defaultOptions, conf);

		// Extends service and package
		wombat.Service.call(this, 'mysql');
		wombat.Package.call(this, util.format('mysql-server-%s', this.options.version), {
			'php5-mysql': !!this.options.php
		});
	};
	util.inherits(MySQL, wombat.Service);
	util.inherits(MySQL, wombat.Package);

	// Defaults
	MySQL.defaultOptions = {
		version: '5.5',
		rootPassword: '',
		php: false,
	};

	// Install the package
	MySQL.prototype.install = function(done) {

		// Configure the password
		wombat.exec.file(path.join(__dirname, 'scripts', 'debian.sh'), [this.options.rootPassword], function(err) {
			if (err) {
				return done(err);
			}

			wombat.Package.prototype.install.call(this, function(err) {
				// Fail on error
				if (err) {
					wombat.logger.log('error', 'Failed to install MySQL', err);
					return done(err);
				}

				// Successfully completed
				wombat.logger.log('info', 'MySQL Installed.');
				done();
			});

		}.bind(this));

		// Chainable
		return this;
	};

	// Main run function
	MySQL.prototype.ensureInstalled = function(done) {

		// Check if it is installed
		this.isInstalled(function(installed) {
			// If not, install it
			if (!installed) {
				this.install(function(err) {
					if (typeof done == 'function') {
						done(err);
					}
				});
			} else {
				done();
			}
		}.bind(this));

		// Chainable
		return this;
	};

	// Return a new instance of this plugin
	return MySQL;
};
