class Ball extends Phaser.GameObjects.Sprite {
    constructor(scene, xCoordinate, isGreenBall, isFirstMine) {
        // let placement = [-100, -250, -400];

        var y = -20;
        super(
            scene,
            // config.width / ballData.xCoordinate,
            config.width / 2 + xCoordinate,
            y,
            isGreenBall ? "greenball" : "redball"
        );
        this.setScale(0.7);
        scene.add.existing(this);

        scene.physics.world.enableBody(this);
        this.body.velocity.y = 300;

        if (isFirstMine) {
            //Ball to eat
            if (xCoordinate < 0) {
                scene.ballsToEat.add(this);
            } else {
                this.setAlpha(0.5);
                scene.othersBall.add(this);
            }
        } else {
            //For second player

            if (xCoordinate < 0) {
                this.setAlpha(0.5);
                scene.othersBall.add(this);
            } else {
                scene.ballsToEat.add(this);
            }
        }
    }

    destroyBalls = (num) => {
        if (this.y > config.height - num) {
            this.destroy();
        }
    };
}
