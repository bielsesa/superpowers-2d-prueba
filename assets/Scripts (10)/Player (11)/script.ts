class PlayerBehavior extends Sup.Behavior {
  speed = 0.1;
  jumpSpeed = 0.45;
  
  solidBodies: Sup.ArcadePhysics2D.Body[] = [];
  platformBodies: Sup.ArcadePhysics2D.Body[] = [];
  
  awake() {
    // We get and store all the bodies in two arrays, one for each group
    let solidActors = Sup.getActor("Solids").getChildren();
    for (let solidActor of solidActors) this.solidBodies.push(solidActor.arcadeBody2D);
    let platformActors = Sup.getActor("Platforms").getChildren();
    for (let platformActor of platformActors) this.platformBodies.push(platformActor.arcadeBody2D);
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
      this.actor.arcadeBody2D.setSize(0.75, 0.15);      
      this.actor.arcadeBody2D.setOffset({ x : originalOffset.x, y : 0.08});
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
      this.actor.arcadeBody2D.setSize(0.75, 0.8);
      this.actor.arcadeBody2D.setOffset({ x : originalOffset.x,  y : 0.4 });
    }

    // We override the `.x` component based on the player's input
    if (Sup.Input.isKeyDown("LEFT")) {
      velocity.x = -this.speed;
      // When going left, we flip the sprite
      this.actor.spriteRenderer.setHorizontalFlip(true);
      this.actor.arcadeBody2D.setOffset({ x : -0.5,  y : 0.4 });
      Sup.log("Offset: " + this.actor.arcadeBody2D.getOffset());
    } else if (Sup.Input.isKeyDown("RIGHT")) {
      velocity.x = this.speed;
      // When going right, we clear the flip
      this.actor.spriteRenderer.setHorizontalFlip(false);
      this.actor.arcadeBody2D.setOffset({ x : 0.5,  y : 0.4 });
      Sup.log("Offset: " + this.actor.arcadeBody2D.getOffset());
    } else velocity.x = 0;

    // If the player is on the ground and wants to jump,
    // we update the `.y` component accordingly
    let touchBottom = this.actor.arcadeBody2D.getTouches().bottom;
    if (touchBottom) {
      if (Sup.Input.wasKeyJustPressed("UP")) {
        velocity.y = this.jumpSpeed;
        this.actor.spriteRenderer.setAnimation("jump");
      } else {
        // Here, we should play either "Idle" or "Run" depending on the horizontal speed
        if (velocity.x === 0) this.actor.spriteRenderer.setAnimation("idle");
        else this.actor.spriteRenderer.setAnimation("run");
      }
    } else {
      // Here, we should play either "Jump" or "Fall" depending on the vertical speed
      if (velocity.y >= 0) this.actor.spriteRenderer.setAnimation("jump");
      else this.actor.spriteRenderer.setAnimation("fall");
    }

    // Finally, we apply the velocity back to the ArcadePhysics body
    this.actor.arcadeBody2D.setVelocity(velocity);
  }
}
Sup.registerBehavior(PlayerBehavior);