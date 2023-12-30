let textLine, markov, data1, data2;
let names;
let bg;
let fontRegular;
let synonyms;

function preload () {
	sample = loadStrings("data/sample.txt");
  fontRegular = loadFont('font/IMFePIrm29P.ttf');
  fontCapitalized = loadFont('font/IMFePIsc29P.ttf');
  fontItalics = loadFont('font/IMFePIit29P.ttf');
  let img = 2;
  bg = loadImage('image/paper'+img+".png");
  synonyms = loadJSON('data/synonyms.json');
  names = loadStrings("data/names.txt");
}

function setup() {
  createCanvas(816, 1058);
  textFont(fontRegular, 16);
  textLine = ["click to (re)generate!"];

  markov = new RiMarkov(3);
  markov.allowDuplicates = false;
  markov.loadText(sample.join(' '));
  console.disableYellowBox = true;
  drawText();
}

function drawText() {
  background(bg);
  
  let displayText = '';

  textLine.forEach((line, i) => {
    if(i === 2 || i === 3){
      displayText += "\t\t";
    }
    displayText += line + "\n";
  })

  let lastSentence = textLine.slice(-1).pop();
  let lastWord = getLastWord(lastSentence);
  let synonymArray = [];

  for(const key in synonyms) {
    if(key === lastWord){
      synonymArray.push(synonyms[key]);
    }
  }

  if(synonymArray.length < 1) {
    return mouseClicked();
  }

  let randomSynonymObject = random(synonymArray);
  let randomSynonymArray = pickRandomProperty(randomSynonymObject);
  let synonym = random(randomSynonymArray);

  textAlign(LEFT);

  textFont(fontCapitalized, 36);
  text(synonym, 200, height/2 - 64);

  textFont(fontRegular, 24);
  text(displayText, 200, height/2);

  textFont(fontItalics, 20);
  text(random(names), 200, height/2 + 200);
}

function mouseClicked() {
  let generatedSentences = markov.generateSentences(1000);
  let lines = [];
  let rhymingList = [];
  let fiveSyllables = [];
  let sixSyllables = [];
  let sevenSyllables = [];
  let eightSyllables = [];
  let nineSyllables = [];
  let arrSyllables = [ fiveSyllables, sixSyllables, sevenSyllables, eightSyllables, nineSyllables ];

  // Split sentences into lines
  generatedSentences.forEach((generatedSentence) => {
    let splitLines = generatedSentence.split(/(?<=[,;:]\s)(?=[A-Z])/);
    splitLines.forEach((splitLine) => {
      splitLine = splitLine.trim();
      lines.push(splitLine);
    })
  });

    // Compare lines
  lines.forEach((line) => {
    let words = line.split(" ");
    let numberOfSyllables = 0;
    //check syllables
    words.forEach((word) => {
      numberOfSyllables += countSyllables(word);
    });
    //make syllables array
    if (numberOfSyllables === 5) {
      fiveSyllables.push(line);
    } else if(numberOfSyllables === 6) {
      sixSyllables.push(line);
    } else if(numberOfSyllables === 7) {
      sevenSyllables.push(line);
    } else if(numberOfSyllables === 8) {
      eightSyllables.push(line);
    } else if(numberOfSyllables === 9) {
      nineSyllables.push(line);
    }
  });
  //make rhymes
  getLine(arrSyllables,rhymingList);
  textLine= generateLimerick(rhymingList);

  drawText();

}

function getLine(arrSyllables,rhymingList){
  for (let i = 0; i < arrSyllables.length; i++){
    arrSyllables[i].forEach((lines) => {
      let lastWord = getLastWord(lines);
      let rhymingLines = arrSyllables[i].filter(item => {
        if (item !== lines && lastWord !== getLastWord(item)) {
          return RiTa.isRhyme(getLastWord(item), lastWord);
        }
      })
      if (Array.isArray(rhymingLines) && rhymingLines.length > 1) {
        rhymingList.push(rhymingLines);
        arrSyllables[i] = arrSyllables[i].filter(item => !rhymingLines.includes(item));
      }
    })
  }
}

function generateLimerick(rhymingList) {
  let Ar = [];
  let Br = [];

  for (let i = 0; i < rhymingList.length; i++) {
    //A
    if (countSyllables(rhymingList[i][0])  > 7
        && countSyllables(rhymingList[i][0] ) < 10
        && removeDuplicate(rhymingList[i])
    ) {
      if (rhymingList[i].length > 2) {
        Ar.push(rhymingList[i]);
      }
    }
    //B
    if (countSyllables(rhymingList[i][0] )  > 4
        && countSyllables(rhymingList[i][0] ) < 7
        && removeDuplicate(rhymingList[i])
    ) {
      Br.push(rhymingList[i]);
    }
  }
  let A = Ar[Math.floor(random()*Ar.length)];
  let B = Br[Math.floor(random()*Br.length)];

  if(A[1].startsWith("And") || A[1].startsWith("But")){
    return mouseClicked();
  }
  //end with punctuation
  A[2] = A[2].replace(/.$/,".")

  //put final limerick in array
  let lim = [5]
  lim[0] = A[0];
  lim[1] = A[1];
  lim[2] = B[0];
  lim[3] = B[1];
  lim[4] = A[2];

  console.clear();
  console.warn("New Limerick");
    for (let n = 0; n < lim.length; n++) {
      console.log(lim[n],countSyllables(lim[n]));
    }
  return lim;
}

function removeDuplicate(end){
  let lastWord = []
  let resultToReturn;
  for (let i = 0; i < end.length; i++) {
     lastWord.push(getLastWord(end[i]));
  }
  resultToReturn = lastWord.some((element, index) => {
    return lastWord.indexOf(element) !== index
  });
  return !resultToReturn;
}

function getLastWord(str) {
  return (str.toLowerCase().match(/(\w+)\W*?$/) || [])[1];
}

function countSyllables(word) {
  return RiTa.getSyllables(word).split(' ').length;
}

function pickRandomProperty(obj) {
  let keys = Object.keys(obj);
  return obj[keys[ keys.length * Math.random() << 0]];
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
