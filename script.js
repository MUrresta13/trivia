"use strict";

const LOSE_AT_MISSES = 4; // 4th miss = lose
const PASSCODE = "THESTARWASSILENT";
const QUESTIONS_PER_RUN = 7;
const TIME_PER_Q = 15;           // seconds
const MAX_MISSES = 4;            // must finish with <= 3 misses

// Screens
const introScreen = document.getElementById("introScreen");
const titleScreen = document.getElementById("titleScreen");
const gameScreen  = document.getElementById("gameScreen");

// Buttons
const startChallengeBtn = document.getElementById("startChallengeBtn");
const playBtn = document.getElementById("playBtn");
const muteBtn = document.getElementById("muteBtn");
const restartBtn = document.getElementById("restartBtn");

const copyBtn = document.getElementById("copyBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const tryAgainBtn = document.getElementById("tryAgainBtn");
const backBtn = document.getElementById("backBtn");

// HUD/UI
const qCountEl = document.getElementById("qCount");
const timeLeftEl = document.getElementById("timeLeft");
const missesEl = document.getElementById("misses");
const questionText = document.getElementById("questionText");
const answersWrap = document.getElementById("answers");
const feedbackEl = document.getElementById("feedback");
const timeBar = document.getElementById("timeBar");

const winModal = document.getElementById("winModal");
const loseModal = document.getElementById("loseModal");
const loseReason = document.getElementById("loseReason");
const copyStatus = document.getElementById("copyStatus");

// Audio
const bgm = document.getElementById("bgm");
let musicOn = false;

// Game state
let runQuestions = [];
let qIndex = 0;
let misses = 0;

let timer = null;
let timeLeft = TIME_PER_Q;
let locked = false;

// -------------------- Question Pool (100) --------------------
// Format: { q: "...", a: ["A","B","C","D"], correct: 0..3 }
const QUESTION_POOL = [
  { q:"What city is traditionally believed to be Jesus’ birthplace?", a:["Nazareth","Bethlehem","Jerusalem","Capernaum"], correct:1 },
  { q:"How many wise men are named in the Bible?", a:["3","2","None are named","12"], correct:2 },
  { q:"What sign did the wise men follow?", a:["A comet","A star","The moon","An angel’s trumpet"], correct:1 },
  { q:"Who was Jesus’ earthly mother?", a:["Elizabeth","Mary","Martha","Ruth"], correct:1 },
  { q:"Who was Jesus’ earthly (adoptive) father?", a:["Joseph","Zacharias","Simeon","Matthew"], correct:0 },
  { q:"Which Gospel explicitly tells about the wise men?", a:["Mark","Luke","Matthew","John"], correct:2 },
  { q:"Which Gospel explicitly tells about shepherds visiting Jesus?", a:["Mark","Luke","Matthew","John"], correct:1 },
  { q:"What did the angels announce to the shepherds?", a:["A king’s coronation","A Savior is born","A new prophet","A great storm"], correct:1 },
  { q:"In the Nativity story, where was Jesus laid?", a:["A cradle","A manger","A throne","A basket"], correct:1 },
  { q:"Who tried to find the child Jesus to harm Him?", a:["Caesar Augustus","Herod","Pilate","Pharaoh"], correct:1 },

  { q:"Which of these is one of the wise men’s gifts?", a:["Silver","Gold","Frankincense","All of the above"], correct:3 },
  { q:"Which of these is one of the wise men’s gifts?", a:["Myrrh","Saffron","Pearls","Wheat"], correct:0 },
  { q:"On Christmas, many celebrate Jesus as what?", a:["The Light of the World","The Fisher of Men","The Judge","The Scribe"], correct:0 },
  { q:"What does ‘Emmanuel’ mean?", a:["Prince of Peace","God with us","Light of the world","Son of man"], correct:1 },
  { q:"Which book contains prophecies often linked to the Messiah’s birth?", a:["Judges","Isaiah","Ecclesiastes","Nahum"], correct:1 },

  { q:"What Roman emperor’s decree led Joseph and Mary to travel for a census?", a:["Nero","Augustus","Tiberius","Caligula"], correct:1 },
  { q:"What town did Joseph’s family line come from, requiring him to travel there?", a:["Bethlehem","Nazareth","Cana","Tyre"], correct:0 },
  { q:"The angels said ‘Glory to God in the highest’ and what else?", a:["Peace on earth","Joy to the world","Hope for all","Victory is near"], correct:0 },
  { q:"Who baptized Jesus later in life?", a:["Peter","John the Baptist","Paul","Andrew"], correct:1 },
  { q:"How long did Mary and Joseph search before finding young Jesus in the temple?", a:["1 day","2 days","3 days","7 days"], correct:2 },

  { q:"Which of these is NOT a Gospel?", a:["Matthew","Mark","Luke","Leviticus"], correct:3 },
  { q:"In Luke 2, who said Jesus would be ‘a light for revelation to the Gentiles’?", a:["Simeon","Nicodemus","Gamaliel","Caiaphas"], correct:0 },
  { q:"Who was Mary’s relative who was pregnant with John the Baptist?", a:["Elizabeth","Anna","Deborah","Priscilla"], correct:0 },
  { q:"What is Advent traditionally a season of?", a:["Feasting","Preparation","Pilgrimage","Harvest"], correct:1 },
  { q:"What does ‘Nativity’ refer to?", a:["Jesus’ baptism","Jesus’ birth","Jesus’ miracles","Jesus’ resurrection"], correct:1 },

  { q:"Which hymn title matches the angel message to shepherds?", a:["Silent Night","Hark! The Herald Angels Sing","Amazing Grace","Be Thou My Vision"], correct:1 },
  { q:"Which of these is commonly displayed at Christmas to represent the birth of Jesus?", a:["Menorah","Nativity scene","Dreidel","Seder plate"], correct:1 },
  { q:"In the Bible’s Christmas story, who visited first in Luke’s account?", a:["Wise men","Shepherds","Temple priests","Roman soldiers"], correct:1 },
  { q:"What did the angels say to calm the shepherds?", a:["Run!","Do not be afraid","Hide yourselves","Pray louder"], correct:1 },
  { q:"Which gift symbolizes Jesus’ kingship?", a:["Myrrh","Gold","Frankincense","Water"], correct:1 },

  { q:"Which gift is often associated with worship?", a:["Frankincense","Gold","Myrrh","Salt"], correct:0 },
  { q:"Which gift is often associated with burial?", a:["Gold","Frankincense","Myrrh","Silk"], correct:2 },
  { q:"What is the final book of the New Testament?", a:["Jude","Acts","Revelation","Hebrews"], correct:2 },
  { q:"Who wrote many New Testament letters (epistles)?", a:["Paul","Moses","Isaiah","Joshua"], correct:0 },
  { q:"What do many Christians celebrate on Epiphany?", a:["Jesus’ baptism","The visit of the wise men","The Exodus","The Last Supper"], correct:1 },

  { q:"Which carol begins with ‘Joy to the world’?", a:["Joy to the World","O Holy Night","O Come All Ye Faithful","Away in a Manger"], correct:0 },
  { q:"Which phrase is associated with Christmas in Luke 2?", a:["In the beginning","Peace on earth","Let my people go","I am the vine"], correct:1 },
  { q:"What is Christmas Eve?", a:["The night before Christmas Day","The last day of Advent always","A New Year’s holiday","A day after Christmas"], correct:0 },
  { q:"What is a common symbol for Christ as ‘light’?", a:["Candle","Anchor","Fish","Stone"], correct:0 },
  { q:"In Christian tradition, what does the star atop a Christmas tree often represent?", a:["Bethlehem’s star","The sun","A comet","A crown"], correct:0 },

  { q:"Which Old Testament prophet is often linked to a virgin birth prophecy?", a:["Isaiah","Elijah","Jonah","Amos"], correct:0 },
  { q:"What does the word ‘Gospel’ mean?", a:["Good news","New law","Sacred song","Holy nation"], correct:0 },
  { q:"Which holiday celebrates Jesus’ resurrection?", a:["Christmas","Easter","Pentecost","Epiphany"], correct:1 },
  { q:"What is the primary color often used for Advent candles besides purple?", a:["Blue","White","Green","Black"], correct:1 },
  { q:"How many days are in the traditional ‘12 Days of Christmas’?", a:["7","10","12","25"], correct:2 },

  { q:"Which Christmas figure is NOT from the Bible?", a:["Shepherds","Wise men","Herod","Santa Claus"], correct:3 },
  { q:"Which book begins: ‘In the beginning was the Word’?", a:["John","Luke","Mark","Matthew"], correct:0 },
  { q:"The angel who appeared to Mary is commonly named what?", a:["Michael","Gabriel","Raphael","Uriel"], correct:1 },
  { q:"What is the name of the prayer Jesus taught (commonly)?", a:["The Psalm","The Lord’s Prayer","The Covenant","The Blessing"], correct:1 },
  { q:"What does ‘Messiah’ mean?", a:["Teacher","Anointed one","Warrior","Traveler"], correct:1 },

  { q:"What is the first book of the Bible?", a:["Genesis","Exodus","Matthew","Psalms"], correct:0 },
  { q:"Where did Mary and Joseph travel from before Bethlehem?", a:["Nazareth","Jerusalem","Rome","Damascus"], correct:0 },
  { q:"What did the shepherds do after seeing Jesus?", a:["Went home silently","Told others","Fled the country","Built an altar"], correct:1 },
  { q:"Which animal is often (traditionally) shown in nativity scenes though not listed explicitly?", a:["Cats","Cows and donkeys","Eagles","Lions"], correct:1 },
  { q:"Which event is celebrated on Pentecost?", a:["Birth of Jesus","Resurrection","Holy Spirit given","Transfiguration"], correct:2 },

  // --- Christmas cultural trivia (still Christian-friendly) ---
  { q:"What plant is often associated with Christmas and red leaves?", a:["Ivy","Poinsettia","Basil","Clover"], correct:1 },
  { q:"What is ‘caroling’?", a:["Gift wrapping","Singing Christmas songs","Baking bread","Decorating candles"], correct:1 },
  { q:"What’s a ‘manger’?", a:["A throne","A feeding trough","A temple room","A scroll"], correct:1 },
  { q:"Which is a common Christmas greeting among Christians?", a:["Happy Epiphany","Merry Christmas","Blessed Passover","Joyful Lent"], correct:1 },
  { q:"Which night is sometimes called ‘Holy Night’ in songs?", a:["Christmas Eve","New Year’s Eve","Easter Eve","Pentecost Eve"], correct:0 },

  // --- More Bible & Christmas blend ---
  { q:"Who wrote ‘A Charlie Brown Christmas’ emphasis on Luke 2 reading? (character)", a:["Lucy","Linus","Snoopy","Charlie"], correct:1 },
  { q:"Which Psalm is often read at Christmas because it speaks of a shepherd?", a:["Psalm 23","Psalm 1","Psalm 150","Psalm 91"], correct:0 },
  { q:"What does the ‘ICHTHYS’ fish symbol represent?", a:["A holiday meal","Early Christian symbol of Jesus","A Roman sign","A shepherd’s tool"], correct:1 },
  { q:"Which is NOT one of the fruits of the Spirit?", a:["Love","Joy","Patience","Fame"], correct:3 },
  { q:"Which book contains the phrase ‘For unto us a child is born’?", a:["Isaiah","Job","Ruth","Nehemiah"], correct:0 },

  // --- Fill out to 100 with solid, non-controversial, general Christian + Christmas trivia ---
  { q:"Which day is celebrated as the birth of Jesus in most Christian traditions?", a:["December 25","January 1","March 25","April 15"], correct:0 },
  { q:"What is ‘Advent’ in many churches?", a:["A feast day","A season before Christmas","A summer festival","A fast after Easter"], correct:1 },
  { q:"What do many churches do on Christmas Day?", a:["Hold worship services","Ban singing","Close permanently","Only do sports"], correct:0 },
  { q:"Which angel announced Jesus’ birth to shepherds?", a:["An unnamed angel","Gabriel","Michael","Raphael"], correct:0 },
  { q:"In the Nativity story, where did Mary place Jesus?", a:["In a basket","In a manger","In a crib","In a cart"], correct:1 },

  // 100 total: continue with carefully worded questions (no denominational traps)
  { q:"Which is a common title for Jesus?", a:["Prince of Peace","King of Darkness","Lord of Chaos","Master of Coin"], correct:0 },
  { q:"What does ‘Noel’ commonly refer to?", a:["A fast","Christmas","A ship","A prayer rug"], correct:1 },
  { q:"Which book contains the Christmas story most often read in church (shepherds)?", a:["Luke","James","Hebrews","Revelation"], correct:0 },
  { q:"What is a ‘parable’?", a:["A law code","A story with a spiritual lesson","A temple room","A Roman decree"], correct:1 },
  { q:"Which of these is a disciple of Jesus?", a:["Peter","Cyrus","Caesar","Herod"], correct:0 },

  { q:"What is the last meal Jesus shared with His disciples called?", a:["Passover meal / Last Supper","Feast of Weeks","Festival of Lights","Sabbath brunch"], correct:0 },
  { q:"Which is one of the Beatitudes?", a:["Blessed are the meek","Blessed are the famous","Blessed are the wealthy","Blessed are the reckless"], correct:0 },
  { q:"What is the ‘Great Commission’ about?", a:["Building a temple","Making disciples","Collecting taxes","Crowning a king"], correct:1 },
  { q:"What does ‘Amen’ generally mean?", a:["Maybe","So be it / Truly","Goodbye","Hurry"], correct:1 },
  { q:"Which is a common Christmas color symbolizing peace/purity in church decor?", a:["White","Orange","Brown","Neon green"], correct:0 },

  { q:"What is the name of the river where Jesus was baptized?", a:["Jordan River","Nile River","Tigris River","Amazon River"], correct:0 },
  { q:"Which is one of the Ten Commandments?", a:["Do not steal","Do not nap","Do not travel","Do not laugh"], correct:0 },
  { q:"What is the ‘Nativity scene’ also called?", a:["Crèche","Seder","Tabernacle","Reliquary"], correct:0 },
  { q:"Which is a traditional Christmas hymn title?", a:["O Come, All Ye Faithful","Stairway to Heaven","Hotel California","Thunderstruck"], correct:0 },
  { q:"What does ‘Savior’ mean in Christian belief?", a:["A teacher","One who rescues from sin","A soldier","A king’s guard"], correct:1 },

  { q:"Which is a book in the Old Testament?", a:["Psalms","Romans","Galatians","Revelation"], correct:0 },
  { q:"Which is a book in the New Testament?", a:["Romans","Numbers","Isaiah","Proverbs"], correct:0 },
  { q:"What is the ‘Trinity’ commonly described as?", a:["Three gods","One God in three Persons","Two gods","Four spirits"], correct:1 },
  { q:"Which Christian holiday celebrates the coming of the Holy Spirit?", a:["Pentecost","Christmas","Epiphany","Good Friday"], correct:0 },
  { q:"What is Good Friday commemorating?", a:["Jesus’ birth","Jesus’ crucifixion","Jesus’ baptism","Jesus’ first miracle"], correct:1 },

  { q:"What is the main meal associated with communion?", a:["Bread and wine/juice","Fish and honey","Milk and dates","Salt and herbs"], correct:0 },
  { q:"What is a ‘disciple’?", a:["A student/follower","A king","A judge","A soldier"], correct:0 },
  { q:"Which is a common symbol of peace used at Christmas?", a:["Dove","Wolf","Scorpion","Dragon"], correct:0 },
  { q:"What is the first word of the Bible (in English)?", a:["In","God","The","Let"], correct:0 },
  { q:"What is the shortest verse (commonly cited) in the Bible?", a:["Jesus wept","Love is patient","Be still","Pray always"], correct:0 },

  { q:"Which is one of Jesus’ miracles?", a:["Turning water into wine","Splitting the sea","Stopping the sun","Calling fire from heaven"], correct:0 },
  { q:"What does ‘Bethlehem’ traditionally mean?", a:["House of Bread","City of Gold","Mountain of Light","River Town"], correct:0 },
  { q:"Who were the first people to hear about Jesus’ birth in Luke?", a:["Shepherds","Kings","Fishermen","Tax collectors"], correct:0 },
  { q:"Which is a traditional Christmas service held late on Dec 24?", a:["Midnight service","Sunrise vigil","Noon fast","Harvest rite"], correct:0 },
  { q:"What is the color often used for Christmas in church decorations?", a:["Red","Purple","Green","All of the above"], correct:3 },

  // Continue to reach exactly 100
  { q:"Which is a traditional Christmas decoration that represents light?", a:["Candles","Chains","Stones","Sand"], correct:0 },
  { q:"In the Nativity story, what did there seem to be ‘no room’ for?", a:["The angels","The family in the inn","The wise men","The shepherds"], correct:1 },
  { q:"What is ‘worship’?", a:["A type of tax","Honor/reverence to God","A Roman law","A meal"], correct:1 },
  { q:"Which of these is a Christmas Gospel reading sometimes used?", a:["John 1","Exodus 12","Judges 7","Nahum 3"], correct:0 },
  { q:"What is a ‘psalm’?", a:["A song/prayer","A weapon","A city","A tax"], correct:0 },

  { q:"Which symbol often represents Jesus’ sacrifice?", a:["Cross","Crown","Anchor","Star"], correct:0 },
  { q:"What does ‘grace’ commonly mean in Christian context?", a:["Unearned favor","Strict rules","Bad luck","A type of food"], correct:0 },
  { q:"Which is a Christian virtue?", a:["Faith","Envy","Greed","Pride"], correct:0 },
  { q:"Which New Testament book is primarily letters to churches?", a:["Epistles","Genesis","Psalms","Judges"], correct:0 },
  { q:"What is ‘Scripture’?", a:["Sacred writings","A holiday tree","A bell","A manger"], correct:0 },

  { q:"Which is a common phrase from Christmas carols about Jesus?", a:["Born to set Thy people free","Born to conquer Rome","Born to end winter","Born to ban music"], correct:0 },
  { q:"What is the ‘incarnation’?", a:["God taking on human flesh in Jesus","A census","A temple tax","A Roman parade"], correct:0 },
  { q:"Which of these is a Christian holiday season after Easter?", a:["Lent","Advent","Pentecost season","Hanukkah"], correct:2 },
  { q:"In Christian belief, why is Jesus called ‘Lamb of God’?", a:["He was a shepherd","He symbolizes sacrifice","He lived in a barn","He wore wool"], correct:1 },
  { q:"Which is a Christmas-themed Bible concept?", a:["Hope","Despair","Revenge","Chaos"], correct:0 },

  { q:"What is ‘peace’ often paired with in Christmas greetings?", a:["Goodwill","Rivalry","Judgment","Silence"], correct:0 },
  { q:"What is a ‘prophecy’?", a:["A future-telling message","A kind of bread","A tax rule","A shepherd’s tool"], correct:0 },
  { q:"Which group visited baby Jesus in Matthew?", a:["Magi/wise men","Roman guards","Fishermen","Tax collectors"], correct:0 },
  { q:"What is a ‘parable’ used for?", a:["To confuse on purpose","To teach spiritual truth","To count money","To build temples"], correct:1 },
  { q:"Which is a common Christmas dessert?", a:["Fruitcake","Sushi","Tacos","Curry"], correct:0 },

  { q:"Which book contains ‘The Lord is my shepherd’?", a:["Psalms","Romans","Revelation","Judges"], correct:0 },
  { q:"Which Christian symbol is often used on Christmas cards?", a:["Star","Skull","Sword","Storm"], correct:0 },
  { q:"What is the main theme of Christmas in Christianity?", a:["Jesus’ birth","A harvest","A war victory","A census"], correct:0 },
  { q:"What is a ‘carol’?", a:["A Christmas song","A candle","A meal","A book"], correct:0 },
  { q:"Which is a traditional Christmas plant used in wreaths?", a:["Holly","Cactus","Oak","Bamboo"], correct:0 },

  { q:"What is a ‘wreath’ often symbolizing at Christmas?", a:["Endless life/eternity","A battle","A tax","A storm"], correct:0 },
  { q:"What are ‘shepherds’?", a:["Teachers","People who care for sheep","Kings","Builders"], correct:1 },
  { q:"What is ‘Bethlehem’ known for in the Christmas story?", a:["Jesus’ birthplace","The temple","A Roman palace","A sea port"], correct:0 },
  { q:"Which is a traditional Christmas color for celebration?", a:["Green","Blue","Red","All of the above"], correct:3 },
  { q:"What is the ‘Gospel of Luke’?", a:["A New Testament book","An Old Testament book","A proverb collection","A Roman record"], correct:0 },

  { q:"In the Christmas story, what did the angels bring?", a:["A sword","Good news","A crown","A decree"], correct:1 },
  { q:"Which is a common Christmas tradition in many churches?", a:["Singing carols","Banning candles","Only silence","No gatherings"], correct:0 },
  { q:"What does ‘joy’ mean?", a:["Deep gladness","Anger","Fear","Boredom"], correct:0 },
  { q:"Which is a Christmas symbol often representing Jesus as light?", a:["Candle","Hammer","Chain","Stone"], correct:0 },
  { q:"What is ‘worship’ directed toward?", a:["God","Weather","Money","Fame"], correct:0 }
];

// Ensure exactly 100 (in case of edits)
if (QUESTION_POOL.length !== 100) {
  console.warn("QUESTION_POOL length is", QUESTION_POOL.length, "— expected 100.");
}

// -------------------- Utility --------------------

function hideAllModals(){
  hide(winModal);
  hide(loseModal);
  copyStatus.textContent = "";
}


function showScreen(screen){
  hideAllModals(); // ALWAYS clear popups when changing screens
  introScreen.classList.remove("active");
  titleScreen.classList.remove("active");
  gameScreen.classList.remove("active");
  screen.classList.add("active");
}

function show(el){ el.classList.add("show"); el.setAttribute("aria-hidden","false"); }
function hide(el){ el.classList.remove("show"); el.setAttribute("aria-hidden","true"); }

function setMusicState(on){
  musicOn = on;
  muteBtn.textContent = `Music: ${musicOn ? "On" : "Off"}`;
}
async function startMusic(){
  try{
    if (bgm.paused) await bgm.play();
    setMusicState(true);
  }catch{
    setMusicState(false);
  }
}
function stopMusic(){
  try{ bgm.pause(); }catch{}
  setMusicState(false);
}

function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function updateHUD(){
  qCountEl.textContent = `${qIndex+1}/${QUESTIONS_PER_RUN}`;
  timeLeftEl.textContent = String(timeLeft);
  missesEl.textContent = `${misses}/4`;
}

function setFeedback(text, kind=""){
  feedbackEl.textContent = text;
  feedbackEl.style.color =
    kind === "ok" ? "rgba(124,255,161,.95)" :
    kind === "bad" ? "rgba(255,107,107,.95)" :
    "rgba(255,255,255,.85)";
}

function lockAnswers(value){
  locked = value;
  [...document.querySelectorAll(".answerBtn")].forEach(b => b.disabled = value);
}

// -------------------- Game Flow --------------------
function startRun(){
  hideAllModals();
  misses = 0;
  qIndex = 0;

  runQuestions = shuffle(QUESTION_POOL).slice(0, QUESTIONS_PER_RUN);

  showScreen(gameScreen);
  loadQuestion();
}


function loadQuestion(){
  lockAnswers(true);
  clearInterval(timer);

  timeLeft = TIME_PER_Q;
  updateHUD();
  timeBar.style.width = "100%";

  const q = runQuestions[qIndex];
  questionText.textContent = q.q;

  // Build answers shuffled but keep correct tracking
  const answerObjs = q.a.map((txt, idx) => ({ txt, idx }));
  const shuffledAnswers = shuffle(answerObjs);

  answersWrap.innerHTML = "";
  shuffledAnswers.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "answerBtn";
    btn.type = "button";
    btn.textContent = opt.txt;
    btn.addEventListener("click", () => chooseAnswer(opt.idx, btn, q.correct));
    answersWrap.appendChild(btn);
  });

  setFeedback("Pick an answer.");
  lockAnswers(false);

  timer = setInterval(() => {
    timeLeft -= 1;
    updateHUD();
    timeBar.style.width = `${Math.max(0, (timeLeft / TIME_PER_Q) * 100)}%`;

    if(timeLeft <= 0){
      clearInterval(timer);
      onMiss("Too slow.");
    }
  }, 1000);
}

function chooseAnswer(chosenIdx, btn, correctIdx){
  if(locked) return;
  lockAnswers(true);
  clearInterval(timer);

  if(chosenIdx === correctIdx){
    btn.classList.add("correct");
    setFeedback("Correct.", "ok");
    nextStep(true);
  } else {
    btn.classList.add("wrong");
    onMiss("Incorrect.");
  }
}

function onMiss(reason){
  misses += 1;
  updateHUD();
  setFeedback(`${reason} Miss added.`, "bad");

  // Lose immediately on the 4th miss (including if it's the last question)
  if (misses >= LOSE_AT_MISSES){
    endLose("Too many misses.");
    return;
  }

  nextStep(false);
}


function nextStep(){
  setTimeout(() => {
    qIndex += 1;

    // If we just finished the 7th question, decide win/lose here too.
    if (qIndex >= QUESTIONS_PER_RUN){
      if (misses >= LOSE_AT_MISSES){
        endLose("Too many misses.");
      } else {
        endWin();
      }
      return;
    }

    loadQuestion();
  }, 850);
}

function endWin(){
  clearInterval(timer);
  show(winModal);
  copyStatus.textContent = "";
}

function endLose(reason){
  clearInterval(timer);
  loseReason.textContent = reason;
  show(loseModal);
}

// -------------------- Copy --------------------
async function copyToClipboard(text){
  if(navigator.clipboard && navigator.clipboard.writeText){
    await navigator.clipboard.writeText(text);
    return true;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(ta);
  return ok;
}

// -------------------- Events --------------------
startChallengeBtn.addEventListener("click", async () => {
  await startMusic();              // music starts here
  showScreen(titleScreen);
});

playBtn.addEventListener("click", () => startRun());

muteBtn.addEventListener("click", async () => {
  if(musicOn) stopMusic();
  else await startMusic();
});

restartBtn.addEventListener("click", () => startRun());

copyBtn.addEventListener("click", async () => {
  try{
    const ok = await copyToClipboard(PASSCODE);
    copyStatus.textContent = ok ? "Copied to clipboard." : "Copy failed — select and copy manually.";
  }catch{
    copyStatus.textContent = "Copy failed — select and copy manually.";
  }
});

playAgainBtn.addEventListener("click", () => {
  hideAllModals();
  startRun();
});

tryAgainBtn.addEventListener("click", () => {
  hideAllModals();
  startRun();
});

backBtn.addEventListener("click", () => {
  hideAllModals();
  showScreen(titleScreen);
});


// Boot
showScreen(introScreen);
setMusicState(false);
