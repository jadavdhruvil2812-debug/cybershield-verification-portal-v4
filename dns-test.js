const dns = require("dns");

dns.resolveSrv("_mongodb._tcp.cybershield-admin.qlx6dmr.mongodb.net", (err, records) => {
    console.log("Error:");
    console.log(err);

    console.log("\nRecords:");
    console.log(records);
});
