# Seattle Vipassana Hall Financials Chart

## Overview

The purpose of this project is to have a nice, clean SVG image that can be printed & displayed in the lobby of Seattle Vipassana Hall, as well as included in quarterly reports to the Dhamma Kunja Trust. I created it originally because, incredibly, charts created in Google Sheets can only be exported as low-res jpgs that look like hot garbage when printed to paper. Obviously this irked me: Not an equanimous reaction, true, but it's a problem I can actually fix so I went with it.

## Structure

My goal has been to keep this simple enough so that I can, someday, hand it off to another volunteer. Bearing in mind that this person is likely to have limited time & technical expertise, they should be able to create new charts with updated data, and make simple edits to the chart layout. 

Many of the parameters that define the appearance & layout of the chart are defined near the top of the "svhChart.js" file, in the "p" parameters object literal. Not everything can be adjusted through these parameters, but I tried to make it as flexible as I could. This is also where you'll find the link to the "Monthly Summaries" tab of our "SVH Ledger 2016+" spreadsheet, as well as cell ranges containing data. 

The API key is restricted to Sheets in the svhbookkeeper@gmail.com account. Ideally it would be kept secret, but the only practical alternative to hard-coding it in the client is to have a server-side component of the app that forwards the request. I don't think it's worth it. Worst case scenario, someone uses it to exceed our query limit for the Sheets API; I can't imagine why anyone would want to do this, and it would only be a very minor setback for us if they did.

## How to Use

All you have to do is view index.html in a browser; it will work whether these files are hosted on a server somewhere or sitting in a folder on your computer.

The chart defaults to displaying 16 months previous to the current month. There are two ways to override this:

1. Append "?end-date=[last month & year]&month-count=[number of months to display]" to the end of the URL. Both parameters are optional; either will work without the other. (The end-date parameter is flexible in what date formats it will accept, but try not to push it)

2. Move the mouse, revealing the "Show a Different Date Range Button". Click it, and enter input in the box accordingly. (The button will disappear after a few seconds if the mouse stays still; to make the input box disappear, click "cancel")

When it looks how you want, you can print from the browser to PDF or paper as you see fit. 