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
const fin_data = require('fin-data');

const Exchange = fin_data.Exchange;
const Exchange_Market = fin_data.Exchange_Market;
const Coin = fin_data.Coin;
const Coin_On_Exchange = fin_data.Coin_On_Exchange;
const Trade = fin_data.Trade;
const Market_Snapshot = fin_data.Market_Snapshot;



// need to produce the output in fin-data format.

// need to have a little network (graph) of these fin-data classes



const AKVT = require('arr-kv-table');

//var present = require('present');

var node_bittrex = require('node.bittrex.api');

let fnl = require('fnl');

const prom_or_cb = fnl.prom_or_cb;
const observable = fnl.observable;


// It's possible this Bittrex watcher could be given a GUI as well.

// This may take a watching network - or use specific proxies?
//  Rather than proxies with their possibly tracable HTTP, we could do our own proxying / distribution.

// Could have a universal API for gathering crypto data from exchanges.
// 

// Could maybe just use functional programming, such as Observable.
//  Have a function that gets an observable when requesting a load of data from bittrex, or wherever.

// obs_bittrex_snapshots = ...
//  then every snapshot we get, make records out of it, put those records into the DB.

// Want to have full and proper records of the coins and exchanges.


// watch_bittrex_snapshots(delay)
//  return observable

const bittrex = new Exchange({
    name: 'Bittrex'

});

const map_all_exchanges = {
    'bittrex': bittrex
}


const map_all_coins = {

}

const map_coins_by_map_exchange = {

}

const map_markets_by_map_exchange = {

}



console.log('bittrex ' + bittrex);


// load the bittrex snapshots... 

// need to hae the bittrex coins.


const dl_bittrex_coins = () => {


    // https://bittrex.com/api/v1.1/public/getcurrencies

    // but then it's got to be made into the right format.
    //  got to make sure the base level coins are there too.

    // May be better to get them from cmc.


}

const to_snake_case = (str) => {
    //let res = str.replace(/^\s/g, '_');

    //s.replace(/(?:^|\.?)([A-Z])/g, function (x,y){return "_" + y.toLowerCase()}).replace(/^_/, "")


    let res = str.replace(/(?:^|\.?)([A-Z])/g, function (x, y) { return "_" + y.toLowerCase() }).replace(/^_/, "");


    //let res = str.split(/(?=[A-Z])/).join('_').toLowerCase();




    // first letter uppercase has no underscore put in frone

    //console.log('res', res);

    return res;

}

const obj_snake = o => {
    let res = {};
    for (key in o) {
        res[to_snake_case(key)] = o[key];
    }
    //console.log('o', o);
    return res;
}

const arr_obj_snake = arr => {
    return arr.map(o => obj_snake(o));
}

const each_snake = (o, handler) => {
    each(o, (v, k, stop) => {
        //console.log('k', k);
        handler(v, to_snake_case(k), stop);
    })
}




// Includes checking that the market objects are there.
//  Another layer of logic will need to coordinate those market etc objects with database ids.


// 

// then getting the snapshots does this first.
//  makes full it has a full list of these coins and markets

// would also need to compare the list of coins to what we know we have in the db.
//  if any are missing, need to add those / ensure them before it puts the data.

// It will find any of the items there that are missing.
//  If it knows they are missing, it will have the full data needed to add to the DB, and functionality that makes it easy to do with a simple API.



const get_bittrex_coins_markets = (callback) => {
    // may need to be a somewhat complex function.
    //  processes snapshots to see if any underlying structure data is missing.
    console.log('get_bittrex_coins_markets');
    // download the data
    //  then if we can't find any of the coins, download and create all of those coin objects

    // Using an observable handler would maybe be a good pattern

    // return fetch('https://bittrex.com/api/v1.1/public/getmarketsummaries');

    // promise makes sense here - observable seems silly.
    //  a resolvable each would be cool though.

    const exchange_name = 'bittrex';
    //console.log('get_bittrex_snapshots');

    map_coins_by_map_exchange[exchange_name] = map_coins_by_map_exchange[exchange_name] || {};
    map_markets_by_map_exchange[exchange_name] = map_markets_by_map_exchange[exchange_name] || {};

    // get_bittrex_oo_structure
    //  Then won't be all that tricky to output those rows as records.


    return prom_or_cb((resolve, reject) => {

        (async () => {

            let arr_market_summaries = (await (await fetch('https://bittrex.com/api/v1.1/public/getmarketsummaries')).json()).result;
            let map_all_found_coin_names = {};

            // but want to go through the found coin names, checking if we have the coins, and the bittrex coins.
            // coins missing
            // (bittrex) exchange coins missing

            let coins_missing = [];
            let exchange_coins_missing = [];
            let exchange_coins = [];
            let oo_coins = [];
            // can turn it to snake case early.

            each(arr_market_summaries, obj_market_summary => each(obj_market_summary['MarketName'].split('-'), code => map_all_found_coin_names[code] = true));

            //console.log('map_all_found_coin_names', map_all_found_coin_names);
            //throw 'stop';

            each(map_all_found_coin_names, (v, coin) => {
                if (!map_all_coins[coin]) {
                    coins_missing.push(coin);
                    //map_all_coins[coin] = new Coin({});
                }
                if (!map_coins_by_map_exchange[exchange_name][coin]) {
                    exchange_coins_missing.push(coin);
                }
            });

            map_synonyms = {
                'currency': 'code',
                'currency_long': 'name'
            }
            // if no coins missing, no need to make more coins.

            if (coins_missing.length > 0 || exchange_coins_missing.length > 0) {
                // get the coin data

                // As in have the data from bittrex.

                let arr_coins = (await (await fetch('https://bittrex.com/api/v1.1/public/getcurrencies')).json()).result;
                //console.log('arr_coins', arr_coins);
                console.log('arr_coins.length', arr_coins.length);
                //throw 'astop';

                // create the coin obj

                // need to remap some words.
                //  code and name

                each(arr_coins, coin => {
                    //console.log('coin', coin);
                    let oo_coin;
                    let coin_spec = {};

                    each_snake(coin, (v, i) => {
                        //console.log('i', i);
                        coin_spec[map_synonyms[i] || i] = v;
                    });
                    if (!map_all_coins[coin_spec.code]) {

                        //throw 'stop';
                        //console.log('coin_spec', coin_spec);


                        oo_coin = new Coin(coin_spec);
                        //console.log('oo_coin', oo_coin);
                        map_all_coins[oo_coin.code] = oo_coin;
                        //map_coins_by_map_exchange[exchange_name][oo_coin.code] = oo_coin;
                    } else {
                        //console.log('map_all_coins', map_all_coins);
                        oo_coin = map_all_coins[coin_spec.code];
                    }
                    let oo_exchange_coin;

                    //console.log('coin', coin);
                    //console.log('!!map_all_coins[coin_spec.code]', !!map_all_coins[coin_spec.code]);
                    //console.log('coin_spec.code', coin_spec.code);
                    //console.log('* oo_coin', oo_coin);
                    //console.log('oo_coin.code', oo_coin.code);
                    //throw 'stop';

                    // map_coins_by_map_exchange

                    //console.log('!!map_coins_by_map_exchange[exchange_name][oo_coin.code]', map_coins_by_map_exchange[exchange_name][oo_coin.code]);

                    //throw 'stop';

                    if (!map_coins_by_map_exchange[exchange_name][oo_coin.code]) {
                        // create that new oo_exchange_coin
                        // and further spec.

                        oo_exchange_coin = new Coin_On_Exchange({
                            'coin': oo_coin,
                            'exchange': bittrex
                        });
                        map_coins_by_map_exchange[exchange_name][oo_coin.code] = oo_exchange_coin;
                    };

                    //exchange_coins.push(oo_exchange_coin);
                    //coins.push(oo_coin);

                    // then get the markets / ensure the markets are there
                    //  have them already, arr_market_summaries

                    // then if it's missing from the exchange coins.

                });

                //console.log('map_coins_by_map_exchange', map_coins_by_map_exchange);
                //throw 'stop';

                // then make sure the coins on the exchange are there.

                // snake_to_camel
                //  each_snake


                /*
                { Currency: 'EXP',
                CurrencyLong: 'Expanse',
                MinConfirmation: 60,
                TxFee: 0.01,
                IsActive: true,
                CoinType: 'ETH',
                BaseAddress: '0xc9710872d3e65edbf7f8776829dd7b21f2085e40',
                Notice: null }
                */

                // ['coin', 'exchange', 'code_on_exchange', 'name', 'dt_listed', 'min_confirmations', 'tx_fee', 'is_active', 'base_address', 'coin_type', 'notice']);

                //throw 'stop';


            } else {
                // Don't have an array of all the coins here anyway.
                //  Better to return the map and use that
            }

            const missing_market_names = [];

            // of_each
            // property_of_each

            //console.log('arr_market_summaries', arr_market_summaries);



            each(arr_market_summaries, obj_market_summary => {
                let exch_market_name = obj_market_summary['MarketName']
                //console.log('exch_market_name', exch_market_name);

                if (!map_markets_by_map_exchange[exchange_name][exch_market_name]) {
                    // create the new market object.

                    let [market_name, base_name] = exch_market_name.split('-');
                    //console.log('[market_name, base_name]', [market_name, base_name]);

                    let market_coin_on_exchange = map_coins_by_map_exchange[exchange_name][market_name];
                    let base_coin_on_exchange = map_coins_by_map_exchange[exchange_name][base_name];

                    //console.log('market_coin_on_exchange', market_coin_on_exchange);
                    //console.log('base_coin_on_exchange', base_coin_on_exchange);


                    if (market_coin_on_exchange && base_coin_on_exchange) {
                        let market = new Exchange_Market({
                            'exchange': bittrex,
                            'market_coin_on_exchange': market_coin_on_exchange,
                            'base_coin_on_exchange': base_coin_on_exchange
                        })
                        // then array / map of markets

                        map_markets_by_map_exchange[exchange_name][exch_market_name] = market;

                        //console.log('market', market);
                    } else {
                        console.log('map_coins_by_map_exchange', map_coins_by_map_exchange);
                        console.trace();
                        throw 'stop';
                    }
                }
                //missing_market_names.push();
            });

            //console.log('map_markets_by_map_exchange', map_markets_by_map_exchange);

            // bittrex coins
            // bittrex markets

            // maps and arrays

            let arr_coins = [], arr_markets = [];

            each(map_coins_by_map_exchange[exchange_name], (v, i) => {
                arr_coins.push(v);
            });
            each(map_markets_by_map_exchange[exchange_name], (v, i) => {
                arr_markets.push(v);
            });

            let res = {
                map: {
                    coins: map_coins_by_map_exchange[exchange_name],
                    markets: map_markets_by_map_exchange[exchange_name]
                },
                arr: {
                    coins: arr_coins,
                    markets: arr_markets,
                    raw_market_summaries: arr_market_summaries
                }
            }

            //return res;

            resolve(res);

        })();








        // Then have a look for the markets.
        //  




        //let all_found_coins = arr_market_summaries.

        // await (await fetch('https://api.github.com')).json()

        //let obj_market_summaries = await fetch('https://bittrex.com/api/v1.1/public/getmarketsummaries').json();


        /*
        console.log('arr_market_summaries', arr_market_summaries);
        console.log('map_all_found_coin_names', map_all_found_coin_names);

        console.log('coins_missing', coins_missing);
        console.log('exchange_coins_missing', exchange_coins_missing);
        */

        // then for each of the missing coins make new coin objects



        // then get a list of all coins mentioned / find the ones that don't have a matching 



    }, callback);

}


// We get the bittrex snapshots as a fully OO system, then turn them into records, along the way verifying that the items are in the db.



const get_bittrex_snapshots = () => {
    // These will be OO bittrex snapshots.

    return prom_or_cb(async (resolve, reject) => {
        let bittrex_structure = await get_bittrex_coins_markets();
        //console.log('bittrex_structure', bittrex_structure);

        let raw_market_summaries = bittrex_structure.arr.raw_market_summaries;
        //console.log('raw_market_summaries.length', raw_market_summaries.length);

        //console.log('raw_market_summaries[0]', raw_market_summaries[0]);


        // arr_obj_snake.

        let market_snapshots = arr_obj_snake(raw_market_summaries);
        //console.log('market_snapshots[0]', market_snapshots[0]);

        // then create the coin object from this...


        // Market_Snapshot

        // Need to lookup which market it is

        let oo_market_snapshots = market_snapshots.map(x => {

            x.exchange_market = map_markets_by_map_exchange['bittrex'][x.market_name];
            //console.log('exchange_market', exchange_market);

            let res = new Market_Snapshot(x);
            //console.log('res', res);
            return res;
        });
        //console.log('oo_market_snapshots', oo_market_snapshots);


        // 


        // have the map of them

        let res = {
            'market_snapshots': oo_market_snapshots,
            //'map_coins': bittrex_structure.map.coins,
            'map_exchange_coins': bittrex_structure.map.coins,
            'map_exchange_markets': bittrex_structure.map.markets
        }


        resolve(res);

        // then for 


        // Better map to snake functionality.

        //let snaked_market_summaries = raw_market_summaries.map(x => to_snake_case(x));
        //console.log('snaked_market_summaries[0]', snaked_market_summaries[0]);

        // then 
    });
}


const watch_bittrex_snaphots = delay => {
    // needs the Bittrex markets records.
    // will use various OO classes, not connected to the DB, get them logically right, then put them into the DB.
    //  could get them, use them without IDs and get the IDs for them later on.

    // get the bittrex markets.

    return observable((next, complete, error) => {
        (async () => {
            next(await get_bittrex_snapshots());
            setInterval(async () => {
                next(await get_bittrex_snapshots());
            }, delay);
        })();
        return [];
    });
}




// bittrex_watcher.get_coins
//  would generat new coin objects

// get markets, would generate the coin objects and market objects.
//  Then can use some active_record or active-table tech to put them in place with minimal lines of code here.
//  The strategy of more code elsewhere is now paying off.


// Can be cut down a lot with fetch, observables, async / await.

let fetch = require('node-fetch');

class Bittrex_Watcher extends Evented_Class {
    'constructor'() {
        super();
        // Could set up the functions / handlers here, not on start?
        // or have subscribe methods, and then events get raised.
    }

    // could get various things as observables.
    //  makes it somewhat easier to process them one by one.


    'start'(callback) {
        // Should start watching, for convenience.
        //  Default watching options.
        //  Could possibly have a GUI too.
        //watch();
        //  Poloniex watcher should probably do more on start too.
        // Then would raise events saying it has various pieces of data.

        (async () => {
            // map records to array of values.

            let summary = await (await this.summary).json();
            //console.log('summary', summary);
            // need really simple way to map this summary right.
            let s_keys = Object.keys(summary.result[0]);
            let arr_items = [];
            /*
            let items = summary.result.map(item => {
                let item_res = [];
                each(item, (v, i) => {
                    item_res.push(v);
                })
                return item_res;
            }).map(arr_item => [arr_item[0], arr_item[3], arr_item[4], arr_item[5], arr_item[6], arr_item[7], arr_item[8], arr_item[9], arr_item[10], arr_item[12]]);
            */
            // 

            let akvt_items = new AKVT(summary.result);

            let selection = ['MarketName',
                'TimeStamp',

                //'High',
                //'Low',

                'Last',
                'Bid',
                'Ask',
                'Volume',
                'BaseVolume',

                'OpenBuyOrders',
                'OpenSellOrders'];

            let akvt_selected = akvt_items.select(selection);
            // 
            /*
            [market_key, d],
                                                    [value[4], value[7], value[8], value[3], value[5], value[9], value[10]]
            */

            //console.log('akvt_selected.keys', akvt_selected.keys);
            // too big to show well.
            //console.log('akvt_selected', akvt_selected);

            //console.log('items', items);
            //console.log('s_keys', s_keys);


        })();

    }

    get summary() {
        // Async / promise function
        // .then(x => x.json)
        return fetch('https://bittrex.com/api/v1.1/public/getmarketsummaries');
    }



    /*

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

                / *
                that.get_at_selected_currencies_info(arr_symbols_watching, (err, at_selected_currencies_info) => {
                    if (err) { throw err; } else {
                        
                    }
                });
                * /

                that.get_market_summaries_filter_by_arr_currencies(arr_symbols_watching, (err, at_filtered_market_summaries) => {
                    if (err) {
                        callback(err);
                    } else {
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
    */

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

                var arr_items = [],
                    arr_values;
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

    'get_map_currencies_info'(callback) {
        this.get_all_currencies_info((err, res_info) => {
            if (err) {
                callback(err);
            } else {
                let res = {};
                let [keys, arr_info] = res_info;
                //console.log('keys', keys);

                each(arr_info, item => {
                    //console.log('item', item);
                    //throw 'stop';
                    res[item[0]] = item;
                })
                callback(null, res);
            }
        })
    }

    'get_currency_codes'(callback) {
        request('https://bittrex.com/api/v1.1/public/getcurrencies', function (err, response, body) {
            //console.log('error:', err); // Print the error if one occurred 
            //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
            //console.log('body:', body); // Print the HTML for the Google homepage. 
            if (err) {
                throw callback(err);
            } else {
                var obj_body = JSON.parse(body);
                //console.log('obj_body', obj_body);

                var arr_items = [],
                    arr_values;
                each(obj_body.result, (item) => {
                    if (item) {
                        //arr_values = [];
                        /*
                        each(item, (val) => {
                            console.log('item', item);
                            arr_values.push(val.Currency);
                        });
                        */
                        //throw 'stop';
                        arr_items.push(item.Currency);
                    }
                });

                //var keys = Object.keys(obj_body.result[0]);
                //var res = [keys, arr_items];
                callback(null, arr_items);
                // Possibly snapshots of readings of results such as this should be put in the DB.
            }
        });
    }

    'get_at_all_currencies_info'(callback) {
        this.get_all_currencies_info((err, aci) => {
            if (err) {
                callback(err);
            } else {
                var res = new Arr_Table(aci);
                callback(null, res);
            }
        })
    }

    // selected currencies info

    'get_at_selected_currencies_info'(arr_currencies, callback) {
        var that = this;
        this.get_at_all_currencies_info((err, at_all_currencies_info) => {
            if (err) {
                callback(err);
            } else {
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
                var arr_items = [],
                    arr_values;
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
            if (err) {
                callback(err);
            } else {
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
            if (err) {
                callback(err);
            } else {
                // filter by the value of the MarketName field
                var res = at_all_markets_info.select_matching_field_values('MarketName', arr_names);
                callback(null, res);
            }
        })
    }

    // get market summaries


    // Also want a standard format for any market summary entry.

    // A low time resolution system would be nice to get running.
    //  Like every minute?

    // Want a way to simply add the listings based on the tick data.
    //  Different exchanges have different info structures.

    // want to make it so coins get added to an exchange, by their code.
    //  add the overall coin.
    //  add the coin linked to that exchange
    //  add the market for that exchange.

    // save_coin_tick

    // {"coinType":"BTC","trading":true,"symbol":"BTC-USDT","lastDealPrice":8157.149151,"buy":8149.40831,"sell":8157.149151,"change":-263.85173,"coinTypePair":"USDT","sort":100,"feeRate":0.001,"volValue":1914423.49861897,"high":8850.179575,"datetime":1526453544000,"vol":226.60756064,"low":8095.570631,"changeRate":-0.0313}


    // ensure_exchange_coin_pair
    //  ensure_exchange coin * 2
    //  ensure exchange market










    // repeat that, then push the data.

    // Definitely need to improve handling of cases of there being another coin.



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
                    var arr_items = [],
                        arr_values;
                    each(obj_body.result, (item) => {
                        arr_values = [];
                        each(item, (val) => {
                            arr_values.push(val);
                        });
                        arr_items.push(arr_values);
                    });
                    var res = [keys, arr_items];

                } catch (exception) {
                    console.log('exception', exception);
                    console.trace();
                    callback(exception);
                } finally {

                }
                if (res) callback(null, res);

            }
        });
    }

    'get_at_all_market_summaries'(callback) {
        this.get_all_markets_summaries((err, ams) => {
            if (err) {
                callback(err);
            } else {
                var res = new Arr_Table(ams);
                callback(null, res);
            }
        })
    }

    // get market summaries filter by market names

    'get_market_summaries_filter_by_arr_market_names'(arr_market_names, callback) {
        var tm_market_names = jsgui.get_truth_map_from_arr(arr_market_names);
        this.get_at_all_market_summaries((err, at_ams) => {
            if (err) {
                callback(err);
            } else {
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
            if (err) {
                callback(err);
            } else {
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
            if (err) {
                callback(err);
            } else {
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

Bittrex_Watcher.watch_bittrex_snaphots = watch_bittrex_snaphots;


//console.log('require.main', require.main);
if (require.main === module) {

    (async () => {
        //let snapshots = await get_bittrex_snapshots();
        //console.log('snapshots', snapshots);


        let obs_snapshots = watch_bittrex_snaphots(6000);
        obs_snapshots.on('next', data => {

            console.log('data[20]', data[20]);


            console.log('data.length', data.length);




            // 



        });


    })();




    /*
    (async () => {
        var watcher = new Bittrex_Watcher();
        await watcher.start();
    })();
    */




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
    //watcher.watch();


} else {
    //console.log('required as a module');

}

module.exports = Bittrex_Watcher;

// Could be useful if this and other watchers follow a similar pattern or API so that the code could be used as a plugin for nextlevel.