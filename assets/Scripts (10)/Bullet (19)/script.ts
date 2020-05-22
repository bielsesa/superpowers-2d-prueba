class BulletBehavior extends Sup.Behavior {
  
  playerActor: Sup.Actor;
  mapSize;
  
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
    
    // set custom gravity so bullet
    // doesn't do a parabola
    this.actor.arcadeBody2D.setCustomGravity(0, 0);
    
    if(this.playerActor.spriteRenderer.getHorizontalFlip()) {
      // LEFT
      this.actor.arcadeBody2D.setVelocity({x: -1.5, y: 0});
    } else {
      // RIGHT
      this.actor.arcadeBody2D.setVelocity({x: 1.5, y: 0});
    }
    
    this.mapSize = {
      width: Sup.getActor("Terrain").tileMapRenderer.getTileMap().getWidth(), 
      height: Sup.getActor("Terrain").tileMapRenderer.getTileMap().getHeight()
    };
  }
  
  update() {
    // if bullet falls of the viewport, destroy
    let bulletPosition = this.actor.getPosition();
    if (bulletPosition.x <= 0 || bulletPosition.x >= this.mapSize.width
       || bulletPosition.y <= 0 || bulletPosition.y >= this.mapSize.height) {
      // out of bounds
      Sup.log("Bullet out of bounds, destroyed");
      this.actor.destroy();
    }
  }
}
Sup.registerBehavior(BulletBehavior);
