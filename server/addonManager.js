const fs = require('fs');
const path = require('path');

class AddonManager {
    constructor(app, dbConnection) {
        this.app = app;
        this.db = dbConnection;
        this.addonDir = path.join(__dirname, 'addons');
    }

    loadAllAddons(db, router) {
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
                    // 
                    if (addonInstance.get_tables_schemas) {
                        await this.install_tables(addonInstance.get_tables_schemas());
                    }
                    // 
                    await addonInstance.register(router);
                    // console.log(`🔌 Loaded addon: ${file}`);
                }
                resolve(router);
            });
        })
    }

    install_tables(tables) {
        Object.keys(tables).forEach((table) => {
            // if (table == 'users') {
            //     console.log('Table of Users creating ✅✅', tables[table])
            // }
            this.db.query(tables[table], (err) => {
                if (err) {
                    console.error(`Error creating ${table} table: `, err);
                } else {
                    // console.log(`${table} table created or exists already.`);
                }
            });
        });
    }
}

module.exports = AddonManager;