import {useEffect, useState} from 'react'

interface introProps {
    currentMood: string
    setCurrentMood: React.Dispatch<React.SetStateAction<string>>
}
function WordyIntro({currentMood, setCurrentMood}: introProps) {

    let meanDialogue = [`I am not interested in speaking to you. At all.`,
                        `You are scaring me.`,
                        `Why would I help you that?`,
                        'Go on.',
                        'This sounds hilarious. Sure.'];

    let kindDialogue = [`Hi! Nice to meet you!`,
                        `I'd be happy to help!`,
                        'How can I help?',
                        'Where do I come in?',
                        'Alright, I can do that!'];

    let ihateyou = "Actually, your existence is a stain. Please go away.";
    let apology = "Sorry, I've been really grumpy recently. I didn't mean to be mean.";
    
    let [dialogueProgress, setDialogueProgress] = useState(0);
    let [wordyGif, setWordyGif] = useState('hey im wordy!');

    const FINAL_DIALOGUE = 4;

    function handleClick(newMood: string) {
        if(dialogueProgress >= FINAL_DIALOGUE && newMood == currentMood) {
            document.getElementById('wordyIntroGif')!.style.display = 'none';
            document.getElementById('mean')!.style.display = 'none';
            document.getElementById('kind')!.style.display = 'none';

            document.getElementById('submitStockTicker')!.style.display = 'block';
            document.getElementById('stock_ticker_input')!.focus();
            document.getElementById('playerMoney')!.style.display = 'block';
            return;
        }
        else if(newMood == currentMood) {
            setWordyGif(`${newMood}_${dialogueProgress}`);
            setDialogueProgress(dialogueProgress + 1); 
        }
        else if(newMood == 'mean' && currentMood == 'kind') {
            setWordyGif('ihateyou');
        }
        else if(newMood == 'kind' && currentMood == 'mean') {
            setWordyGif('apology');
        }
        else if(currentMood == 'neutral') {
            setWordyGif(`${newMood}_0`);
            setDialogueProgress(dialogueProgress + 1); 
        }

        setCurrentMood(newMood);

    }

    return (
        <div>
            <img id = 'wordyIntroGif' src = {`/${wordyGif}.gif`} alt="hi ! I 'm word Y !"  width="500" />
            <div></div>
            <button id = 'mean' onClick = {() => handleClick('mean')}> 
                {(currentMood == 'mean' || currentMood == 'neutral') ? meanDialogue[dialogueProgress] : ihateyou}
            </button>
            <div></div>
            <button id = 'kind' onClick = {() => handleClick('kind')}> 
                {(currentMood == 'kind' || currentMood == 'neutral') ? kindDialogue[dialogueProgress] : apology}
            </button>
        </div>

        
    )
}

interface WordyReactionProps {
    percentChange: number
}
function WordyReaction({percentChange}: WordyReactionProps) {

    let [wordyGif, setWordyGif] = useState('-10to10');
    
    useEffect(() => {
        if(percentChange > 50) {
            setWordyGif('50+');
        }
        else if(percentChange > 30) {
            setWordyGif('30to50');
        }
        else if(percentChange > 10) {
            setWordyGif('10to30');
        }
        else if(percentChange > -10) {
            setWordyGif('-10to10');
        }
        else if(percentChange > -30) {
            setWordyGif('-30to-10');
        }
        else if(percentChange > -50) {
            setWordyGif('-50to-30');
        }
        else {
            setWordyGif('-50-');
        }
        
    }, [percentChange])

    return (
        <div> 
            <img style = {{display: 'none'}} id = 'wordyReactionGif' src = {`/${wordyGif}.gif`} alt="hi ! I 'm word Y !"  width="300" />
        </div>
    )
}

interface WordyEndProps {
    playerMoney: number,
    investment: number,
    currentMood: string,
    setStockState: React.Dispatch<React.SetStateAction<string>>,
    setCurrentMood: React.Dispatch<React.SetStateAction<string>>
}


function WordyEnd({playerMoney, investment, currentMood, setStockState, setCurrentMood}: WordyEndProps) {

    let[wordyGif, setWordyGif] = useState('')
    let[endDialogue, setEndDialogue] = useState('');
    let[replay, setReplay] = useState(false);
    
    useEffect(() => {
        if(replay == false) {
            if(playerMoney + investment <= 5000) {
                setStockState('end');
                document.getElementById('wordyEndGif')!.style.display = 'block';
                document.getElementById('endDialogue')!.style.display = 'block';

                setWordyGif('loss');

                if(currentMood == 'mean') {
                    setEndDialogue("Nah.");
                }
                else {
                    setEndDialogue("I'm sure it'll be okay!");
                }
            }
            if(playerMoney + investment >= 60000) {
                setStockState('end');
                document.getElementById('wordyEndGif')!.style.display = 'block';
                document.getElementById('endDialogue')!.style.display = 'block';

                setWordyGif('win');

                if(currentMood == 'mean') {
                    setEndDialogue("Haha, yeah that's great. Im gonna keep going.")
                }
                else {
                    setEndDialogue("I'm glad I could help!");
                }
            }
        }
    }, [investment])

    function handleClick() {
        document.getElementById('endDialogue')!.style.display = 'none';
        document.getElementById('wordyEndGif')!.style.display = 'none';
        document.getElementById('playerMoney')!.style.display = 'none';

        if(currentMood == 'mean' && wordyGif == 'win') {
            document.getElementById('submitStockTicker')!.style.display = 'block';
            document.getElementById('stock_ticker_input')!.focus();
            document.getElementById('playerMoney')!.style.display = 'block';
            setReplay(true);
        }
        else {
            document.getElementById('end')!.style.display = 'block';
        }
    }
    return(
        <div>
            <img style = {{display: 'none'}} id = 'wordyEndGif' src = {`/${wordyGif}.gif`} alt="hi ! I 'm word Y !"  width="500" />
            <div></div>
            <button style = {{display: 'none'}} id = 'endDialogue' onClick = {() => handleClick()}> 
                {endDialogue}
            </button>
            <p style = {{display: 'none'}} id = 'end'><i>Le Fin.</i></p>
        </div>
    )
}

export {WordyIntro, WordyReaction, WordyEnd}