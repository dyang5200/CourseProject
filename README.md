# Spicy Chicken Stock

Please open `project-report.md` to see our Week 13 Project Report.
`Presentation Slides.pdf` contains a copy of the slide deck used in the final presentation video.

## Partner Contributions

Eric - Gathered Reddit comments using PushShift API and used NLP Vader to analyze sentiment.

Sabelle - Presentation, Website design, D3 graph code.

Danielle - Gathered stock pricing data using the InteractiveBroker TWS API. 

## Presentation

[Click here to see our presentation for this project.](https://youtu.be/BuUNq5WAf_0)

## How to Run the Website

To launch our website, you need to host this directory on a local webserver. If you do not, then the javascript and website will not work as intended.

The easiest way to do this would be to open this code as folder in Visual Studio Code, and use the "Live Server" extension (by clicking "Go Live" in the bottom right) to host the website locally.

## Documentation

### Generating new Reddit Sentiment Data

Navigate to the `scripts/reddit` folder and run `reddit.py` using Python in the terminal to generate sentiment analysis for the given parameters:

### Generating new Stock Price Data

Run `data_download.ipynb`. In order for this to work properly, you must have an Interactive Brokers account with Level 2 Market Data enabled (required to get historical stock data), and you must download and run IB TWS with the ActiveX and DirectSocket settings enabled.

![Chicken Stock :)](https://i.pinimg.com/564x/12/b1/44/12b14490da94cc1cc3dd46a1f0014709.jpg)
