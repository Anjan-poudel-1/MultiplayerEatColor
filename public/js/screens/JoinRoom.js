class JoinRoom extends Phaser.Scene {
    constructor() {
        super("JoinRoom");
    }

    init() {}

    preload() {}

    create() {
        // var graphics = this.add.graphics();
        // graphics.fillGradientStyle(0xffffff, 0xffffff, 0xffffff, 0xffffff, 0.7);
        // graphics.fillRect(250, 150, 500, 300);

        var joinElement = this.add.dom(500, 0).createFromCache("joinForm");

        console.log(joinElement);
        // this.add.dom(100, 100).createFromHTML(joinElement);

        let _selectMenu = joinElement.getChildByName("selectGame");
        let _createButton = joinElement.getChildByName("create-btn");
        let _joinButton = joinElement.getChildByName("join-btn");
        let _inputRoomName = joinElement.getChildByName("room_name");
        let _methodOfGame = "create";
        let self = this;
        joinElement.addListener("click");
        joinElement.addListener("change");
        console.log(_selectMenu);
        let _toJoinId = "";

        joinElement.on("change", function (event) {
            console.log("Change");
            console.log(event.target.value);
            _methodOfGame = event.target.value;

            if (event.target.name === "room_name") {
                _toJoinId = event.target.value;
            }
        });

        joinElement.on("click", function (event) {
            console.log(event.target);
            if (event.target.name === "create-btn") {
                console.log("create-btn is clicked");

                let _timestamp = Date.now();
                const alphabet = "abcdefghijklmnopqrstuvwxyz";

                const randomCharacter1 =
                    alphabet[Math.floor(Math.random() * alphabet.length)];
                const randomCharacter2 =
                    alphabet[Math.floor(Math.random() * alphabet.length)];

                let _uniqueId =
                    randomCharacter1 + _timestamp + randomCharacter2;

                console.log("RoomID is", _uniqueId);
                this.scene.tweens.add({
                    targets: joinElement.rotate3d,
                    x: 1,
                    w: 30,
                    duration: 2000,
                    ease: "Power3",
                });

                this.scene.tweens.add({
                    targets: joinElement,
                    scaleX: 2,
                    scaleY: 2,
                    y: 1000,
                    duration: 2000,
                    ease: "Power3",
                    onComplete: function () {
                        joinElement.setVisible(false);
                    },
                });
                self.scene.start("GameScreen", {
                    type: "create",
                    gameId: _uniqueId,
                });
            }

            if (event.target.name === "join-btn") {
                console.log("join-btn is clicked");
                console.log(_toJoinId, " i am trying to join in ");
                self.scene.start("GameScreen", {
                    type: "join",
                    gameId: _toJoinId,
                });
            }
        });
        this.tweens.add({
            targets: joinElement,
            y: 300,
            duration: 3000,
            ease: "Power3",
        });
    }

    update() {}
}
