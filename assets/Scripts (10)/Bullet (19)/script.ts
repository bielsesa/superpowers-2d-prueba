class BulletBehavior extends Sup.Behavior {
  
  playerActor: Sup.Actor;
  horizontalSpeed: number;
  
  // We only need the start func because it 
  // won't change anything at the update
  start() {
    this.playerActor = this.actor.getParent().getParent();
    this.actor.setPosition(this.playerActor.getPosition());
    this.actor.spriteRenderer = new Sup.SpriteRenderer(this.actor, "Sprites/Bullet");
    this.actor.arcadeBody2D = new Sup.ArcadePhysics2D.Body(this.actor, Sup.ArcadePhysics2D.BodyType.Box, {
        movable: true,
        width: 2,
        height: 1,
        offset: { x: 1, y: 1 }
      });
    
    this.actor.arcadeBody2D.setCustomGravity(0, 0);
    
    if(this.playerActor.spriteRenderer.getHorizontalFlip()) {
      // LEFT
      this.actor.arcadeBody2D.setVelocity({x: -1.5, y: 0});  
      //this.horizontalSpeed = -1.5;
    } else {
      // RIGHT
      this.actor.arcadeBody2D.setVelocity({x: 1.5, y: 0});    
      //this.horizontalSpeed = 1.5;
    }
    
    Sup.setTimeout(3000, () => {
      // If 3 seconds have passed, destroy bullet
      this.actor.destroy();
    });    
  }
}
Sup.registerBehavior(BulletBehavior);
