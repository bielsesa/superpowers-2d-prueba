class EnemyBehavior extends Sup.Behavior {

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
    Sup.ArcadePhysics2D.collides(this.actor.arcadeBody2D, this.solidBodies);
    let touchSolids = this.actor.arcadeBody2D.getTouches().bottom;
    
    this.actor.arcadeBody2D.setVelocity({x: 0, y: 0});
  }
}
Sup.registerBehavior(EnemyBehavior);
