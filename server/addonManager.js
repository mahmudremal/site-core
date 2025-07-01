const fs = require('fs');
const path = require('path');

class AddonManager {
    constructor(app, dbConnection) {
        this.app = app;
        this.db = dbConnection;
        this.addonDir = path.join(__dirname, 'addons');
    }

    loadAllAddons(dbConnection) {
        fs.readdir(this.addonDir, (err, files) => {
            if (err) {
                console.error('Could not list the directory.', err);
                return;
            }

            files.forEach((file) => {
                const addonPath = path.join(this.addonDir, file);
                const Addon = require(addonPath);
                const addonInstance = new Addon(this.app, this.db);
                addonInstance.init();
                addonInstance.register();
                console.log(`Loaded addon: ${file}`);
            });
        });
    }
}

module.exports = AddonManager;