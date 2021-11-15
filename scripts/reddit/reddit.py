import json
import csv
import time
import os

from psaw import PushshiftAPI


def fetch_reddit_comments(start, end, interval, stocks, subreddits, csv_path='./data/reddit/', fm='w'):
    with open("./scripts/reddit/secret.txt") as f:
        secret_keys = json.load(f)

    api = PushshiftAPI()

    csvfile = open(csv_path+'data2.csv', fm, newline='', buffering=2048)
    writer = csv.writer(csvfile)
    lines_written = 0

    for subreddit in subreddits:
        for stock in stocks:
            curr_time = start
            while curr_time > end:
                comments = []

                # accumulate posts/comments using aliases of the stock
                for ticker_alias in stock:
                    if ticker_alias == 'every-stock-imaginable':
                        comments += list(api.search_comments(subreddit = subreddit,
                                                    before = curr_time,
                                                    after = curr_time-interval,
                                                    filter = ['body'],
                                                    limit=200))
                    else:
                        comments += list(api.search_comments(subreddit = subreddit,
                                                    q = ticker_alias, # only get comments that contain q
                                                    before = curr_time,
                                                    after = curr_time-interval,
                                                    filter = ['body'],
                                                    limit=200))
                
                data = {
                    "stock-ticker" : stock[0],
                    "subreddit" : subreddit,
                    "start-time" : curr_time,
                    "start-epoch-time" : time.strftime('%Y-%m-%d %H:%M:00', time.localtime(curr_time)),
                    "num-comments" : len(comments)
                    }
                writer.writerow([data['stock-ticker'], data['subreddit'],
                                 data['start-time'], data['start-epoch-time'], data['num-comments']])

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

    interval = 60 * 15 # interval is IN SECONDS
    stocks = [['GME'], ['SPY']]
    subreddits = ['wallstreetbets']
    csv_path = './data/reddit/'
    fm = 'w+'

    ############# END PARAMETERS ##############

    # See how long script takes to run
    program_runtime_start = time.time()

    fetch_reddit_comments(start_time, end_end, interval, stocks, subreddits, csv_path, fm)

    print("Program runtime:", time.time() - program_runtime_start)
