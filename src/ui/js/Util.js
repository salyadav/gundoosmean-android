import axios from 'axios';
import Constants from './Constants';

const TARGET_COUNT_MAP = (function(){ //Map because - might want to add other attributes to level later
    const countMap = new Map();
    for (let lvl=1; lvl<=8; lvl++) {
        let count = lvl - Math.floor((lvl-1)/2);
        countMap.set(lvl, count);
    }

    for (let lvl=9; lvl<=16; lvl++) {
        let count = lvl - Math.floor((lvl-1)/2) - 1;
        countMap.set(lvl, count);
    }

    for (let lvl=17; lvl<=20; lvl++) {
        countMap.set(lvl, 10);
    }
    return countMap;
})();

let TAUNTS_UNUSED = Constants.TAUNTS.slice();

const submitScore = () => { 
    const url = Constants.BASE_URL + "leaderboard/submitScore";
    let tryAgainFlag = false;
    const username = localStorage.getItem(Constants.LOCALSTORAGE_USERNAME_KEY);
    const highscore = localStorage.getItem(Constants.LOCALSTORAGE_HIGHSCORE_KEY);
    
    const submitScoreAjax = () => {
        axios.post(url, {
            username: username,
            highscore: highscore || 0
        }).then(res => {
            console.log("Successfully saved user score.");
        })
        .catch(err => {
            if(!tryAgainFlag) {
                console.warn("Sorry, we weren't able to save your score in the database. But we will try again.");
                setTimeout(()=> {
                    tryAgainFlag = true;
                    console.warn("There was some evil doings last time while saving your score. Trying again...");
                    submitScoreAjax();
                }, 5000);
            } else {
                console.error("Sorry, we weren't able to add you to our database. But you can always beat your older highscore.");
            }
        });
    }

    if(username) 
    	submitScoreAjax();
}

export const setLocalStorageAndUpdateDataBase = (username, highscore=0, switchingUser=false) => {
    localStorage.setItem(Constants.LOCALSTORAGE_USERNAME_KEY, username);
    if (switchingUser) {
        localStorage.setItem(Constants.LOCALSTORAGE_HIGHSCORE_KEY, highscore);
        return;
    }

    const currenthighscore = localStorage.getItem(Constants.LOCALSTORAGE_HIGHSCORE_KEY);
    if(!currenthighscore || (currenthighscore < highscore)) {
        localStorage.setItem(Constants.LOCALSTORAGE_HIGHSCORE_KEY, highscore);
        const existingUsersMap = JSON.parse(localStorage.getItem(Constants.LOCALSTORAGE_EXISTINGUSERS_KEY));
        existingUsersMap[username] = highscore;
    }
    try {
        submitScore();
    } catch(e) {
        console.log('Exception caught at submitscore');
    }
}

export const addToExistingUsersList = (username) => {
    let usersMap;
    if (!localStorage.getItem(Constants.LOCALSTORAGE_EXISTINGUSERS_KEY)) {
        usersMap = Object.create({});
    } else {
        usersMap = JSON.parse(localStorage.getItem(Constants.LOCALSTORAGE_EXISTINGUSERS_KEY));
        const usersList = Object.keys(usersMap);
        if (usersList.length === Constants.MAX_ALLOWED_USER_IN_DEVICE) {
            delete usersMap[usersList[0]];
        }
    }
    usersMap[username] = 0;
    localStorage.setItem(Constants.LOCALSTORAGE_EXISTINGUSERS_KEY, JSON.stringify(usersMap));
}

export const checkForExistingLocalUser = (username) => {
    if (!localStorage.getItem(Constants.LOCALSTORAGE_EXISTINGUSERS_KEY)) return false;
    const usersMap = JSON.parse(localStorage.getItem(Constants.LOCALSTORAGE_EXISTINGUSERS_KEY));
    return (Object.keys(usersMap).includes(username)) ? [true, usersMap.username] : [false, null];
}

export const getTargetCountForLevel = (lvl=1) => {
    return lvl<=20 ? TARGET_COUNT_MAP.get(lvl) : 12;
}

export const cellFishSelector = () => {
    const index = randomIntGenerator(Constants.CELL_FISH_STYLE_CLASSES.length);
    return Constants.CELL_FISH_STYLE_CLASSES[index];
}

export const tauntSelector = () => {
    if (TAUNTS_UNUSED.length<1) TAUNTS_UNUSED = Constants.TAUNTS.slice();
    const index = randomIntGenerator(TAUNTS_UNUSED.length);
    const taunt = TAUNTS_UNUSED[index];
    TAUNTS_UNUSED.splice(index, 1);
    return taunt;
}

export const giveupTauntSelector = () => {
    const index = randomIntGenerator(Constants.GIVEUP_TAUNTS.length);
    return Constants.GIVEUP_TAUNTS[index];
}

export const stringToHtml = str => {
    const parser = new DOMParser();
    const el = parser.parseFromString(str, 'text/html');
    return el.body;
}

//returns a promise
export const checkForUniqueUserName = (username) => {
    const url = Constants.BASE_URL + "leaderboard/checkUsername";
    return axios.get(url, {
        params: {
            username: username
        }
    }).then(res => {
        console.log("usercheck successful. Clearing localStorage of stale user data...");
        localStorage.removeItem(Constants.LOCALSTORAGE_USERNAME_KEY);
        localStorage.removeItem(Constants.LOCALSTORAGE_HIGHSCORE_KEY);
        return {
            success: true,
            data: res.data
        };
    }). catch(err => {
        console.error("usercheck failed.");
        return {
            success: false,
            data: err
        };
    });
}

export const fetchLeaderboard = () => {
    // const url = BASE_URL + "leaderboard/getTopTen";
    const url = Constants.BASE_URL + "leaderboard/getTopTenAndUserRank";
    return axios.get(url, { 
        params: {
            username: localStorage.getItem(Constants.LOCALSTORAGE_USERNAME_KEY)
        }
    });
}

export const randomIntGenerator = limit => {
    return Math.floor(Math.random()*limit);
}

export const calculateFinalScore = (scorecard) => {
    const finalscore = 
        (scorecard._scored * Constants.CORRECT_SCORE) +
        (scorecard._missed * Constants.MISSED_SCORE) + 
        (scorecard._wronged * Constants.WRONGED_SCORE);
    return finalscore;
}

export const saveFeedbackToDB = (feedback, email = '') => {
    const username = localStorage.getItem(Constants.LOCALSTORAGE_USERNAME_KEY);
    const url = Constants.BASE_URL + "feedback/submitFeedback";
    return axios.post(url, {
        username: username, 
        feedback:feedback, 
        email: email
    }).then(res => {
        console.log("Feedback submitted successfully!");
        return true;
    }).catch(err => {
        console.log("Failed to submit feedback. :(");
        return false;
    });
}