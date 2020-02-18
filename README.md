# MatchingBuyerSeller
Matches the seller with buyers and vice-versa

1. Clone this repo to get started:

```
git clone https://github.com/WonderboyWonderboyv/MatchingBuyerSeller.git
```

2. Create a mysql databse with below configuration: 
```
{
  host: "localhost",
  user: "root",
  password: "password",
  database: "dev"
}
```

3. Create two tables with name property(id, latitude, longitude, price, budget, bedrooms, bathrooms) 
and requirement(id, latitude, longitude, min_budget, max_budget, min_bedrooms, max_bedrooms, min_bathrooms, max_bathrooms)


4. Install npm packages required:

```
npm i 
```

5 . 2 commands: buy and sell

  Example: To sell a property and find valid buyers:

```
node app.js buy --latitude "18.568860" --longitude "73.919550" --min_budget "90" --max_budget "100" --min_bedrooms "1" --max_bedrooms "3" --min_bathrooms "1" --max_bathrooms "3"
``` 
  Example: To add a requirement and find valid sellers:
  
```
node app.js sell --latitude "18.52043" --longitude "73.856743" --price "100" --bedrooms "2" --bathrooms "2"
```
