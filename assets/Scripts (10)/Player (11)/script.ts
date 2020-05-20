class PlayerBehavior extends Sup.Behavior {
  speed = 0.1;
  jumpSpeed = 0.45;
  // states
  hurt: boolean = false;
  attacking: boolean = false;
  
  solidBodies: Sup.ArcadePhysics2D.Body[] = [];
  platformBodies: Sup.ArcadePhysics2D.Body[] = [];
  enemyBodies: Sup.ArcadePhysics2D.Body[] = [];
  enemyActors: Sup.Actor[] = [];
  
  awake() {
    // We get and store all the bodies in two arrays, one for each group
    let solidActors = Sup.getActor("Solids").getChildren();
    for (let solidActor of solidActors) this.solidBodies.push(solidActor.arcadeBody2D);
    let platformActors = Sup.getActor("Platforms").getChildren();
    for (let platformActor of platformActors) this.platformBodies.push(platformActor.arcadeBody2D);
    this.enemyActors = Sup.getActor("Enemies").getChildren();
    for (let enemyActor of this.enemyActors) this.enemyBodies.push(enemyActor.arcadeBody2D);
    Sup.log("no. of enemies: " + this.enemyBodies.length);
  }

  update() {
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
    for (let enemyBody of this.enemyBodies) {
      let enemyCollide = Sup.ArcadePhysics2D.intersects(this.actor.arcadeBody2D, enemyBody);
      if (enemyCollide) {
        Sup.log("collided with an enemy");
        touchEnemy = true;
        this.hurt = true;
        break;        
      }
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
      
      Sup.log("attacking");
      
      let bulletActor = new Sup.Actor("Bullet");  
      bulletActor.setPosition(this.actor.getPosition());
      bulletActor.spriteRenderer = new Sup.SpriteRenderer(bulletActor, "Sprites/Bullet");
      //  bulletActor.spriteRenderer.setSprite("Sprites/Bullet");
      bulletActor.arcadeBody2D = new Sup.ArcadePhysics2D.Body(bulletActor, Sup.ArcadePhysics2D.BodyType.Box, {
        movable: true,
        width: 2,
        height: 1,
        offset: { x: 1, y: 1 }
      });
      bulletActor.arcadeBody2D.setVelocity({x: 1.5, y: 0});
      Sup.log("creation of bullet actor");
      
      /*
      // cast a ray,
      // and add child (bullet)
      let ray = new Sup.Math.Ray();      
      
      // choose origin and direction
      // in this case the origin is the player's position
      // and the direction the direction the player's facing
      ray.setOrigin(this.actor.getPosition());
      if (this.actor.spriteRenderer.getHorizontalFlip()) {
        // facing left
        ray.setDirection(-1, 0, 0); 
      } else {
        // facing right
        ray.setDirection(1, 0, 0); 
      }      
      
      Sup.log("ray generated");
      
      // check if the ray hits an enemy
      let hits = ray.intersectActors(this.enemyActors);
      // The hits are sorted by distance from closest to farthest
      for (let hit of hits) {
        Sup.log(`Actor ${hit.actor.getName()} was hit by ray at ${hit.distance}`);
        // The `hit` object also has the point coordinates and normal of the hit
        
        // destroy enemy if hit by ray
        
      }
      */
    }

    // If the player is on the ground and wants to jump,
    // we update the `.y` component accordingly
    let touchBottom = this.actor.arcadeBody2D.getTouches().bottom;
    if (touchEnemy) {
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
      // Here, we should play either "Jump" or "Fall" depending on the vertical speed
      if (velocity.y >= 0) this.actor.spriteRenderer.setAnimation("jump");
      else this.actor.spriteRenderer.setAnimation("fall");
    }

    // Finally, we apply the velocity back to the ArcadePhysics body
    this.actor.arcadeBody2D.setVelocity(velocity);
  }
}
Sup.registerBehavior(PlayerBehavior);