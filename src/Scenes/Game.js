//Name: Jacob yee

class Game extends Phaser.Scene {
    graphics;
    curve;
    path;

    constructor() {
        super("Game");
        this.my = {sprite: {}};  

    // keys that need to be pressed
    this.aKey = null;
    this.dKey = null;
    this.sKey = null;
    this.spaceKey = null;

    this.my.sprite.bullets = [];
    this.maxBullets = 2;
    this.lifePoints = 3;

    this.myScore = 0;

    this.bulletActive = false;
    this.alienActive = false;
    this.gameActive = false;

    
    this.enemyPath = [
        106, 90,
        267, 85,
        398, 205,
        488, 316,
        671, 417,
        833, 458,
        940, 353,
        936, 220,
        860, 84,
        686, 54,
        590, 124,
        534, 248,
        488, 315,
        426, 415,
        240, 471,
        115, 453,
        50, 368,
        35, 186,
        106, 90,
    ]
    this.curve = new Phaser.Curves.Spline(this.enemyPath);

    }

    // Use preload to load art and sound assets before the scene starts running.
    preload() {
        // Assets from Kenny Assets pack "Monster Builder Pack"
        // https://kenney.nl/assets/monster-builder-pack
        this.load.setPath("./assets/");

        // player
        this.load.image("playerShip", "playerShip1_blue.png");

        // player bullet
        this.load.image("playerBullet", "laserBlue05.png");

        // alien
        this.load.image("alien", "shipGreen_manned.png");

        // sfx
        this.load.audio("laser", "laserSmall_002.ogg");
        this.load.audio("deadEnemy", "laserRetro_000.ogg");
        this.load.audio("playerDamage", "explosionCrunch_000.ogg");
        this.load.audio("gameOver", "explosionCrunch_001.ogg");
        

    }

    create() {
        let my = this.my;   // create an alias to this.my for readability

        my.sprite.playerShip = this.add.sprite(game.config.width/2, game.config.height - 60, "playerShip");
       
        // funny game over alien that fills most of the screen
        my.sprite.funnyAlien = this.add.sprite(game.config.width/2, game.config.height/2, "alien")
        my.sprite.funnyAlien.setScale(5)
        my.sprite.funnyAlien.visible = false

        // enemy alien with path
        my.sprite.alien = this.add.follower(this.curve, 10, 10, "alien");
        my.sprite.alien.setScale(0.75);
        my.sprite.alien.visible = false

        //alien that randomly appears and moves down in straight line
        my.sprite.normalAlien = this.add.sprite(game.config.width/2, 80, "alien")
        my.sprite.normalAlien.setScale(0.75);

        // keys to be pressed/held
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // speeds for player, bullets, and enemies
        this.playerSpeed = 5
        this.bulletSpeed = 20
        this.alienSpeed = 10

        document.getElementById('description').innerHTML = '<h2>Welcome to the Game! Press "S" to start the game!</h2>';
        
    }

    update() {
        let my = this.my;    // create an alias to this.my for readability

        var param = {
            from: 0,
            to: 1,
            delay: 0,
            duration: 3000,
            ease: 'Sine.easeInOut',
            repeat: -1,
            yoyo: false,
            rotateToPath: false,
            rotationOffset: 0
        };

        //if gameActive is false, create button to start the game. set gameActive to true
        if (this.sKey.isDown) {
            if (this.gameActive == false) { 
                my.sprite.playerShip.visible = true              
                this.myScore = 0;
                this.lifePoints = 3;
                my.sprite.alien.visible = true
            my.sprite.normalAlien.visible = true
                my.sprite.funnyAlien.visible = false
                document.getElementById('description').innerHTML = ('<h2>Shoot down the aliens! Try not to get hit!</h2>'+'<h1> Lives:' + this.lifePoints + '</h1><h1>Score:'+ this.myScore + '</h1><br>A: left // D: right // Space: fire</br>')
                this.gameActive = true;
            }  
        } 

        if (this.gameActive == true){
            // Polling Input, Move left
            if (this.aKey.isDown) {
                if (my.sprite.playerShip.x > (my.sprite.playerShip.displayWidth/2)) {
                    my.sprite.playerShip.x -= this.playerSpeed;
                }  
            } 

            // Polling Input, Move right
            if (this.dKey.isDown) {
                if (my.sprite.playerShip.x < (game.config.width - (my.sprite.playerShip.displayWidth/2))) {
                    my.sprite.playerShip.x += this.playerSpeed;
                } 
            }

            // Polling input: emit, can only fire one bullet at a time
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                if (my.sprite.bullets.length < this.maxBullets) {
                    this.sound.play("laser", {
                        volume: 1   // Can adjust volume using this, goes from 0 to 1
                    });
                    my.sprite.bullets.push(this.add.sprite(
                        my.sprite.playerShip.x, my.sprite.playerShip.y-(my.sprite.playerShip.displayHeight/2), "playerBullet")
                    );
                }
            }

            //cleans out array for when bullets leave the screen. this allows bullets to be deleted as well when they colide with the enemy by moving the bullet completely off screen.
            my.sprite.bullets = my.sprite.bullets.filter((bullet) => bullet.y > -(bullet.displayHeight/2));

            

            // enemy that loops in an infiinity symbol
            if (this.alienActive == false) {
                my.sprite.alien.x = this.enemyPath[0];
                my.sprite.alien.y = this.enemyPath[1];
                my.sprite.alien.startFollow(param);
                my.sprite.alien.visible = true;
                this.alienActive =true;

            }

            // move alien to top of screen again in a random spot if it goes ot bottom of screen
            if (my.sprite.normalAlien.y > config.height) {
                my.sprite.normalAlien.visible = false;
                my.sprite.normalAlien.x = Math.random()*config.width;
                my.sprite.normalAlien.y = 80;
                my.sprite.normalAlien.visible = true;

            }

            

            // collisions, using for loop to check over every bullet whether they touch an enemy
            for (let bullet of my.sprite.bullets) {
                if (this.collides(my.sprite.normalAlien, bullet)) {
                    bullet.y = -100;
                    my.sprite.normalAlien.visible = false;
                    //add score, move alien to random spot here
                    this.myScore += 200;
                    this.sound.play("deadEnemy", {
                        volume: 1   // Can adjust volume using this, goes from 0 to 1
                    });
                    document.getElementById('description').innerHTML = ('<h2>Shoot down the aliens! Try not to get hit!</h2>'+'<h1> Lives:' + this.lifePoints + '</h1><h1>Score:'+ this.myScore + '</h1><br>A: left // D: right // Space: fire</br>')
                    my.sprite.normalAlien.x = Math.random()*config.width;
                    my.sprite.normalAlien.y = 80;
                    my.sprite.normalAlien.visible = true;
                    
                    
                }
                if (this.collides(my.sprite.alien, bullet)) {
                    bullet.y = -100;
                    this.myScore += 500;
                    this.sound.play("deadEnemy", {
                        volume: 1   // Can adjust volume using this, goes from 0 to 1
                    });
                    document.getElementById('description').innerHTML = ('<h2>Shoot down the aliens! Try not to get hit!</h2>'+'<h1> Lives:' + this.lifePoints + '</h1><h1>Score:'+ this.myScore + '</h1><br>A: left // D: right // Space: fire</br>')
                    my.sprite.alien.visible = false;
                    this.alienActive = false

                }
            }

            if (this.collides(my.sprite.playerShip, my.sprite.normalAlien)) {
                my.sprite.normalAlien.visible = false;
                this.sound.play("playerDamage", {
                    volume: 1   // Can adjust volume using this, goes from 0 to 1
                });
                my.sprite.normalAlien.x = Math.random()*config.width;
                my.sprite.normalAlien.y = 80;
                my.sprite.normalAlien.visible = true;
                this.lifePoints -= 1
                document.getElementById('description').innerHTML = ('<h2>Shoot down the aliens! Try not to get hit!</h2>'+'<h1> Lives:' + this.lifePoints + '</h1><h1>Score:'+ this.myScore + '</h1><br>A: left // D: right // Space: fire</br>')
            }

            for (let bullet of my.sprite.bullets) {
                bullet.y -= this.bulletSpeed;
            }
            
            //straight path for normal alien
            my.sprite.normalAlien.y += this.alienSpeed;

        }
        if (this.lifePoints == 0) {
            for (let bullet of my.sprite.bullets) {
                bullet.y = -100;};
            this.gameActive = false;
            this.alienActive = false;
            my.sprite.funnyAlien.visible = true
            my.sprite.playerShip.visible = false
            my.sprite.alien.visible = false
            my.sprite.normalAlien.visible = false
            my.sprite.alien.stopFollow();
            document.getElementById('description').innerHTML = '<h2>Game Over! Press S to restart the game!</h2><h1>Score:'+ this.myScore +'</h1>'


        }
            
        
    }


    // A center-radius AABB collision check
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }
}

