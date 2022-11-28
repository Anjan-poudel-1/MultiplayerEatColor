class GameScreen extends Phaser.Scene {
    constructor() {
        super("GameScreen");
    }

    init() {}
    preload() {}

    create() {
        //Load assets

        this.firstPosition = config.width / 4;
        this.secondPosition = config.width / 1.3;
        this.bg = this.add.tileSprite(0, 0, config.width, config.height, "bg");

        this.bg.setOrigin(0, 0);
        this.barrior = this.physics.add.staticSprite(
            config.width / 2,
            config.height / 2,
            "barrior"
        );
        this.theme_audio = this.sound.add("theme_audio", {
            volume: 0.5,
            loop: true,
        });

        this.eat_audio = this.sound.add("eat_audio");
        this.hurt_audio = this.sound.add("hurt_audio");

        this.theme_audio.play();

        //Scores
        //Score
        this.score = 0;
        let style = { font: "20px Arial", fill: "#fff" };
        this.scoreTextPlayer1 = this.add.text(16, 16, "Score: 0", style);
        this.scoreTextPlayer2 = this.add.text(
            config.width - 150,
            16,
            "Score: 0",
            style
        );

        //Timer text
        this.timerText = this.add.text(
            config.width / 2 + 20,
            16,
            "Time : 60 Sec",
            style
        );

        //Socket initiate
        this.socket = io();
        var self = this;

        // this.socket.emit('createRoom', 'room1');

        this.gameStopped = false;

        //For other Players
        this.otherPlayers = this.physics.add.group();

        //Lidtening to the "CurrentPlayers" event .... for creating otherPlayers in the game ... this is for the new player
        this.socket.on("currentPlayers", function (players) {
            Object.keys(players).forEach(function (id) {
                console.log(players[id].playerId, self.socket.id);
                if (players[id].playerId === self.socket.id) {
                    self.addPlayer(self, players[id]);
                } else {
                    //If other player
                    self.addOtherPlayer(self, players[id]);
                }
            });
        });

        //For telling all players about the new incoming player

        this.socket.on("newPlayer", function (playerInfo) {
            self.addOtherPlayer(self, playerInfo);
        });

        //When anyplayer disconnects

        this.socket.on("playerDisconnected", function (playerId) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerId === otherPlayer.playerId) {
                    otherPlayer.destroy();
                    this.timerText.setText("Time : ---");
                }
                //pause everything./..../.././././/
            });
        });

        this.socket.on("playerMoved", function (playerInfo) {
            // console.log(playerInfo.playerId);

            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    otherPlayer.x = playerInfo.xPosition;
                }
            });
            console.log("Reachged here");
        });
        this.socket.on("timeLeft", function (_time) {
            self.timerText.setText(`Time : ${_time} Sec`);
        });

        this.socket.on("ballDropped", function (_x, _isGreen, players) {
            let _isFirstMine = false;
            Object.keys(players).forEach(function (id) {
                if (
                    players[id].playerId === self.socket.id &&
                    players[id].isFirstPlayer
                ) {
                    console.log("I am first player");
                    _isFirstMine = true;
                }
            });
            var ball = new Ball(self, _x, _isGreen, _isFirstMine);
        });

        this.socket.on("scoreUpdated", function (_scores) {
            self.scoreTextPlayer1.setText(`Score: ${_scores.player1}`);
            self.scoreTextPlayer2.setText(`Score: ${_scores.player2}`);
        });

        this.socket.on("stopGame", function () {
            self.physics.pause();
            // self.player.input.enable = false;
            this.gameStopped = true;
        });

        //Balls
        this.ballsToEat = this.add.group();
        this.othersBall = this.add.group();

        //collide with ball here
    }

    addPlayer(self, playerInfo) {
        self.player = self.physics.add
            .sprite(
                playerInfo.isFirstPlayer
                    ? this.firstPosition
                    : this.secondPosition,
                config.height,
                "player_img"
            )
            .setScale(0.7);
        self.player.setCollideWorldBounds(true);
        self.player.setInteractive();
        // self.player.input.enable = true;
        self.player.setOrigin(0.5, 1);
        self.input.setDraggable(self.player);

        self.input.dragDistanceThreshold = 16;
        this.input.on("drag", function (pointer, player, dragX, dragY) {
            if (
                (playerInfo.isFirstPlayer && dragX > config.width / 2 - 35) ||
                (!playerInfo.isFirstPlayer && dragX < config.width / 2 + 35) ||
                dragY < 30
            ) {
                return;
            }

            player.x = dragX;

            // player.y = dragY;
        });
    }

    addOtherPlayer(self, playerInfo) {
        const otherPlayer = self.physics.add
            .sprite(
                playerInfo.isFirstPlayer
                    ? this.firstPosition
                    : this.secondPosition,
                config.height,
                "player_img"
            )
            .setScale(0.7)
            .setAlpha(0.7);

        otherPlayer.setTint(0xff0000);
        otherPlayer.setCollideWorldBounds(true);
        otherPlayer.setOrigin(0, 1);
        otherPlayer.playerId = playerInfo.playerId;
        self.otherPlayers.add(otherPlayer);
    }

    eatBalls(player, ball) {
        console.log("Hit");
        ball.destroy();

        if (ball.texture.key === "redball") {
            this.hurt_audio.play();
            this.score -= 25;
        } else {
            this.eat_audio.play();
            this.score += 10;
        }
        this.socket.emit("ballCollected", this.score);
        // this.scoreTextPlayer1.setText("Score: " + this.score);

        // console.log(ball);
    }

    update() {
        if (this.player && !this.gameStopped) {
            var xPosition = this.player.body.x;

            this.physics.add.overlap(
                this.player,
                this.ballsToEat,
                this.eatBalls,
                null,
                this
            );

            if (
                this.player.oldPosition &&
                xPosition !== this.player.oldPosition.x
            ) {
                // console.log("Moved player, ", xPosition);

                this.socket.emit("trackPlayerMovement", xPosition);
            }

            this.player.oldPosition = {
                x: xPosition,
            };

            for (var i = 0; i < this.ballsToEat.getChildren().length; i++) {
                var ballToDestroy = this.ballsToEat.getChildren()[i];
                ballToDestroy.destroyBalls(30);
            }
            for (var i = 0; i < this.othersBall.getChildren().length; i++) {
                var ballToDestroy = this.othersBall.getChildren()[i];
                ballToDestroy.destroyBalls(60);
            }
        }
    }
}
