const app = new PIXI.Application({
  backgroundColor: 0x008000,
  width: window.innerWidth,
  height: window.innerHeight,
});

document.getElementById('game-container').appendChild(app.view);

class Card {
  constructor(suit, value) {
    this.container = new PIXI.Container();
    this.suit = suit;
    this.value = value;

    const cardSprite = new PIXI.Graphics();
	cardSprite.lineStyle(1, 0x000000);
    cardSprite.beginFill(0xffffff);
    cardSprite.drawRect(0, 0, 100, 150);
    cardSprite.endFill();

    const valueText = new PIXI.Text(this.getDisplayValue(), {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: this.suit === 'hearts' || this.suit === 'diamonds' ? 0xff0000 : 0x000000,
    });
    valueText.position.set(70, 10);

    const suitIcon = new PIXI.Text(this.getSuitIcon(), {
      fontFamily: 'Arial',
      fontSize: 48,
      fill: this.suit === 'hearts' || this.suit === 'diamonds' ? 0xff0000 : 0x000000,
    });
    suitIcon.anchor.set(0.5);
    suitIcon.position.set(50, 75);

    this.container.addChild(cardSprite, valueText, suitIcon);
  }

  getDisplayValue() {
    if (this.value === 1) {
      return 'A';
    } else if (this.value <= 10) {
      return this.value.toString();
    } else {
      return ['J', 'Q', 'K'][this.value - 11];
    }
  }

  getSuitIcon() {
    switch (this.suit) {
      case 'hearts':
        return '♥';
      case 'diamonds':
        return '♦';
      case 'clubs':
        return '♣';
      case 'spades':
        return '♠';
    }
  }
}

const playerHand = [];
const dealerHand = [];
let playerScore = 0;
let dealerScore = 0;
var dealerCardHidden = true;
const hiddenCard = new PIXI.Graphics();
let playerMoney = 20000;

function dealCard(hand, isPlayer) {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  for (let i = suits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [suits[i], suits[j]] = [suits[j], suits[i]];
  }
  let suit, value;

  do {
    suit = suits[Math.floor(Math.random() * 4)];
    value = Math.floor(Math.random() * 13) + 1;
  } while (hand.some(card => card.suit === suit && card.value === value));

  const card = new Card(suit, value);
  hand.push(card);
  
  if (!isPlayer && hand.length === 2) {
    hiddenCard.beginFill(0x000000);
    hiddenCard.drawRect(0, 0, card.container.width, card.container.height);
    hiddenCard.endFill();
    dealerHand[0].container.addChild(hiddenCard);
  }
  
  app.stage.addChild(card.container);

  const offset = isPlayer ? app.screen.height - 250 : 50;
  card.container.position.set(app.screen.width / 2 - (hand.length - 1) * 60, offset);

  calculateScore(hand, isPlayer);
}

function calculateScore(hand, isPlayer) {
  let score = 0;
  for (const card of hand) {
	if (card.value === 1) {
	  if (score <= 10) {
		score += 11;
	  } else {
		score += 1;
	  }
	} else if (card.value <= 10) {
	  score += card.value;
	} else {
	  score += 10;
	}
  }
  if (isPlayer) {
    playerScore = score;
  } else {
    dealerScore = score;
  }
  setTimeout(() => updateScoreDisplay(), 10)
}

function dealStartingHand() {
  if (playerMoney >= 500) {
	addPlayerMoney(-500);
	dealCard(playerHand, true);
	dealCard(playerHand, true);
	dealCard(dealerHand, false);
	dealCard(dealerHand, false);
	dealerCardHidden = true;
	hitButton.disabled = false;
	standButton.disabled = false;
	dealButton.disabled = true;
	checkBlackjack();
  } else {
	alert("Not enough money! Loser~");
  }
}

function hit() {
  dealCard(playerHand, true);
  checkBust(playerHand);
}

function stand() {
  dealerHand[0].container.removeChild(hiddenCard);
  dealerCardHidden = false;
  while (dealerScore < 17) {
    dealCard(dealerHand, false);
    calculateScore(dealerHand, false);
  }
  checkWinner();
}

function checkBlackjack() {
  if (playerHand.length === 2 && playerScore === 21) {
    displayMessage("Blackjack! You Win $1500!", true);
	addPlayerMoney(1500);
    hitButton.disabled = true;
    standButton.disabled = true;
	dealButton.disabled = false;
  }
  return;
}

function checkBust(hand) {
  calculateScore(hand, hand === playerHand);
  if (playerScore > 21) {
	dealerHand[0].container.removeChild(hiddenCard);
	dealerCardHidden = false;
    displayMessage("You Bust! Dealer Wins!", false);
    hitButton.disabled = true;
    standButton.disabled = true;
	dealButton.disabled = false;
  }
}

function checkWinner() {
  if (playerScore > 21) {
    return;
  }
  dealerHand[0].container.removeChild(hiddenCard);
  dealerCardHidden = false;
  if (dealerScore > 21) {
    displayMessage("Dealer Bust! You Win $1000!", true);
	addPlayerMoney(1000);
  } else if (playerScore > dealerScore) {
    displayMessage("You Win $1000!", true);
	addPlayerMoney(1000);
  } else if (playerScore === dealerScore) {
    displayMessage("Push! Tie Game", true);
	addPlayerMoney(500);
  } else {
    displayMessage("Dealer Wins!", false);
  }
  updateScoreDisplay();
  hitButton.disabled = true;
  standButton.disabled = true;
  dealButton.disabled = false;
}

function displayMessage(msg, color) {
  setTimeout(() => resultMessage.textContent = msg, 15);
  resultMessage.style.color = color ? 'green' : 'red';
}

function updateScoreDisplay() {
  playerScoreInput.value = `Player Score: ${playerScore}`;
  if (dealerHand.length > 1) {
	if (dealerCardHidden) {
	  let hiddenCardValue;
	  if (dealerHand[0].value > 10) {
		hiddenCardValue = dealerScore - 10;
		dealerScoreInput.value = `Dealer Score: ${hiddenCardValue}`;
	  } else if (dealerHand[0].value === 1) {
		if (dealerHand[1].value === 1) {
		  hiddenCardValue = 11;
		  dealerScoreInput.value = `Dealer Score: ${hiddenCardValue}`;
		} else {
		  hiddenCardValue = dealerScore - 11;
		  dealerScoreInput.value = `Dealer Score: ${hiddenCardValue}`;
		}
	  } else {
		const hiddenCardValue = dealerScore - dealerHand[0].value;
		dealerScoreInput.value = `Dealer Score: ${hiddenCardValue}`;
	  }
	} else {
	  dealerScoreInput.value = `Dealer Score: ${dealerScore}`
	}
  } else {
    dealerScoreInput.value = `Dealer Score: ?`;
  }
  resultMessage.textContent = '';
}

function getPlayerMoney() {
  const storedMoney = localStorage.getItem('playerMoney');
  playerMoney = storedMoney ? parseInt(storedMoney) : 20000;
  playerMoneyInput.value = `Money: $${playerMoney}`;
}

function addPlayerMoney(amount) {
  playerMoney += amount;
  playerMoneyInput.value = `Money: $${playerMoney}`;
  localStorage.setItem('playerMoney', playerMoney);
}

const scoreDisplay = document.createElement('div');
scoreDisplay.id = 'score-display';

const playerScoreInput = document.createElement('input');
playerScoreInput.type = 'text';
playerScoreInput.readOnly = true;
playerScoreInput.placeholder = 'Player Score';

const dealerScoreInput = document.createElement('input');
dealerScoreInput.type = 'text';
dealerScoreInput.readOnly = true;
dealerScoreInput.placeholder = 'Dealer Score';

const resultMessage = document.createElement('p');
resultMessage.id = 'result-message';

scoreDisplay.appendChild(dealerScoreInput);
scoreDisplay.appendChild(resultMessage);
scoreDisplay.appendChild(playerScoreInput);

document.body.appendChild(scoreDisplay);

const buttonContainer = document.createElement('div');
buttonContainer.id = 'button-container';

const playerMoneyInput = document.createElement('input');
playerMoneyInput.type = 'text';
playerMoneyInput.readOnly = true;
playerMoneyInput.placeholder = 'Money';

const dealButton = document.createElement('button');
dealButton.textContent = 'Deal';
dealButton.addEventListener('click', () => {
  playerHand.length = 0;
  dealerHand.length = 0;
  playerScore = 0;
  dealerScore = 0;
  app.stage.removeChildren();
  dealStartingHand();
});

const hitButton = document.createElement('button');
hitButton.textContent = 'Hit';
hitButton.addEventListener('click', () => {
  hit();
});

const standButton = document.createElement('button');
standButton.textContent = 'Stand';
standButton.addEventListener('click', () => {
  stand();
});

buttonContainer.appendChild(playerMoneyInput);
buttonContainer.appendChild(dealButton);
buttonContainer.appendChild(hitButton);
buttonContainer.appendChild(standButton);

document.body.appendChild(buttonContainer);

getPlayerMoney();
console.log(localStorage.getItem('playerMoney'));
dealStartingHand();