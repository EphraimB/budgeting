# Budgeting app - Prototype 2

## Prototype history

### Prototype 1

My first attempt at a budgeting app. I wasn't that knowledgable and was written in php. Although very buggy, I hosted it on a website where it automatically adjusted the balance when the transaction date came and even synced with Google Sheets. But then as the months went by, things began to break and wasn't even done efficiently.

### Prototype 2

My second attempt at a budgeting app. This time written in ExpressJS and NextJS. I spent years and counting on it tirelessly and is much more stable (but still not as stable as I want it) than prototype 1. It even has a full blown api and fully unit tested. I still have a lot of features I want to do like finish commute expenses, food expenses, utility bills, plugins that can automatically add information to the budgeting app and sync with an online spreadsheet like Google Sheets.

### Future prototypes

Maybe future prototypes will be written in Rust (hopefully!). Hopefully I can get the word on my budgeting app spread out and make a whole business out of it where I can get a whole team to work on it. Some goals would be probabilities where there can be different probbilities based on habits and accidents in life. Another feature I would want in future prototypes would be what-ifs that I can quickly find out what would happen if I cut, for example, coffee (or drink 1 less cup of it), how much money I would save per year or if I can afford soemthing if I get myself a second job.

## Purpose of this budgeting app

The purpose of this budgeting app is to predict how much money you will have at a future date.

## How the budgeting app works

The budgeting app works by opening up an account (no real bank accounts involved as everything is done locally). You can then make deposits and withdrawals the the $0.00 balance. The magic happens when you add your inputs like your expenses (ex. rent), your loans, your job information, and other scenarios. When you go back to the main transactions page, it uses the information you inputted to generate your projected transactions in the future. You can enter any date range for any account. You can even put in your wishlist items so that you can know the earliest time that you can buy that wishlist item. You can even transfer between accounts. A bonus feature is that if the budgeting app gets hosted, it can run cron jobs to automatically adjust the balance on the date of a transaction.

## Why I created the budgeting app

I have trouble making decisions with budgeting and keep making impulsive purchases. I want an idea of what the future would be like money-wise. I wanted a way that I can input all my expenses and incomes and automatically visualise my future transactions.

## My goal on the budgeting app

I've been working on the budgeting app for a couple of years and trying to work on as many scenarios as possible. I want it at some point to automatically upload a budgeting scrapbook to Google Sheets via plugins. It would be very fancy and have a lot of tabs including an overview tab with charts and a tab per month (previous and future transactions). I also want to complete commute expenses where it takes into account you're commuting information. Another future goal is food expenses where it will take into account your groceries, recipes, and even cooking (for an even future plan of an electricity bill). My goal is to host it on a website put in my inputs and sit back and relax as it tries to simulate my real bank account as accurately as possible while being agnostic to it.

## How to setup the budgeting app locally

Download Docker Desktop from [here](https://www.docker.com/products/docker-desktop/) for your specific platform. Clone this repository. Make a .env file and type the following in:

```
PGDB=budgeting
PGUSER=[The database user]
PGPASSWORD=[The database password]
PGHOST=db
PGPORT=[The database port]
```

Save the .env file.

In your terminal, type

```
docker compose build
docker compose up
```

The user interface for the budgeting app is at (http://localhost:3000) while the backend swagger docs is at (http://localhost:5001).

You can also access the postgres database with a client at (http://localhost:5432).
