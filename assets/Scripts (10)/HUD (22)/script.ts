class HUDBehavior extends Sup.Behavior {
  playerLife: Sup.Actor;
  playerActor: Sup.Actor;
  numberOfLifes: number;
  
  awake() {
    this.playerLife = Sup.getActor("PlayerLife");
    this.playerActor = Sup.getActor("MainCharacter");
  }

  update() {    
    this.numberOfLifes = this.playerActor.getBehavior(PlayerBehavior).getPlayerLife();
    let playerLifeHUDCount = this.playerLife.getChildren().length;

    if (this.numberOfLifes < playerLifeHUDCount) {
      // player has lost a life, update hud (destroy one heart actor)
      this.playerLife.getChildren().pop().destroy();
      Sup.log("Player's life lower than HUD, popped and destroyed heart");
    } else if (this.numberOfLifes > playerLifeHUDCount) {
      // player has gained a life, update hud (add a new heart actor)
      let newHeart = new Sup.Actor(`Heart ${this.numberOfLifes}`);
      
    }
  }
}
Sup.registerBehavior(HUDBehavior);
