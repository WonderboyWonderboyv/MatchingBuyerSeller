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

//  It's assumed that either a min or a max will be surely given for
//  value for min/max budget, min/max bedrooms and min/max bathroom

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
      demand: true
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

//match value calclation function
const calMatchValue = (
  distance_in_miles,
  price,
  min_budget,
  max_budget,
  bedrooms,
  min_bedrooms,
  max_bedrooms,
  bathrooms,
  min_bathrooms,
  max_bathrooms
) => {
  var w = {
    distance: 0,
    price: 0,
    bedrooms: 0,
    bathrooms: 0
  };

  //distance contribution to match calculation
  if (distance_in_miles <= 2) {
    w.distance = 0.3;
  }
  else if (distance_in_miles > 2) {
    w.distance = 0.375 - distance_in_miles * 0.0375;
  }

  //price contribution to match calculation
  if (min_budget && max_budget) {
    if (min_budget <= price &&
      price <= max_budget) {
      w.price = 0.3;
    }
    else if (min_budget > price) {
      w.price =
        (price * 0.3) /
        (min_budget - price * 0.75) -
        (0.3 * price * 0.75) /
        (min_budget - price * 0.75);
    }
    else if (price > max_budget) {
      w.price =
        (0.3 * price * 1.25) /
        (price * 1.25 - max_budget) -
        (0.3 * price) /
        (price * 1.25 - max_budget);
    }
  }
  else if (min_budget || max_budget) {
    if (min_budget) {
      if (min_budget <= price || price * 0.9 <= min_budget) {
        w.price = 0.3;
      }
      else {
        w.price =
          (price * 0.3) /
          (min_budget - price * 0.75) -
          (0.3 * price * 0.75) /
          (min_budget - price * 0.75);
      }
    }
    else if (max_budget) {
      if (price <= max_budget || price *
        1.1 >= max_budget) {
        w.price = 0.3
      }
      else {
        w.price =
          (0.3 * price * 1.25) /
          (price * 1.25 - max_budget) -
          (0.3 * price) /
          (price * 1.25 - max_budget);
      }
    }
  }

  //bedrooms contribution to match calculation
  if (min_bedrooms && max_bedrooms) {
    if (min_bedrooms <= bedrooms &&
      bedrooms <= max_bedrooms) {
      w.bedrooms = 0.2;
    }
    else if (min_bedrooms > bedrooms) {
      w.bedrooms =
        (0.2 * bedrooms) /
        (min_bedrooms - bedrooms - 2) -
        (0.2 * (bedrooms - 2)) /
        (min_bedrooms - bedrooms - 2);
    }
    else if (bedrooms > max_bedrooms) {
      w.bedrooms =
        (0.2 * (bedrooms + 2)) /
        (bedrooms + 2 - max_bedrooms) -
        (0.2 * bedrooms) /
        (bedrooms + 2 - max_bedrooms);
    }
  }
  else if (min_bedrooms || max_bedrooms) {
    if (min_bedrooms && min_bedrooms <= bedrooms) {
      w.bedrooms = 0.2;
    }
    else if (min_bedrooms && min_bedrooms > bedrooms) {
      w.bedrooms =
        (0.2 * bedrooms) /
        (min_bedrooms - bedrooms - 2) -
        (0.2 * (bedrooms - 2)) /
        (min_bedrooms - bedrooms - 2);
    }
    else if (max_bedrooms && bedrooms <= max_bedrooms) {
      w.bedrooms = 0.2;
    }
    else if (max_bedrooms && bedrooms > max_bedrooms) {
      w.bedrooms =
        (0.2 * (bedrooms + 2)) /
        (bedrooms + 2 - max_bedrooms) -
        (0.2 * bedrooms) /
        (bedrooms + 2 - max_bedrooms);
    }
  }

  //bathrooms contribution to match calculation
  if (min_bathrooms && max_bathrooms) {
    if (min_bathrooms <= bathrooms &&
      bathrooms <= max_bathrooms) {
      w.bathrooms = 0.2;
    }
    else if (min_bathrooms > bathrooms) {
      w.bathrooms =
        (0.2 * bathrooms) /
        (min_bathrooms - bathrooms - 2) -
        (0.2 * (bathrooms - 2)) /
        (min_bathrooms - bathrooms - 2);
    }
    else if (bathrooms > max_bathrooms) {
      w.bathrooms =
        (0.2 * (bathrooms + 2)) /
        (bathrooms + 2 - max_bathrooms) -
        (0.2 * bathrooms) /
        (bathrooms + 2 - max_bathrooms);
    }
  }
  else if (min_bathrooms || max_bathrooms) {
    if (min_bathrooms && min_bathrooms <= bathrooms) {
      w.bathrooms = 0.2;
    }
    else if (min_bathrooms && min_bathrooms > bathrooms) {
      w.bathrooms =
        (0.2 * bathrooms) /
        (min_bathrooms - bathrooms - 2) -
        (0.2 * (bathrooms - 2)) /
        (min_bathrooms - bathrooms - 2);
    }
    else if (max_bathrooms && bathrooms <= max_bathrooms) {
      w.bathrooms = 0.2;
    }
    else if (max_bathrooms && bathrooms > max_bathrooms) {
      w.bathrooms =
        (0.2 * (bathrooms + 2)) /
        (bathrooms + 2 - max_bathrooms) -
        (0.2 * bathrooms) /
        (bathrooms + 2 - max_bathrooms);
    }
  }

  const match = w.distance + w.price + w.bedrooms + w.bathrooms;
  return match;
}

//  when a seller wants to sell a property,
//  he will be matched to the buyers whoes 
//  requirements matches with his property attributes.

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
            s.id as id,
            s.min_budget as min_budget,
            s.max_budget as max_budget,
            s.min_bedrooms as min_bedrooms,
            s.max_bedrooms as max_bedrooms,
            s.min_bathrooms as min_bathrooms,
            s.max_bathrooms as max_bathrooms
        FROM
            (SELECT 
                *
            FROM
                requirement
            WHERE
                ((min_budget IS NOT NULL AND ${property.price * 0.75} <= min_budget 
                  AND max_budget IS NOT NULL AND ${property.price * 1.25} >= max_budget)
                  OR (min_budget is NULL AND ${property.price * 1.25} >= max_budget)
                  OR (max_budget is NULL AND ${property.price * 0.75} <= min_budget))
                AND ((min_bedrooms IS NOT NULL AND ${property.bedrooms - 2} <= min_bedrooms 
                  AND max_bedrooms IS NOT NULL AND ${property.bedrooms + 2} >= max_bedrooms) 
                  OR (min_bedrooms is NULL AND ${property.bedrooms + 2} >= max_bedrooms) 
                  OR (max_bedrooms is NULL AND ${property.bedrooms - 2} <= min_bedrooms))
                AND ((min_bathrooms IS NOT NULL AND ${property.bathrooms - 2} <= min_bathrooms 
                  AND max_bathrooms IS NOT NULL AND ${property.bathrooms + 2} >= max_bathrooms) 
                  OR (min_bathrooms is NULL AND ${property.bathrooms + 2} >= max_bathrooms) 
                  OR (max_bathrooms is NULL AND ${property.bathrooms - 2} <= min_bathrooms))) AS s
        HAVING distance_in_miles < 10;`;
    connection.query(sql_search, (err, results, fields) => {
      if (err) throw err;
      results.forEach(result => {
        const match = calMatchValue(
          result.distance_in_miles,
          property.price,
          result.min_budget,
          result.max_budget,
          property.bedrooms,
          result.min_bedrooms,
          result.max_bedrooms,
          property.bathrooms,
          result.min_bathrooms,
          result.max_bathrooms
        );
        if (match >= 0.4) {
          console.log(
            `[Requirement Id]: #${result.id} with   ${(match *
              100).toFixed(2)}% match.`
          );
        }
      });
    });
  });
}

//  when a buyer wants to buy a property,
//  he will be matched to the sellers whoes 
//  properties matches with his search requirement.

if (command == "buy") {
  const requirement = {
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
  connection.query(sql, requirement, (err, rows, fields) => {
    if (err) throw err;
    var sql_search = `SELECT 
            69.04115 * DEGREES(ACOS(COS(RADIANS(p.latitude)) * COS(RADIANS(${requirement.latitude})) * COS(RADIANS(p.longitude) - RADIANS(${requirement.longitude})) + SIN(RADIANS(p.latitude)) * SIN(RADIANS(${requirement.latitude})))) AS distance_in_miles,
            p.id as id,
            p.price as price,
            p.bedrooms as bedrooms,
            p.bathrooms as bathrooms
        FROM
            (SELECT 
                *
            FROM
                property
            WHERE `;
    if (requirement.min_budget && requirement.max_budget) {
      sql_search += `price*0.75 <= ${requirement.min_budget} AND price*1.25 >= ${requirement.max_budget} `;
    }
    else if (requirement.min_budget) {
      sql_search += `price*0.75 <= ${requirement.min_budget} `;
    }
    else if (requirement.max_budget) {
      sql_search += `price*1.25 >= ${requirement.max_budget} `;
    }

    if (requirement.min_bedrooms && requirement.max_bedrooms) {
      sql_search += `AND bedrooms-2 <= ${requirement.min_bedrooms} AND bedrooms+2 >= ${requirement.max_bedrooms} `;
    }
    else if (requirement.min_bedrooms) {
      sql_search += `AND bedrooms-2 <= ${requirement.min_bedrooms} `;
    }
    else if (requirement.max_bedrooms) {
      sql_search += `AND bedrooms+2 >= ${requirement.max_bedrooms} `;
    }

    if (requirement.min_bathrooms && requirement.max_bathrooms) {
      sql_search += `AND bathrooms-2 <= ${requirement.min_bathrooms} AND bathrooms+2 >= ${requirement.max_bathrooms}) `;
    }
    else if (requirement.min_bathrooms) {
      sql_search += `AND bathrooms-2 <= ${requirement.min_bathrooms}) `;
    }
    else if (requirement.max_bedrooms) {
      sql_search += `AND bathrooms+2 >= ${requirement.max_bathrooms}) `;
    }

    sql_search += `AS p HAVING distance_in_miles < 10;`;
    connection.query(sql_search, (err, results, fields) => {
      if (err) throw err;
      results.forEach(result => {
        const match = calMatchValue(
          result.distance_in_miles,
          result.price,
          requirement.min_budget,
          requirement.max_budget,
          result.bedrooms,
          requirement.min_bedrooms,
          requirement.max_bedrooms,
          result.bathrooms,
          requirement.min_bathrooms,
          requirement.max_bathrooms
        );
        if (match >= 0.4) {
          console.log(
            `[Property Id]: #${result.id} with    ${(match *
              100).toFixed(2)}% match.`
          );
        }
      });
      if (!results) {
        console.log("No matches to display.");
      }
    });
  });
}
