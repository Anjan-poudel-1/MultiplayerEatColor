const config = {
    type: Phaser.Auto,
    height: 600,
    width: 1000,
    parent: "eat-that-color",
    title: "Eat the color",
    dom: {
        createContainer: true,
    },
    scene: [LoadingScreen, JoinRoom, GameScreen, FinalScore],
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
        },
    },

    plugins: {
        scene: [
            {
                key: "rexuiplugin",
                url: "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js",
                sceneKey: "rexUI",
            },
            // ...
        ],
    },
};

var game = new Phaser.Game(config);
