import json
import csv
import time
import os
import random

from psaw import PushshiftAPI
from nltk.sentiment.vader import SentimentIntensityAnalyzer as SIA

def fetch_reddit_comments(start, end, interval, stocks, subreddits, csv_path='./data/reddit/', fm='w'):
    """
    Run this function to generate a .csv file in the specified path. The file will filter the given subreddits
    for comments that include the relevant stock tickers. It will then perform sentiment
    analysis to classify each comment as negative or positive.

    It is important to note that this script goes searches backwards in time, so start should be a later date than end.

    You can also specify write or append mode for writing the data file.
    """

    with open("./scripts/reddit/secret.txt") as f:
        secret_keys = json.load(f)  

    api = PushshiftAPI()

    # Sentiment Intensity Analyser
    sia = SIA()

    csvfile = open(csv_path+'reddit-data.csv', fm, newline='', buffering=2048)
    writer = csv.writer(csvfile)
    lines_written = 0

    for subreddit in subreddits:
        for stock in stocks:
            curr_time = start
            while curr_time > end:
                comments = []

                # accumulate posts/comments using aliases of the stock
                for ticker_nickname in stock:
                    if ticker_nickname == 'every-stock-imaginable':
                        # get every comment
                        comments += list(api.search_comments(subreddit = subreddit,
                                                    before = curr_time,
                                                    after = curr_time-interval,
                                                    filter = ['body'],
                                                    limit=200))
                    else:
                         # only get comments that contain q (query) == ticker_nickname
                        comments += list(api.search_comments(subreddit = subreddit,
                                                    q = ticker_nickname,
                                                    before = curr_time,
                                                    after = curr_time-interval,
                                                    filter = ['body'],
                                                    limit=200))
                
                # SENTIMENT ANALYSIS 
                positive_count = 0
                neutral_count = 0
                negative_count = 0
                threshold = 0.35
                
                for comment in comments:
                    print(comment)
                    pscore = sia.polarity_scores(comment[0])
                    if pscore['compound'] > threshold:
                        positive_count += 1
                        print("Positive comment")
                    elif pscore['compound'] < -1*threshold:
                        negative_count += 1
                        print("Negative comment")
                    else:
                        neutral_count += 1
                        print("Neutral comment")
                
                # WRITING TO CSV FILE
                data = {
                    "stock-ticker" : stock[0],
                    "subreddit" : subreddit,
                    "start-time" : curr_time,
                    "start-epoch-time" : time.strftime('%Y-%m-%d %H:%M:00', time.localtime(curr_time)),
                    "positive-comments" : positive_count,
                    "neutral-comments" : neutral_count,
                    "negative-comments" : negative_count
                    }
                
                writer.writerow([data['stock-ticker'], data['subreddit'],
                                 data['start-time'], data['start-epoch-time'],
                                 data['positive-comments'], data['neutral-comments'], data['negative-comments']])

                curr_time -= interval
                lines_written += 1

                print("Lines written:", lines_written)
                print(data)

    csvfile.close()

if __name__ == "__main__":
    os.environ['TZ'] = 'CST'

    ############ SCRIPT PARAMETERS ############

    # Note: Script runs for 34 seconds for 1 stock, 1 subreddit, 15 minute intervals, 1 day time frame. 

    # The PSAW api uses unix time, which is calculated below given epoch time
    # IMPORTANT: Script goes backwards in time, so start_time should be later than end_time
    pattern = '%d.%m.%Y %H:%M:%S'
    start_time = int(time.mktime(time.strptime('22.02.2021 14:00:00', pattern))) # 2:00pm CST, 2/22/2021
    end_end = int(time.mktime(time.strptime('22.02.2021 9:30:00' , pattern))) # 9:30am CST, 2/22/2021

    interval = 10 * 15 # in seconds

    # search parameters are not case sensitive
    stocks = [['GME'], ['SPY'], ['TSLA'], ['AAPL']]
    subreddits = ['wallstreetbets', 'stocks']

    csv_path = './data/reddit/'
    fm = 'w+'

    ############# END PARAMETERS ##############

    # See how long script takes to run
    program_runtime_start = time.time()

    fetch_reddit_comments(start_time, end_end, interval, stocks, subreddits, csv_path, fm)

    print("Program runtime:", time.time() - program_runtime_start)
