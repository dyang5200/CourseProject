# Progress Report (Week 13)

## Progress made thus far

* We have written the code to scrape posts and comments from Reddit
* In our `data/reddit/data.csv` file, we have parsed through the comments for 1 market day (Feb 22, 2021), 1 stock (GME), and 1 subreddit (r/wallstreetbets). We counted the number of comments and put them into 15 minute interval buckets to give an example of the distribution of number of comments throughout a day. Note that we chose a day during the height of the GME craze when wallstreetbets was very active.

## Remaining tasks

* We need to figure out a formula to calculate social media sentiment for a stock
  * It's also important to make sure the formula is sensible so that the user can extract meaning from the sentiment and stock price plots.

* We need to fetch stock price and store that data so that we can graph it

* We need to plot our sentiment data vs. stock price stillmethod to analyze sentiment for the scraped data in a manner that is suitable for our needs
  * We currently plan to graph social media sentiment alongside change in stock price (first derivative stock movement). However, we may wish to change this into something that tells a different narative. For instance, maybe plotting sentiment alongside stock price (instead of change in price) will make for a better visualization.

* (If we have time) Gather twitter data and sentiment

## Any challenges/issues being faced

* (In regards to the first bullet above) We plan to use NLTK Vader for classifying comments as positive or negative, but we still need a formula for "sentiment" for a stock at any given point in time.
  * For starters, we can try a basic formula such as `sentiment = # pos comments / # total comments` for a given time frame (e.g. comments in the last 30 minutes, but this would be prone to very high variance, especially for smaller stocks and time frames.
* We noticed that some stocks and subreddits have periods where not many comments are made. This will make it very hard to create a visually meaningful graph of sentiment and stock price.
  * Solution: We are thinking of limiting our sentiment analysis to popular stock tickers (e.g. SPY, TSLA, GME).
* Gathering sentiment/stock data in real time can be slow due to API limitations
  * Solution: We will have to get the data and perform analysis ahead of time and store it locally or on a server to be accessed at runtime.
