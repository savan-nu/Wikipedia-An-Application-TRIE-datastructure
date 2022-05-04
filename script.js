import { items} from "./trie.js";

// Variables for objects on our HTML page

const submitButton = document.querySelector('#submit');
const input = document.querySelector('#input');
const errorSpan = document.querySelector('#error');
const resultsContainer = document.querySelector('#results');

// Wikipedia API endpoint

const endpoint = 'https://en.wikipedia.org/w/api.php?';

// Set parameters
const params = {
    origin: '*',
    format: 'json',
    action: 'query',
    prop: 'extracts',
    exchars: 250,
    exintro: true,
    explaintext: true,
    generator: 'search',
    gsrlimit: 20,
};

// Disables Submit Button

const disableUi = () => {
    input.disabled = true;
    submitButton.disabled = true;
};

// Enable Submit button

const enableUi = () => {
    input.disabled = false;
    submitButton.disabled = false;
};

// Clears Previous Results in the result set

const clearPreviousResults = () => {
    resultsContainer.innerHTML = '';
    errorSpan.innerHTML = '';
};

// Function to check if input is empty

const isInputEmpty = input => {
    if (!input || input === '') return true;
    return false;
};

// Shows error if request is not made

const showError = error => {
    errorSpan.innerHTML = `🚨 ${error} 🚨`;
};


// Shows output box
const showResults = results => {
    results.forEach(result => {
        resultsContainer.innerHTML += `
        <div class="results__item">
            <a href="https://en.wikipedia.org/?curid=${result.pageId}" target="_blank" class="card animated bounceInUp">
                <h2 class="results__item__title">${result.title}</h2>
                <p class="results__item__intro">${result.intro}</p>
            </a>
        </div>
    `;
    });
};

// Gets data form returned object through API and calls show function

const gatherData = pages => {
    const results = Object.values(pages).map(page => ({
        pageId: page.pageid,
        title: page.title,
        intro: page.extract,
    }));

    showResults(results);
};

// Gets data

const getData = async () => {
    const userInput = input.value;
    if (isInputEmpty(userInput)) return;

    params.gsrsearch = userInput;
    clearPreviousResults();
    disableUi();

    try {
        const { data } = await axios.get(endpoint, { params });

        if (data.error) throw new Error(data.error.info);
        gatherData(data.query.pages);
    } catch (error) {
        showError(error);
    } finally {
        enableUi();
    }
};

// handles keyboard event

const handleKeyEvent = e => {
    if (e.key === 'Enter') {
        getData();
    }
};

const registerEventHandlers = () => {
    input.addEventListener('keydown', handleKeyEvent);
    submitButton.addEventListener('click', getData);
};

//         >>>>>>>>>>         Trie implementation            <<<<<<<<<   


// Creates our Trie Node
function makeNode(ch) {
    this.ch = ch;
    this.isTerminal = false;
    this.map = {};
    this.words = [];
}

// Function to add new String in trie

function add(str, i, root) {

    if (i === str.length) {
        root.isTerminal = true;
        return;
    }
                                                                                    
    if (!root.map[str[i]])
        root.map[str[i]] = new makeNode(str[i]);

    root.words.push(str);
    add(str, i + 1, root.map[str[i]]);
}


// Function to search a String
function search(str, i, root) {
    if (i === str.length)
        return root.words;

    if (!root.map[str[i]])
        return [];
    return search(str, i + 1, root.map[str[i]]);

}

// Adds a list of items, that we imported from trie.js

const root = new makeNode('\0');
for (const item of items)
    add(item, 0, root);

// Creating vaariables for our list and textbox

const text_box = document.getElementById("input");
const list = document.getElementById("list");


// handles click 

function handleClick(prediction){
    console.log("hello");

    text_box.value = prediction;
    document.getElementById("list").innerHTML = "";
    
   document.getElementById("input").style = "normal";

   lastStr = prediction;
    
}

// Handles input of wrong word

function showPopup(){

    console.log("Hello");

    if(lastAdded === lastStr){
        return;
    }

    lastAdded = lastStr;
    const predictions = search(lastStr, 0, root);

    var ul = document.getElementById("list");
    
    if(predictions.length < 5){
        for (const prediction of predictions){
            var li = document.createElement("li");
            li.setAttribute('class',"list-group-item clickable");
            li.addEventListener("click",() => handleClick(prediction));
            li.innerHTML += prediction;
    
            ul.appendChild(li);
        }
    }
    else{


        for(var i = predictions.length;i>=predictions.length-5;i--){
            
            const prediction = predictions[i];

            var li = document.createElement("li");
            li.setAttribute('class',"list-group-item clickable");
            li.addEventListener("click",() => handleClick(prediction));
            li.innerHTML += prediction;
    
            ul.appendChild(li);

        }
    }
}


// Helper function to call showPopup()

function handleOut(strToPut){

    document.getElementById("input").style.textDecoration = "line-through";
    document.getElementById("input").style.color = "red";
    //document.getElementById("text-box").style.color = "black";

    

    document.getElementById("input").setAttribute('class',"clickable form-control");
    document.getElementById("input").addEventListener("click",() => showPopup());
}

var lastStr = "";
var lastAdded = "";
var lastPred = "";

// Runs the search operation everytime a key is lifted from keyboard

function handler(e) {
    
    const str = e.target.value;
    if(str !== ""){
    const predictions = search(str, 0, root);
    
    lastPred = str;

    if(predictions.length === 0){
        handleOut(str);
    }
    else{
        document.getElementById("input").style = "normal";
    }
    console.log(predictions);

    list.innerHTML = "";

    var ul = document.getElementById("list");

    if(predictions.length < 5){
        for (const prediction of predictions){

            var li = document.createElement("li");
            li.setAttribute('class',"list-group-item clickable");
            li.addEventListener("click",() => handleClick(prediction));
            li.innerHTML += `<b>${str}</b>${prediction.substring(str.length)}`;
    
            ul.appendChild(li);
    
            lastStr = str;
        }
    }
    else{

        for(var i = predictions.length-1;i>=predictions.length-5;i--){
            
            const prediction = predictions[i];

            var li = document.createElement("li");
            li.setAttribute('class',"list-group-item clickable");
            li.addEventListener("click",() => handleClick(prediction));
            console.log(prediction);
            li.innerHTML += `<b>${str}</b>${prediction.substring(str.length)}`;

            ul.appendChild(li);

            lastStr = str;

        }

        //list.innerHTML += `<li class="list-group-item clickable" onclick="handleClick(this)"><b>${str}</b>${prediction.substring(str.length)}</li>`;
    }
    if(str===""){
        list.innerHTML = "";
    }
}
}

// Handles keyup event and passes a JSON object

handler({ target: { value: "" } });


text_box.addEventListener("keyup", handler)

registerEventHandlers();
