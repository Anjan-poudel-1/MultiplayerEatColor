class FinalScore extends Phaser.Scene {
    constructor() {
        super("FinalScore");
    }

    init(data) {
        this.score = data.score;
    }

    preload() {}

    create() {
        var graphics = this.add.graphics();
        graphics.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x00000, 0.7);
        graphics.fillRect(
            config.width / 2 - 250,
            config.height / 2 - 150,
            500,
            300
        );

        let player1Score = "Player1 Score : " + this.score;
        let player2Score = "Player2 Score : " + this.score;

        this.scoreText = this.add.text(
            config.width / 2 - 80,
            config.height / 2 - 50,
            myScoreText,
            { font: "32px Arial", fill: "#fff" }
        );

        this.restartText = this.add.text(
            config.width / 2 - 80,
            config.height / 2 + 50,
            "Restart Game",
            { font: "24px Arial", fill: "#fff" }
        );
        this.restartText.setInteractive();

        this.restartText.on("pointerup", () => {
            this.scene.start("Game");
        });
    }
}
