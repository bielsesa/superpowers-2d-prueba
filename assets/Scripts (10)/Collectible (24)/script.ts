class CollectibleBehavior extends Sup.Behavior {
  playerActor: Sup.Actor;
  playerBehavior: PlayerBehavior;
  
  awake() {
    this.playerActor = Sup.getActor("MainCharacter");
    this.playerBehavior = this.playerActor.getBehavior(PlayerBehavior);
  }

  update() {
    // check if the collectible collided with the player
    if (Sup.ArcadePhysics2D.intersects(this.actor.arcadeBody2D, this.playerActor.arcadeBody2D) && this.playerBehavior.checkHealable()) {
        // remove the collectible
      this.actor.destroy();
      this.playerBehavior.healOne();
      Sup.log("Collided with player, healed one");
    }
  }
}
Sup.registerBehavior(CollectibleBehavior);
