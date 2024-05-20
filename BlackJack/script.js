const app = new PIXI.Application({
    backgroundColor: 0x008000,
    width: window.innerWidth,
    height: window.innerHeight,
    resizeTo: window
});

document.getElementById('game-container').appendChild(app.view);

window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
});

class Card {
    constructor(suit, value) {
        this.container = new PIXI.Container();
        this.suit = suit;
        this.value = value;
        this.createCardGraphics();
    }

    createCardGraphics() {
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

class BlackjackGame {
    constructor() {
        this.playerHand = [];
        this.dealerHand = [];
        this.playerScore = 0;
        this.dealerScore = 0;
        this.dealerCardHidden = true;
        this.hiddenCard = new PIXI.Graphics();
        this.playerMoney = 20000;
        this.initUI();
    }

    initUI() {
        this.scoreDisplay = document.createElement('div');
        this.scoreDisplay.id = 'score-display';

        this.playerScoreInput = document.createElement('input');
        this.playerScoreInput.type = 'text';
        this.playerScoreInput.readOnly = true;
        this.playerScoreInput.placeholder = 'Player Score';

        this.dealerScoreInput = document.createElement('input');
        this.dealerScoreInput.type = 'text';
        this.dealerScoreInput.readOnly = true;
        this.dealerScoreInput.placeholder = 'Dealer Score';

        this.resultMessage = document.createElement('p');
        this.resultMessage.id = 'result-message';

        this.scoreDisplay.appendChild(this.dealerScoreInput);
        this.scoreDisplay.appendChild(this.resultMessage);
        this.scoreDisplay.appendChild(this.playerScoreInput);

        document.body.appendChild(this.scoreDisplay);

        this.buttonContainer = document.createElement('div');
        this.buttonContainer.id = 'button-container';

        this.playerMoneyInput = document.createElement('input');
        this.playerMoneyInput.type = 'text';
        this.playerMoneyInput.readOnly = true;
        this.playerMoneyInput.placeholder = 'Money';

        this.dealButton = document.createElement('button');
        this.dealButton.textContent = 'Deal';
        this.dealButton.addEventListener('click', () => {
            this.resetGame();
            this.dealStartingHand();
        });

        this.hitButton = document.createElement('button');
        this.hitButton.textContent = 'Hit';
        this.hitButton.addEventListener('click', () => {
            this.hit();
        });

        this.standButton = document.createElement('button');
        this.standButton.textContent = 'Stand';
        this.standButton.addEventListener('click', () => {
            this.stand();
        });

        this.buttonContainer.appendChild(this.playerMoneyInput);
        this.buttonContainer.appendChild(this.dealButton);
        this.buttonContainer.appendChild(this.hitButton);
        this.buttonContainer.appendChild(this.standButton);

        document.body.appendChild(this.buttonContainer);

        this.getPlayerMoney();
        console.log(localStorage.getItem('playerMoney'));
        this.dealStartingHand();
    }

    resetGame() {
        this.playerHand.length = 0;
        this.dealerHand.length = 0;
        this.playerScore = 0;
        this.dealerScore = 0;
        app.stage.removeChildren();
    }

    dealCard(hand, isPlayer) {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = Array.from({ length: 13 }, (_, i) => i + 1);
        const deck = suits.flatMap(suit => values.map(value => ({ suit, value })));

        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        let card;
        do {
            card = deck.pop();
        } while (hand.some(c => c.suit === card.suit && c.value === card.value));

        const newCard = new Card(card.suit, card.value);
        hand.push(newCard);

        if (!isPlayer && hand.length === 2) {
            this.hiddenCard.beginFill(0x000000);
            this.hiddenCard.drawRect(0, 0, newCard.container.width, newCard.container.height);
            this.hiddenCard.endFill();
            this.dealerHand[0].container.addChild(this.hiddenCard);
        }

        app.stage.addChild(newCard.container);

        const playerOffset = app.screen.height / 2 + 100;
        const dealerOffset = app.screen.height / 2 - 250;
        const offset = isPlayer ? playerOffset : dealerOffset;
        const cardPositionX = (app.screen.width / 2) - (hand.length - 1) * 60;
        newCard.container.position.set(cardPositionX, offset);

        this.calculateScore(hand, isPlayer);
    }

    calculateScore(hand, isPlayer) {
        let score = 0;
        let aceCount = 0;

        for (const card of hand) {
            if (card.value === 1) {
                score += 1;
                aceCount++;
            } else if (card.value <= 10) {
                score += card.value;
            } else {
                score += 10;
            }
        }

        for (let i = 0; i < aceCount; i++) {
            if (score + 10 <= 21) {
                score += 10;
            }
        }

        if (isPlayer) {
            this.playerScore = score;
        } else {
            this.dealerScore = score;
        }

        setTimeout(() => this.updateScoreDisplay(), 10);
    }

    dealStartingHand() {
        if (this.playerMoney >= 500) {
            this.addPlayerMoney(-500);
            this.dealCard(this.playerHand, true);
            this.dealCard(this.playerHand, true);
            this.dealCard(this.dealerHand, false);
            this.dealCard(this.dealerHand, false);
            this.dealerCardHidden = true;
            this.hitButton.disabled = false;
            this.standButton.disabled = false;
            this.dealButton.disabled = true;
            this.checkBlackjack();
        } else {
            alert("Not enough money! Loser~");
        }
    }

    hit() {
        this.dealCard(this.playerHand, true);
        this.checkBust(this.playerHand);
    }

    stand() {
        this.dealerHand[0].container.removeChild(this.hiddenCard);
        this.dealerCardHidden = false;
        while (this.dealerScore < 17) {
            this.dealCard(this.dealerHand, false);
            this.calculateScore(this.dealerHand, false);
        }
        this.checkWinner();
    }

    checkBlackjack() {
        if (this.playerHand.length === 2 && this.playerScore === 21) {
            this.displayMessage("Blackjack! You Win $1500!", true);
            this.addPlayerMoney(1500);
            this.hitButton.disabled = true;
            this.standButton.disabled = true;
            this.dealButton.disabled = false;
        }
        return;
    }

    checkBust(hand) {
        this.calculateScore(hand, hand === this.playerHand);
        if (this.playerScore > 21) {
            this.dealerHand[0].container.removeChild(this.hiddenCard);
            this.dealerCardHidden = false;
            this.displayMessage("You Bust! Dealer Wins!", false);
            this.hitButton.disabled = true;
            this.standButton.disabled = true;
            this.dealButton.disabled = false;
        }
    }

    checkWinner() {
        if (this.playerScore > 21) {
            return;
        }
        this.dealerHand[0].container.removeChild(this.hiddenCard);
        this.dealerCardHidden = false;
        if (this.dealerScore > 21) {
            this.displayMessage("Dealer Bust! You Win $1000!", true);
            this.addPlayerMoney(1000);
        } else if (this.playerScore > this.dealerScore) {
            this.displayMessage("You Win $1000!", true);
            this.addPlayerMoney(1000);
        } else if (this.playerScore === this.dealerScore) {
            this.displayMessage("Push! Tie Game", true);
            this.addPlayerMoney(500);
        } else {
            this.displayMessage("Dealer Wins!", false);
        }
        this.updateScoreDisplay();
        this.hitButton.disabled = true;
        this.standButton.disabled = true;
        this.dealButton.disabled = false;
    }

    displayMessage(msg, color) {
        setTimeout(() => this.resultMessage.textContent = msg, 15);
        this.resultMessage.style.color = color ? 'green' : 'red';
    }

    updateScoreDisplay() {
        this.playerScoreInput.value = `Player Score: ${this.playerScore}`;
        if (this.dealerHand.length > 1) {
            if (this.dealerCardHidden) {
                let hiddenCardValue;
                if (this.dealerHand[0].value > 10) {
                    hiddenCardValue = this.dealerScore - 10;
                    this.dealerScoreInput.value = `Dealer Score: ${hiddenCardValue}`;
                } else if (this.dealerHand[0].value === 1) {
                    if (this.dealerHand[1].value === 1) {
                        hiddenCardValue = 11;
                        this.dealerScoreInput.value = `Dealer Score: ${hiddenCardValue}`;
                    } else {
                        hiddenCardValue = this.dealerScore - 11;
                        this.dealerScoreInput.value = `Dealer Score: ${hiddenCardValue}`;
                    }
                } else {
                    const hiddenCardValue = this.dealerScore - this.dealerHand[0].value;
                    this.dealerScoreInput.value = `Dealer Score: ${hiddenCardValue}`;
                }
            } else {
                this.dealerScoreInput.value = `Dealer Score: ${this.dealerScore}`
            }
        } else {
            this.dealerScoreInput.value = `Dealer Score: ?`;
        }
        this.resultMessage.textContent = '';
    }

    getPlayerMoney() {
        const storedMoney = localStorage.getItem('playerMoney');
        this.playerMoney = storedMoney ? parseInt(storedMoney) : 20000;
        this.playerMoneyInput.value = `Money: $${this.playerMoney}`;
    }

    addPlayerMoney(amount) {
        this.playerMoney += amount;
        this.playerMoneyInput.value = `Money: $${this.playerMoney}`;
        localStorage.setItem('playerMoney', this.playerMoney);
    }
}

const blackjackGame = new BlackjackGame();

