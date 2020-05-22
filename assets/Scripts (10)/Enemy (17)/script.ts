class EnemyBehavior extends Sup.Behavior {

  solidBodies: Sup.ArcadePhysics2D.Body[] = [];
  platformBodies: Sup.ArcadePhysics2D.Body[] = [];
  bulletBodies: Sup.ArcadePhysics2D.Body[] = [];
  bulletActors: Sup.Actor[] = [];
  
  awake() {
    // We get and store all the bodies in two arrays, one for each group
    let solidActors = Sup.getActor("Solids").getChildren();
    for (let solidActor of solidActors) this.solidBodies.push(solidActor.arcadeBody2D);
    let platformActors = Sup.getActor("Platforms").getChildren();
    for (let platformActor of platformActors) this.platformBodies.push(platformActor.arcadeBody2D);
    
    // save the reference to the collection
    let bulletActors = Sup.getActor("Bullets").getChildren();
    
    // they're static (for now)
    this.actor.arcadeBody2D.setVelocity({x: 0, y: 0});
  }
  
  update() {
    Sup.ArcadePhysics2D.collides(this.actor.arcadeBody2D, this.solidBodies);    
    
    // get the current bullets that exist (if any)
    //let bulletActors = Sup.getActor("Bullets").getChildren();
    if (this.bulletActors.length > 0) {
      // check if a bullet collides with the enemy     
      Sup.log("There exist bullets");
      
      let i = 0;
      for (let bulletActor of this.bulletActors) {
        Sup.log(`Is bullet actor undefined? ${bulletActor === undefined}`);
        let bullet = bulletActor.arcadeBody2D;
        i++;
        if (bullet !== undefined && Sup.ArcadePhysics2D.intersects(this.actor.arcadeBody2D, bullet.actor.arcadeBody2D)) {
          // enemy intersected bullet, destroy both
          // (or at least destroy enemy)
          this.actor.destroy();
          this.bulletBodies.slice(i, 1);
          bullet.destroy();
          Sup.log("Bullet collided with enemy");
        }
      }
    }    
  }
}
Sup.registerBehavior(EnemyBehavior);
