import { useState, useEffect } from 'react'
import {WordyIntro, WordyReaction, WordyEnd} from './wordy'
import './App.css'

function getStock(stockName: string = 'IBM', currentDay: number = 0) {

    enum DateRange {
        earliest = 1420099200,
        latest = 1572651390,
    };  // unix timestamp
    
    const APIKEY = 'cetmmeaad3i5jsal7s50cetmmeaad3i5jsal7s5g';

    let pricesPromise = fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${stockName}&resolution=D&from=${DateRange.earliest}&to=${DateRange.latest}&token=${APIKEY}`)
            .then(priceJson => priceJson.json())
            .catch(err => console.log(err));
    
    return pricesPromise;
}

interface TickerProps { 
    setTicker: React.Dispatch<React.SetStateAction<string>>,
    setStock: React.Dispatch<React.SetStateAction<stockType>>
    ticker: string,
}

function SubmitStockTicker({setTicker, setStock, ticker}: TickerProps) {

    const handleSubmitStockTicker = (e: React.FormEvent<HTMLFormElement>) => { 

        document.getElementById('submitStockTicker')!.style.display = 'none';
        e.preventDefault();
            getStock(ticker) //check if valid ticker not getting actual stock
                .then(data => {
                    if(data.s == 'no_data') {
                        console.log(ticker);
                        console.log(data);
                        throw('no_data');

                    }
                    else {
                        return data
                    }
                })
                .then(data => { 
                    setStock(data);
                    document.getElementById('currentPrice')!.style.display = 'block';
                    document.getElementById('submitStockRequest')!.style.display = 'block';
                    document.getElementById('investment_input')!.focus();
                })
                .catch(e => {
                    console.log(e);
                    alert('i dont think thats a stock brother')
                    document.getElementById('submitStockTicker')!.style.display = 'block'; //used to be able to keep typing after submit letting through bad requests 
                });        
    }

    return (
        <form style = {{display: 'none'}} id = 'submitStockTicker' onSubmit = {handleSubmitStockTicker} >
                <label>Stock Ticker: 
                    <input 
                        id = 'stock_ticker_input'
                        type="text" 
                        name="Stock_Ticker" 
                        onChange = {e => {
                            setTicker(e.target.value)
                            document.getElementById('stock_ticker_input')!.style.width = ((e.target.value.length + 1) * 30) + 'px';
                        }}
                        
                    />
                </label>
            </form>
    )
}

interface RequestProps { 
    setInvestment: React.Dispatch<React.SetStateAction<number>>,
    setStock: React.Dispatch<React.SetStateAction<stockType>>
    setPlayerMoney: React.Dispatch<React.SetStateAction<number>>,
    setStockState: React.Dispatch<React.SetStateAction<string>>,
    setInitInvestment: React.Dispatch<React.SetStateAction<number>>,
    setStartBuy: React.Dispatch<React.SetStateAction<boolean>>,
    ticker: string,
    investment: number,
    currentDay: number,
    playerMoney: number,
    initInvestment: number,
    stockState: string,
    startBuy: boolean
}

function SubmitStockRequest({setStock,
                            setInvestment,
                            setInitInvestment,
                            setPlayerMoney, 
                            setStockState, 
                            setStartBuy,
                            playerMoney, 
                            investment, 
                            initInvestment, 
                            ticker, 
                            currentDay,
                            stockState,
                            startBuy}: RequestProps) {

    
    useEffect(() => {if(startBuy) {setStockState('bought')}}, [investment]); //janky useeffect callbacks. They really gotta add setstate callbacks to hooks
    useEffect(() => {if(startBuy) {setInvestment(initInvestment)}}, [playerMoney]);
    useEffect(() => {if(startBuy) {setPlayerMoney(playerMoney - initInvestment)}}, [startBuy]);

    const handleSubmitStockRequest = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(0 < initInvestment && initInvestment <= playerMoney) {
            getStock(ticker, currentDay)
                .then(data => setStock(data))
                .then(() => (e.target as HTMLFormElement).style.display = 'none')
                .then(() => document.getElementById('currentPrice')!.style.display = 'block')
                .then(() => document.getElementById('investment')!.style.display = 'block')
                .then(() => document.getElementById('percentChange')!.style.display = 'block')
                .then(() => document.getElementById('sell')!.style.display = 'block')
                .then(() => setStartBuy(true))
                .then(() => document.getElementById('playerMoney')!.style.display = 'none')
                .then(() => document.getElementById('wordyReactionGif')!.style.display = 'block')
                .catch(err => console.log(err));   
        }
        else {
            alert('Ya know dog that aint a valid input tho');
        }
    } 

    return (
        <form  id = 'submitStockRequest' onSubmit = {handleSubmitStockRequest}>
                <label>How much are we investing?: 
                    <input 
                        id = 'investment_input'
                        type="text" 
                        name="Investment" 
                        onChange = {e => {
                            setInitInvestment(Number(e.target.value));
                            document.getElementById('investment_input')!.style.width = ((e.target.value.length + 1) * 30) + 'px';
                        }}
                    />
                </label>
            </form>
    )
}
interface StockProps { 
    setCurrentDay: React.Dispatch<React.SetStateAction<number>>,
    setTicker: React.Dispatch<React.SetStateAction<string>>,
    setInvestment: React.Dispatch<React.SetStateAction<number>>,
    setStock: React.Dispatch<React.SetStateAction<stockType>>
    setPlayerMoney: React.Dispatch<React.SetStateAction<number>>,
    setStockState: React.Dispatch<React.SetStateAction<string>>,
    ticker: string,
    investment: number,
    currentDay: number,
    stock: stockType,
    stockState: string,
    playerMoney: number
}

function BuyStockForUser({ setCurrentDay,
                            setTicker,
                            setInvestment,
                            setStock, 
                            setPlayerMoney,
                            setStockState,
                            ticker, 
                            investment, 
                            currentDay, 
                            stock,
                            playerMoney,
                            stockState}: StockProps) {

    useEffect(() => document.getElementById('stock_ticker_input')!.focus(), []);


    let [percentChange, setPercentChange] = useState(0);
    let [initInvestment, setInitInvestment] = useState(0);
    let [earnedOrLost, setEarnedOrLost] = useState('earned');
    let [startBuy, setStartBuy] = useState(false);
    const MARGIN_RATIO = 10;

    useEffect(() => { //callback for setInvestment 
        let percentChangePlaceholder = (investment - initInvestment)/initInvestment * 100;
        setPercentChange(percentChangePlaceholder);
        if(percentChangePlaceholder >= 0) {
            setEarnedOrLost('EARNED');
            document.getElementById('earnedOrLost')!.style.color = 'green';
        }
        else {
            setEarnedOrLost('LOST');
            document.getElementById('earnedOrLost')!.style.color = 'red';
        }


    }, [investment])

    useEffect(() => {
        if(stockState == 'bought' || stockState == 'sell' || stockState == 'end') { //hey lucas n kent! this is the thing i was trying to ask you about...i ended up putting it in a useEffect and that solved it! thanks for the help at the workshop and letting me borrow your computer! sorry i didnt bring my laptop lol
            setTimeout(() => {
                if(stockState == 'sell') {            
                    setPlayerMoney(investment + playerMoney);
                    document.getElementById('submitStockTicker')!.style.display = 'block';
                    document.getElementById('playerMoney')!.style.display = 'block';
                    document.getElementById('currentPrice')!.style.display = 'none';
                    document.getElementById('sell')!.style.display = 'none';
                    document.getElementById('investment')!.style.display = 'none';
                    document.getElementById('percentChange')!.style.display = 'none';
                    document.getElementById('wordyReactionGif')!.style.display = 'none';
                    document.getElementById('stock_ticker_input')!.focus();
                    setStockState('queue');
                    setStartBuy(false);
                }
                else if(stockState == 'bought') {
                    setInvestment(investment + MARGIN_RATIO * investment * ((stock.c[currentDay + 1] / stock.c[currentDay]) - 1)); // does a callback to previous useEffect. 
                    setCurrentDay(currentDay + 1);
                    setStartBuy(false);
                }
                else if(stockState == 'end') {
                    setPlayerMoney(investment + playerMoney);
                    document.getElementById('submitStockTicker')!.style.display = 'none';
                    document.getElementById('playerMoney')!.style.display = 'block';
                    document.getElementById('currentPrice')!.style.display = 'none';
                    document.getElementById('sell')!.style.display = 'none';
                    document.getElementById('investment')!.style.display = 'none';
                    document.getElementById('percentChange')!.style.display = 'none';
                    document.getElementById('wordyReactionGif')!.style.display = 'none';
                    setStockState('stopGame');
                    setStartBuy(false);
                }
            }, 1000);
        }
    }, [stockState, currentDay]);

    return (
        <div>
            <SubmitStockTicker 
                setTicker = {setTicker}
                setStock = {setStock} 
                ticker = {ticker}/>
            
            <p style = {{display: 'none'}} id = "currentPrice"> The current price is: {stock.c[currentDay].toFixed(2)}$ </p>

            <SubmitStockRequest 
                setStock = {setStock}
                setInvestment = {setInvestment}
                setInitInvestment = {setInitInvestment}
                setPlayerMoney = {setPlayerMoney}
                setStockState = {setStockState}
                setStartBuy = {setStartBuy}
                playerMoney = {playerMoney}
                investment = {investment}
                initInvestment = {initInvestment}
                ticker = {ticker}
                currentDay = {currentDay}
                stockState = {stockState}
                startBuy = {startBuy}/>

            <p style = {{display: 'none'}} id = "investment"> The value of your investment is: {investment.toFixed(2)}$ </p>
            <p style = {{display: 'none'}} id = "percentChange">  You've 
                <em id = 'earnedOrLost'> {earnedOrLost} {percentChange.toFixed(2)} </em>
                % on your initial investment! {(earnedOrLost == 'EARNED') ? ':D' : 'D:'}
            </p>
            <button style = {{display: 'none'}} id = 'sell' onClick = {() => setStockState('sell') }>SELL</button>

            <WordyReaction percentChange = {percentChange}/>
        </div>
    )
}




type stockType = {
    c: number[];
}

function InitStock() {
    
    const DEFAULT_PLAYER_MONEY = 20000; //how much money sticky has left after gambling away his life savings :(
    const DEFAULT_TICKER = 'IBM'
    
    const [ticker, setTicker] = useState(DEFAULT_TICKER);
    const [currentDay, setCurrentDay] = useState(0);
    const [stock, setStock] = useState<stockType>({c: [0]});
    const [playerMoney, setPlayerMoney] = useState(DEFAULT_PLAYER_MONEY);
    const [investment, setInvestment] = useState(0);
    const [stockState, setStockState] = useState('queue');
    let [currentMood, setCurrentMood] = useState('neutral');

    

    return (
        <div className="InitStock">
            <WordyIntro 
                currentMood = {currentMood}
                setCurrentMood = {setCurrentMood}/>

            <p style = {{display: 'none'}} id = 'playerMoney'>Wordy has {playerMoney.toFixed(2)}$</p>

            <BuyStockForUser
                setCurrentDay={setCurrentDay}
                setTicker = {setTicker}
                setInvestment = {setInvestment}
                setStock = {setStock} 
                setPlayerMoney = {setPlayerMoney}
                setStockState = {setStockState}
                ticker = {ticker}
                investment = {investment}
                currentDay = {currentDay}
                stock = {stock!}
                stockState = {stockState}
                playerMoney = {playerMoney}/>    

            <WordyEnd 
                playerMoney={playerMoney}
                investment = {investment}
                currentMood = {currentMood}
                setStockState = {setStockState}
                setCurrentMood = {setCurrentMood} />
        </div>
    )
}

export {InitStock}
