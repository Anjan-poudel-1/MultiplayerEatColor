class LoadingScreen extends Phaser.Scene {
    constructor() {
        super("Preload");
    }
    preload() {
        let loadingBar = this.add.graphics({
            fillStyle: {
                color: 0xffffff,
            },
        });
        this.load.on("progress", (percent) => {
            console.log(percent);

            let _width = 0;
            _width = config.width * percent - 200;
            if (_width < 0) {
                _width = 0;
            }

            loadingBar.fillRect(100, config.height / 2, _width, 40);
        });

        this.load.on("complete", () => {
            this.scene.start("GameScreen");
        });

        //Load images
        this.load.image("bg", "assets/images/bg.jpg");
        this.load.image("player_img", "assets/images/player.png");
        this.load.image("greenball", "assets/images/eatball.png");
        this.load.image("redball", "assets/images/dangerball.png");
        this.load.image("barrior", "assets/images/barrior.png");

        //Load audios
        this.load.audio("theme_audio", "assets/audio/bg.mp3");
        this.load.audio("eat_audio", "assets/audio/eat.wav");
        this.load.audio("hurt_audio", "assets/audio/hurt.mp3");
        this.load.audio("countdown_audio", "assets/audio/countdown.wav");
    }

    create() {}
}
