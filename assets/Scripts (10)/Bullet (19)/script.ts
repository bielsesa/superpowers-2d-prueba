class BulletBehavior extends Sup.Behavior {
  
  playerActor: Sup.Actor;
  enemyBodies: Sup.ArcadePhysics2D.Body[] = [];
  
  start() {
    this.playerActor = this.actor.getParent();
    this.enemyBodies = this.playerActor.getBehavior(PlayerBehavior).getEnemyBodies();
    this.actor.setPosition(this.playerActor.getPosition());
    this.actor.spriteRenderer = new Sup.SpriteRenderer(this.actor, "Sprites/Bullet");
    this.actor.arcadeBody2D = new Sup.ArcadePhysics2D.Body(this.actor, Sup.ArcadePhysics2D.BodyType.Box, {
        movable: true,
        width: 2,
        height: 1,
        offset: { x: 1, y: 1 }
      });
    
    if(this.playerActor.spriteRenderer.getHorizontalFlip()) {
      // LEFT
      this.actor.arcadeBody2D.setVelocity({x: -1.5, y: 0.2});  
    } else {
      // RIGHT
      this.actor.arcadeBody2D.setVelocity({x: 1.5, y: 0.2});    
    }    
    
    // get the enemies
    let enemyActors = Sup.getActor("Enemies").getChildren();
    for (let enemyActor of enemyActors) this.enemyBodies.push(enemyActor.arcadeBody2D);
    
    Sup.setTimeout(4000, () => {
      // If 4 seconds have passed, destroy bullet
      this.actor.destroy();
    })
  }
  
  update() {
    let i = 0;
    for (let enemyBody of this.enemyBodies) {
      i++;
      let enemyCollide = Sup.ArcadePhysics2D.intersects(this.actor.arcadeBody2D, enemyBody);
      if (enemyCollide) {
        Sup.log("BULLET has collided with an enemy");
        // destroy the given enemy
        this.enemyBodies.splice(i, 1);
        enemyBody.actor.destroy();        
        break;        
      }
    }
  }
}
Sup.registerBehavior(BulletBehavior);
