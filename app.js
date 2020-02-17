const mysql = require("mysql2");
const yargs = require("yargs");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "dev"
});

connection.connect(err => {
  if (err) throw err;
  console.log("Connected!");
});

const argv = yargs
  .command("sell", "Add the details of the property", {
    latitude: {
      describe: "latitude of the property",
      demand: true
    },
    longitude: {
      describe: "longitude of the property",
      demand: true
    },
    price: {
      describe: "price of the property",
      demand: true
    },
    bedrooms: {
      describe: "number of bedrooms of the property",
      demand: true,
      alias: "bd"
    },
    bathrooms: {
      describe: "number of bathrooms of the property",
      demand: true
    }
  })
  .command("buy", "Add details of search requirement", {
    latitude: {
      describe: "latitude of the search requirement",
      demand: true
    },
    longitude: {
      describe: "latitude of the search requirement",
      demand: true
    },
    min_budget: {
      describe: "min buget of the search requirement"
    },
    max_budget: {
      describe: "max buget of the search requirement"
    },
    min_bedrooms: {
      describe: "min bedrooms of the search requirement"
    },
    max_bedrooms: {
      describe: "max bedrooms of the search requirement"
    },
    min_bathrooms: {
      describe: "min bathrooms of the search requirement"
    },
    max_bathrooms: {
      describe: "max bathrooms of the search requirement"
    }
  })
  .help()
  .alias("h", "help").argv;
var command = process.argv[2];

if (command == "sell") {
  const property = {
    latitude: argv.latitude,
    longitude: argv.longitude,
    price: argv.price,
    bedrooms: argv.bedrooms,
    bathrooms: argv.bathrooms
  };
  const sql = "INSERT into dev.property SET ?;";
  connection.query(sql, property, (err, rows, fields) => {
    if (err) throw err;
    const sql_search = `SELECT 
            69.04115 * DEGREES(ACOS(COS(RADIANS(s.latitude)) * COS(RADIANS(${
      property.latitude
      })) * COS(RADIANS(s.longitude) - RADIANS(${
      property.longitude
      })) + SIN(RADIANS(s.latitude)) * SIN(RADIANS(${
      property.latitude
      })))) AS distance_in_miles,
            s.id as search_id,
            s.min_budget as search_min_budget,
            s.max_budget as search_max_budget,
            s.min_bedrooms as search_min_bedrooms,
            s.max_bedrooms as search_max_bedrooms,
            s.min_bathrooms as search_min_bathrooms,
            s.max_bathrooms as search_max_bathrooms
        FROM
            (SELECT 
                *
            FROM
                requirement
            WHERE
                ${property.price * 0.75} <= min_budget AND ${property.price *
      1.25} >= max_budget
                    AND ${property.bedrooms -
      2} <= min_bedrooms AND ${property.bedrooms +
      2} >= max_bedrooms
                    AND ${property.bathrooms -
      2} <= min_bathrooms AND ${property.bathrooms +
      2} >= max_bathrooms) AS s
        HAVING distance_in_miles < 10;`;
    connection.query(sql_search, (err, results, fields) => {
      if (err) throw err;
      results.forEach(result => {
        var w = {
          distance: null,
          price: null,
          bedrooms: null,
          bathrooms: null
        };

        if (result.distance_in_miles <= 2) {
          w.distance = 0.3;
        }
        if (result.distance_in_miles > 2) {
          w.distance = 0.375 - result.distance_in_miles * 0.0375;
        }
        if (
          result.min_budget <= property.price &&
          property.price <= result.max_budget
        ) {
          w.price = 0.3;
        }
        if (result.min_budget >= property.price) {
          w.price =
            (property.price * 0.3) /
            (result.min_budget - property.price * 0.75) -
            (0.3 * property.price * 0.75) /
            (result.min_budget - property.price * 0.75);
        }
        if (property.price >= result.max_budget) {
          w.price =
            (0.3 * property.price * 1.25) /
            (property.price * 1.25 - result.max_budget) -
            (0.3 * property.price) /
            (property.price * 1.25 - result.max_budget);
        }
        if (
          result.min_bedrooms <= property.bedrooms &&
          property.bedrooms <= result.max_bedrooms
        ) {
          w.bedrooms = 0.2;
        }
        if (result.min_bedrooms >= property.bedrooms) {
          w.bedrooms =
            (0.2 * property.bedrooms) /
            (result.min_bedrooms - property.bedrooms - 2) -
            (0.2 * (property.bedrooms - 2)) /
            (result.min_bedrooms - property.bedrooms - 2);
        }
        if (property.bedrooms >= result.max_bedrooms) {
          w.bedrooms =
            (0.2 * (property.bedrooms + 2)) /
            (property.bedrooms + 2 - result.max_bedrooms) -
            (0.2 * property.bedrooms) /
            (property.bedrooms + 2 - result.max_bedrooms);
        }
        if (
          result.min_bathrooms <= property.bathrooms &&
          property.bathrooms <= result.max_bathrooms
        ) {
          w.bathrooms = 0.2;
        }
        if (result.min_bathrooms >= property.bathrooms) {
          w.bathrooms =
            (0.2 * property.bathrooms) /
            (result.min_bathrooms - property.bathrooms - 2) -
            (0.2 * (property.bathrooms - 2)) /
            (result.min_bathrooms - property.bathrooms - 2);
        }
        if (property.bathrooms >= result.max_bathrooms) {
          w.bathrooms =
            (0.2 * (property.bathrooms + 2)) /
            (property.bathrooms + 2 - result.max_bathrooms) -
            (0.2 * property.bathrooms) /
            (property.bathrooms + 2 - result.max_bathrooms);
        }

        const match = w.distance + w.price + w.bedrooms + w.bathrooms;
        if (match >= 0.4) {
          console.log(
            `[Requirement Id]: #${result.search_id} with ---${match *
            100}% match---.`
          );
        }
      });
    });
  });
}

if (command == "buy") {
  const search_requirement = {
    latitude: argv.latitude,
    longitude: argv.longitude,
    min_budget: argv.min_budget,
    max_budget: argv.max_budget,
    min_bedrooms: argv.min_bedrooms,
    max_bedrooms: argv.max_bedrooms,
    min_bathrooms: argv.min_bathrooms,
    max_bathrooms: argv.max_bathrooms
  };
  const sql = "INSERT into dev.requirement SET ?;";
  connection.query(sql, search_requirement, (err, rows, fields) => {
    if (err) throw err;
    const sql_search = `SELECT 
            69.04115 * DEGREES(ACOS(COS(RADIANS(p.latitude)) * COS(RADIANS(${search_requirement.latitude})) * COS(RADIANS(p.longitude) - RADIANS(${search_requirement.longitude})) + SIN(RADIANS(p.latitude)) * SIN(RADIANS(${search_requirement.latitude})))) AS distance_in_miles,
            p.id as property_id,
            p.price as property_price,
            p.bedrooms as property_bedrooms,
            p.bathrooms as property_bathrooms
        FROM
            (SELECT 
                *
            FROM
                property
            WHERE
                price*0.75 <= ${search_requirement.min_budget} AND price*1.25 >= ${search_requirement.max_budget}
                    AND bedrooms-2 <= ${search_requirement.min_bedrooms} AND bedrooms+2 >= ${search_requirement.max_bedrooms}
                    AND bathrooms-2 <= ${search_requirement.min_bathrooms} AND bathrooms+2 >=${search_requirement.max_bathrooms}) AS p
        HAVING distance_in_miles < 10;`;
    connection.query(sql_search, (err, results, fields) => {
      if (err) throw err;
      results.forEach(result => {
        var w = {
          distance: null,
          price: null,
          bedrooms: null,
          bathrooms: null
        };

        if (result.distance_in_miles <= 2) {
          w.distance = 0.3;
        }
        if (result.distance_in_miles > 2) {
          w.distance = 0.375 - result.distance_in_miles * 0.0375;
        }
        if (
          search_requirement.min_budget <= result.price &&
          result.price <= search_requirement.max_budget
        ) {
          w.price = 0.3;
        }
        if (search_requirement.min_budget >= result.price) {
          w.price =
            (result.price * 0.3) /
            (search_requirement.min_budget - result.price * 0.75) -
            (0.3 * result.price * 0.75) /
            (search_requirement.min_budget - result.price * 0.75);
        }
        if (result.price >= search_requirement.max_budget) {
          w.price =
            (0.3 * result.price * 1.25) /
            (result.price * 1.25 - search_requirement.max_budget) -
            (0.3 * result.price) /
            (result.price * 1.25 - search_requirement.max_budget);
        }
        if (
          search_requirement.min_bedrooms <= result.bedrooms &&
          result.bedrooms <= search_requirement.max_bedrooms
        ) {
          w.bedrooms = 0.2;
        }
        if (search_requirement.min_bedrooms >= result.bedrooms) {
          w.bedrooms =
            (0.2 * result.bedrooms) /
            (search_requirement.min_bedrooms - result.bedrooms - 2) -
            (0.2 * (result.bedrooms - 2)) /
            (search_requirement.min_bedrooms - result.bedrooms - 2);
        }
        if (result.bedrooms >= search_requirement.max_bedrooms) {
          w.bedrooms =
            (0.2 * (result.bedrooms + 2)) /
            (result.bedrooms + 2 - search_requirement.max_bedrooms) -
            (0.2 * result.bedrooms) /
            (result.bedrooms + 2 - search_requirement.max_bedrooms);
        }
        if (
          search_requirement.min_bathrooms <= result.bathrooms &&
          result.bathrooms <= search_requirement.max_bathrooms
        ) {
          w.bathrooms = 0.2;
        }
        if (search_requirement.min_bathrooms >= result.bathrooms) {
          w.bathrooms =
            (0.2 * result.bathrooms) /
            (search_requirement.min_bathrooms - result.bathrooms - 2) -
            (0.2 * (result.bathrooms - 2)) /
            (search_requirement.min_bathrooms - result.bathrooms - 2);
        }
        if (result.bathrooms >= search_requirement.max_bathrooms) {
          w.bathrooms =
            (0.2 * (result.bathrooms + 2)) /
            (result.bathrooms + 2 - search_requirement.max_bathrooms) -
            (0.2 * result.bathrooms) /
            (result.bathrooms + 2 - search_requirement.max_bathrooms);
        }

        const match = w.distance + w.price + w.bedrooms + w.bathrooms;
        if (match >= 0.4) {
          console.log(
            `[Property Id]: #${result.property_id} with ---${match *
            100}% match---.`
          );
        }
      });
    });
  });
}
