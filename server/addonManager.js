const fs = require('fs');
const path = require('path');

class AddonManager {
    constructor(app, dbConnection) {
        this.app = app;
        this.db = dbConnection;
        this.addonDir = path.join(__dirname, 'addons');
    }

    loadAllAddons(dbConnection, router) {
        return new Promise((resolve, reject) => {
            fs.readdir(this.addonDir, async (err, files) => {
                if (err) {
                    reject('Could not list the directory. ' + err?.message);
                    return;
                }

                for (const file of files) {
                    const addonPath = path.join(this.addonDir, file);
                    const Addon = await require(addonPath);
                    const addonInstance = new Addon(this.app, this.db);
                    await addonInstance.init();
                    await addonInstance.register(router);
                    console.log(`🔌 Loaded addon: ${file}`);
                }
                resolve(router);
            });
        })
    }
}

module.exports = AddonManager;