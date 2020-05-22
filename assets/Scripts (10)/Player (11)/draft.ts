class PlayerBehavior extends Sup.Behavior {
  
    //////////////////////////
   /////// ATTRIBUTES ///////
  //////////////////////////
  maxLives: number = 3;
  life: number = 3;
  speed = 0.1;
  jumpSpeed = 0.45;
  
    //////////////////////////
   ///////// STATES /////////
  //////////////////////////
  hurt: boolean = false;
  attacking: boolean = false;
  doubleJump: boolean = false;
  
    ////////////////////
   ////// BODIES //////
  ////////////////////  
  solidBodies: Sup.ArcadePhysics2D.Body[] = [];
  platformBodies: Sup.ArcadePhysics2D.Body[] = [];
  enemyBodies: Sup.ArcadePhysics2D.Body[] = [];
  collectiblesBodies: Sup.ArcadePhysics2D.Body[] = [];
  
  awake() {
    // We get and store all the bodies in two arrays, one for each group
    let solidActors = Sup.getActor("Solids").getChildren();
    for (let solidActor of solidActors) this.solidBodies.push(solidActor.arcadeBody2D);
    let platformActors = Sup.getActor("Platforms").getChildren();
    for (let platformActor of platformActors) this.platformBodies.push(platformActor.arcadeBody2D);
    let enemyActors = Sup.getActor("Enemies").getChildren();
    for (let enemyActor of enemyActors) this.enemyBodies.push(enemyActor.arcadeBody2D);
    Sup.log("no. of enemies: " + this.enemyBodies.length);
    let collectiblesActors = Sup.getActor("Collectibles").getChildren();
    for (let collectibleActor of collectiblesActors) this.collectiblesBodies.push(collectibleActor.arcadeBody2D);
    Sup.log("no. of collectibles: " + this.collectiblesBodies.length);
  }

  update() {
    
    // First check if the player is within the viewport
    let actorCurrentPosition = this.actor.getPosition();
    let mapSize = {
      width: Sup.getActor("Terrain").tileMapRenderer.getTileMap().getWidth(), 
      height: Sup.getActor("Terrain").tileMapRenderer.getTileMap().getHeight()
    };
    if (actorCurrentPosition.x <= 0 || actorCurrentPosition.x >= mapSize.width
       || actorCurrentPosition.y <= 0 || actorCurrentPosition.y >= mapSize.height) {
      // player out of bounds, respawn
      this.die();
    } else {
      // player ok, moving on    
    
        // First, we'll check for collision with solid bodies
        Sup.ArcadePhysics2D.collides(this.actor.arcadeBody2D, this.solidBodies);
        let touchSolids = this.actor.arcadeBody2D.getTouches().bottom;
        let velocity = this.actor.arcadeBody2D.getVelocity();

        // Then we'll check for collision with one-way platforms,
        // ... but only when falling! That's the trick.
        let touchPlatforms = false;
        if (velocity.y < 0) {
          let position = this.actor.getLocalPosition();
          let originalOffset = this.actor.arcadeBody2D.getOffset();
          // We must change the size of the player body so only the feet are checked
          // To do so, we decrease the height of the body and adapt the offset      
          this.actor.arcadeBody2D.setSize(2, 0.2);      
          this.actor.arcadeBody2D.setOffset({ x : originalOffset.x, y : 0.1});
          // Then we override the body position using the current actor position
          this.actor.arcadeBody2D.warpPosition(position);

          // Now, check against every platform
          for (let platformBody of this.platformBodies) {
            Sup.ArcadePhysics2D.collides(this.actor.arcadeBody2D, platformBody);
            if (this.actor.arcadeBody2D.getTouches().bottom) {
              touchPlatforms = true;
              velocity.y = 0;
              break;
            }
          }

          // Once done, reset the body to its full size
          position = this.actor.getLocalPosition();
          this.actor.arcadeBody2D.setSize(2, 2);
          this.actor.arcadeBody2D.setOffset({ x : originalOffset.x,  y : originalOffset.y });
        }

        // Then, check for collision with enemies    
        let touchEnemy = false;
        let i = 0;
        try {
          for (let enemyBody of this.enemyBodies) {
            i++;
            /*if (enemyBody === null || enemyBody === undefined) {
              this.enemyBodies.splice(i, 1);
              continue;
            }*/
            let enemyCollide = Sup.ArcadePhysics2D.intersects(this.actor.arcadeBody2D, enemyBody);
            if (enemyCollide) {
              Sup.log("collided with an enemy");        
              if (this.life > 0) {
                touchEnemy = true;
                this.hurt = true;   
              } else {
                // respawn
                this.die();
              }
              break;        
            }
          }
        } catch(err) {
          Sup.log("Error caught from PlayerBehavior");
          //Sup.log(`Value of i: ${i}`);
          //this.enemyBodies.splice(i, 1);
          this.enemyBodies = []; // reset
          let enemyActors = Sup.getActor("Enemies").getChildren();
          for (let enemyActor of enemyActors) this.enemyBodies.push(enemyActor.arcadeBody2D);
        }      

        // We override the `.x` component based on the player's input
        if (Sup.Input.isKeyDown("LEFT")) {
          velocity.x = -this.speed;
          // When going left, we flip the sprite
          this.actor.spriteRenderer.setHorizontalFlip(true);
          this.actor.arcadeBody2D.setOffset({ x : -1,  y : 1 });
        } else if (Sup.Input.isKeyDown("RIGHT")) {
          velocity.x = this.speed;
          // When going right, we clear the flip
          this.actor.spriteRenderer.setHorizontalFlip(false);
          this.actor.arcadeBody2D.setOffset({ x : 1,  y : 1 });
        } else velocity.x = 0;

        // check if the player wants to attack
        if(Sup.Input.wasKeyJustPressed("X")) {
          //this.attacking = true;
          let existingBulletsCount = Sup.getActor("Bullets").getChildren().length;
          let bulletActor = new Sup.Actor(`Bullet ${++existingBulletsCount}`);
          bulletActor.setParent(Sup.getActor("Bullets"));
          Sup.getActor("Bullets").getChildren().push(bulletActor);
          bulletActor.addBehavior(BulletBehavior);      
          Sup.log("creation of bullet actor");
        }

        // If the player is on the ground and wants to jump,
        // we update the `.y` component accordingly
        let touchBottom = this.actor.arcadeBody2D.getTouches().bottom;
        if (touchEnemy) {
            this.life--;          
            velocity.y = 0; // it makes you fall (cuts a jump if there was any)
            velocity.x = -this.speed; // it makes you go back 3 units (16x3 pixels)
            let currentActorPosition = this.actor.getPosition();
            this.actor.arcadeBody2D.warpPosition({ x: currentActorPosition.x - 3, y: currentActorPosition.y });
            currentActorPosition = this.actor.getPosition();

            this.actor.spriteRenderer.setAnimation("hit", false);
            Sup.setTimeout(300, () => {
              this.actor.spriteRenderer.setAnimation("idle");
              this.hurt = false;
            });    
        } else if (touchBottom && !this.hurt && !this.attacking) {
          if (Sup.Input.wasKeyJustPressed("UP")) {
            velocity.y = this.jumpSpeed;
            this.actor.spriteRenderer.setAnimation("jump");            
          } else {
            // Here, we should play either "Idle" or "Run" depending on the horizontal speed
            if (velocity.x === 0) this.actor.spriteRenderer.setAnimation("idle");
            else this.actor.spriteRenderer.setAnimation("run");
          }
        } else if (!this.hurt) {
          if (Sup.Input.wasKeyJustPressed("UP")) { // double jump
              velocity.y = this.jumpSpeed  * 0.75;
              this.doubleJump = true;
          }
          
          // Here, we should play either "Jump" or "Fall" depending on the vertical speed
          if (velocity.y >= 0 && !this.doubleJump) this.actor.spriteRenderer.setAnimation("jump");
          else if (!this.doubleJump) this.actor.spriteRenderer.setAnimation("fall");
          else {
            this.actor.spriteRenderer.setAnimation("double-jump");
            Sup.setTimeout(250, () => this.doubleJump = false);
          }
        }
        // Finally, we apply the velocity back to the ArcadePhysics body
        this.actor.arcadeBody2D.setVelocity(velocity);
      }
  }
  
    /////////////////////////////////
   /////// GETTERS & SETTERS ///////
  /////////////////////////////////
  
  // Getter for the bullet
  getEnemyBodies() {
    return this.enemyBodies;
  }
  
  // Get & set player life
  getPlayerLife() {
    return this.life;
  }
  
  setPlayerLife(life: number) {
    this.life = life;
  }
  
    ///////////////////////
   /////// METHODS ///////
  ///////////////////////
  
  die() {
    // for now, just reset position to the initial one
    // and life to the initial number ("respawn")
    this.life = this.maxLives;
    this.actor.arcadeBody2D.warpPosition({x: 3, y: 8});
    this.actor.arcadeBody2D.setVelocity({x: 0, y: 0});
    this.hurt = false;
    this.actor.spriteRenderer.setAnimation("idle");
  }
  
  healOne() {
    this.life++;
  }
  
  checkHealable() {
    return this.life < this.maxLives;
  }
}
Sup.registerBehavior(PlayerBehavior);