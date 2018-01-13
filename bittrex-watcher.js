/**
 * Created by James on 16/10/2016.
 * 
 * 29 Sep 2017 - Worth adding more functionality here. Will watch bittrex, and raise events.
 * 
 * 
 * 
 */

// Could make subscribing to an autobahn or other type of data stream a function of the database.

var tools = require('lang-mini');
var each = tools.each;
var Evented_Class = tools.Evented_Class;
var Fns = tools.Fns;

//var autobahn = require('autobahn');
var request = require('request');
var moment = require('moment');
var Arr_Table = require('arr-table');

//var present = require('present');

var node_bittrex = require('node.bittrex.api');

// It's possible this Bittrex watcher could be given a GUI as well.

// This may take a watching network - or use specific proxies?
//  Rather than proxies with their possibly tracable HTTP, we could do our own proxying / distribution.

// Could have a universal API for gathering crypto data from exchanges.
// 

class Bittrex_Watcher extends Evented_Class {
    'constructor'() {
        super();
        // Could set up the functions / handlers here, not on start?
        // or have subscribe methods, and then events get raised.
    }
    'start'(callback) {
        // Should start watching, for convenience.
        //  Default watching options.
        //  Could possibly have a GUI too.
        watch();
        //  Poloniex watcher should probably do more on start too.
        // Then would raise events saying it has various pieces of data.
    }

    watch(arr_symbols_watching) {
        // get top x currencies
        //  or get all of them.
        var that = this;
        //console.log('arr_symbols_watching', arr_symbols_watching);
        this.arr_symbols_watching = arr_symbols_watching;
        if (arr_symbols_watching) {
            //console.log('watch', arr_symbols_watching);

            // repeatedly download the bittrex ticker

            var ivl = setInterval(() => {

                /*
                that.get_at_selected_currencies_info(arr_symbols_watching, (err, at_selected_currencies_info) => {
                    if (err) { throw err; } else {
                        
                    }
                });
                */

                that.get_market_summaries_filter_by_arr_currencies(arr_symbols_watching, (err, at_filtered_market_summaries) => {
                    if (err) { callback(err); } else {
                        console.log('at_filtered_market_summaries', at_filtered_market_summaries);
                        console.log('at_filtered_market_summaries.length', at_filtered_market_summaries.length);

                        // So, we have the tick data for currencies on their markets every 5s.

                        that.raise('market_summaries', at_filtered_market_summaries);
                    }
                });

            }, 5000)

        } else {
            this.get_all_currencies_names_codes((err, currencies) => {
                if (err) {
                    throw err;
                } else {
                    console.log('currencies', currencies);
    
                    // Should be easy enough to load simple records into the database.
    
                }
            });
        }
    }

    'subscribe_to_active_currency_pairs'() {
        // get the active currency pairs

    }

    'get_all_currencies_names_codes'(callback) {
        var that = this;
        that.get_all_currencies_info((err, currencies_info) => {
            if (err) {

                callback(err);
            } else {
                var res = [];
                each(currencies_info[1], (currency_info) => {
                    //console.log('currency_info', currency_info);
                    res.push([currency_info[0], currency_info[1]]);
                });
                callback(null, res);
            }
        })
    }

    'get_all_currencies_info'(callback) {
        // https://bittrex.com/api/v1.1/public/getcurrencies

        request('https://bittrex.com/api/v1.1/public/getcurrencies', function (err, response, body) {
            //console.log('error:', err); // Print the error if one occurred 
            //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
            //console.log('body:', body); // Print the HTML for the Google homepage. 
            if (err) {
                throw callback(err);
            } else {
                var obj_body = JSON.parse(body);
                //console.log('obj_body', obj_body);

                var arr_items = [], arr_values;
                each(obj_body.result, (item) => {
                    if (item) {
                        arr_values = [];
                        each(item, (val) => {
                            arr_values.push(val);
                        });
                        //throw 'stop';
                        arr_items.push(arr_values);
                    }
                });

                var keys = Object.keys(obj_body.result[0]);
                var res = [keys, arr_items];
                callback(null, res);
                // Possibly snapshots of readings of results such as this should be put in the DB.
            }
        });
    }

    'get_at_all_currencies_info'(callback) {
        this.get_all_currencies_info((err, aci) => {
            if (err) { callback(err); } else {
                var res = new Arr_Table(aci);
                callback(null, res);
            }
        })
    }

    // selected currencies info

    'get_at_selected_currencies_info'(arr_currencies, callback) {
        var that = this;
        this.get_at_all_currencies_info((err, at_all_currencies_info) => {
            if (err) { callback(err); } else {
                console.log('at_all_currencies_info', at_all_currencies_info);
            }
        });
    }


    // Could get an array_table with the info
    'get_all_markets_info'(callback) {
        console.log('get_all_markets_info');
        //throw 'stop';
        // https://bittrex.com/api/v1.1/public/getmarkets

        request('https://bittrex.com/api/v1.1/public/getmarkets', function (err, response, body) {
            //console.log('error:', err); // Print the error if one occurred 
            //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
            //console.log('body:', body); // Print the HTML for the Google homepage. 
            
            if (err) {
                throw callback(err);
            } else {
                var obj_body = JSON.parse(body);
                //console.log('obj_body', obj_body);
                var keys = Object.keys(obj_body.result[0]);
                var arr_items = [], arr_values;
                each(obj_body.result, (item) => {
                    arr_values = [];
                    each(item, (val) => {
                        arr_values.push(val);
                    });
                    arr_items.push(arr_values);
                });
                var res = [keys, arr_items];
                callback(null, res);
            }
        });
    }

    get_at_all_markets_info(callback) {
        this.get_all_markets_info((err, ami) => {
            if (err) { callback(err); } else {
                var res = new Arr_Table(ami);
                callback(null, res);
            }
        });


    }

    download_bittrex_structure(callback) {
        Fns([
            [this, this.get_at_all_currencies_info, []],
            [this, this.get_at_all_markets_info, []]
        ]).go(callback);
    }

    get_markets_info_by_market_names(arr_names, callback) {
        var that = this;
        that.get_at_all_markets_info((err, at_all_markets_info) => {
            if (err) { callback(err); } else {
                // filter by the value of the MarketName field
                var res = at_all_markets_info.select_matching_field_values('MarketName', arr_names);
                callback(null, res);
            }
        })
    }

    // get market summaries

    'get_all_markets_summaries'(callback) {
        // https://bittrex.com/api/v1.1/public/getmarkets

        // Use a more reliable HTTP request system?
        //  Could use multiple attempts to download.

        request('https://bittrex.com/api/v1.1/public/getmarketsummaries', function (err, response, body) {
            //console.log('error:', err); // Print the error if one occurred 
            //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
            //console.log('body:', body); // Print the HTML for the Google homepage. 
            
            if (err) {
                console.trace();
                throw callback(err);
            } else {

                // try parsing the JSON.
                //  Any problem, raise an error callback.

                try {  
                    var obj_body = JSON.parse(body);
                    //console.log('obj_body', obj_body);
                    var keys = Object.keys(obj_body.result[0]);
                    var arr_items = [], arr_values;
                    each(obj_body.result, (item) => {
                        arr_values = [];
                        each(item, (val) => {
                            arr_values.push(val);
                        });
                        arr_items.push(arr_values);
                    });
                    var res = [keys, arr_items];
                    
                }  
                catch(exception){  
                      console.log('exception', exception);
                      console.trace();
                      callback(exception);
                }  
                finally {  
                      
                }
                if (res) callback(null, res);
                
            }
        });
    }

    'get_at_all_market_summaries'(callback) {
        this.get_all_markets_summaries((err, ams) => {
            if (err) { callback(err); } else {
                var res = new Arr_Table(ams);
                callback(null, res);
            }
        })
    }

    // get market summaries filter by market names

    'get_market_summaries_filter_by_arr_market_names'(arr_market_names, callback) {
        var tm_market_names = jsgui.get_truth_map_from_arr(arr_market_names);
        this.get_at_all_market_summaries((err, at_ams) => {
            if (err) { callback(err); } else {
                //var res = new Arr_Table(ams);
                //callback(null, res);
                var res = at_ams.select_at_matching_fn((value) => {
                    //console.log('value', value);
                    //console.log('value[at_ams.map_keys[\'MarketName\']]', value[at_ams.map_keys['MarketName']]);
                    var market_name = value[at_ams.map_keys['MarketName']];
                    //var s_market_name = market_name.split('-');
                    if (tm_market_names[market_name]) {
                        return true;
                    }
                    return false;
                })
                //return res;
                callback(null, res);
            }
        })
    }

    // get market summaries filter by arr currencies

    'get_market_summaries_filter_by_arr_currencies'(arr_currencies, callback) {
        var tm_currencies = jsgui.get_truth_map_from_arr(arr_currencies);
        this.get_at_all_market_summaries((err, at_ams) => {
            if (err) { callback(err); } else {
                //var res = new Arr_Table(ams);
                //callback(null, res);
                var res = at_ams.select_at_matching_fn((value) => {
                    //console.log('value', value);
                    //console.log('value[at_ams.map_keys[\'MarketName\']]', value[at_ams.map_keys['MarketName']]);
                    var market_name = value[at_ams.map_keys['MarketName']];
                    var s_market_name = market_name.split('-');
                    if (tm_currencies[s_market_name[0]] && tm_currencies[s_market_name[1]]) {
                        return true;
                    }
                    return false;
                })
                //return res;
                callback(null, res);
            }
        })
    }

    'get_arr_market_names_by_arr_currencies'(arr_currencies, callback) {
        this.get_market_summaries_filter_by_arr_currencies(arr_currencies, (err, at_market_summaries) => {
            if (err) { callback(err); } else {
                // then get the field that represents the name
                //console.log('at_market_summaries.keys', at_market_summaries.keys);
                var res = at_market_summaries.get_arr_field_values('MarketName');
                callback(null, res);
            }
        });
    }

    // select markets by currencies
    // get_at_markets_info_
    'get_ticker_data'(callback) {
        
    }
    'subscribe_to_ticker'(callback) {
        // This is for all markets I think.
        var that = this;

        
    }

    'subscribe_to_market'(market, callback) {
        if (callback) callback(null, true);

    }

    'subscribe_to_all_markets'(callback) {
        //var fns = jsgui.Fns();
        this.get_active_currency_pairs((err, arr_pairs) => {
            each(arr_pairs, (pair) => {
                console.log('pair', pair);
                that.subscribe_to_market(pair);
                //fns.push([that.subscribe_to_market, [pair]]);
            });
        });
        if (callback) callback(null, true);
    }

    'get_active_currency_pairs'(callback) {
        this.get_ticker_data((err, ticker_data) => {
            if (err) {
                throw err;
            } else {
                callback(null, Object.keys(ticker_data));
            }
        })
    }

    'get_active_currencies'(callback) {
        request('https://bittrex.com/public?command=returnCurrencies', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                //console.log('get_active_currency_pairs body', body);

                var obj_currencies = JSON.parse(body);
                //console.log('obj_currencies', obj_currencies);

                var active_currencies = {};

                each(obj_currencies, (value, key) => {
                    if (!value.disabled & !value.delisted & !value.frozen) {
                        //active_currencies.push(value);
                        active_currencies[key] = value;
                    }
                });

                //console.log('active_currencies', active_currencies);

                callback(null, active_currencies);

                // Don't think we can subscribe to every combination.

                // Pity we can't find out the markets...?
                //  https://Bittrex.com/public?command=returnTicker
                //   gets the ticker for all active markets

            }
        })
    }
}

var p = Bittrex_Watcher.prototype;

//

p.get_at_market_summaries = p.get_at_all_market_summaries;

p.get_market_summaries = p.get_all_markets_summaries;
p.get_markets_summaries = p.get_all_markets_summaries;


p.get_market_info = p.get_at_all_markets_info;
p.get_markets_info = p.get_at_all_markets_info;
// get_at_all_markets_info

//console.log('require.main', require.main);
if (require.main === module) {

    var watcher = new Bittrex_Watcher();
    //console.log('pre start');

    /*
    watcher.get_all_currencies_info((err, currencies) => {
        if (err) {

        } else {
            //console.log('currencies', currencies);

            watcher.get_all_markets_info((err, markets) => {
                if (err) {

                } else {
                    console.log('markets', markets);
                }
            });

        }
    });
    */
    watcher.watch();


} else {
    //console.log('required as a module');

}

module.exports = Bittrex_Watcher;

// Could be useful if this and other watchers follow a similar pattern or API so that the code could be used as a plugin for nextlevel.
