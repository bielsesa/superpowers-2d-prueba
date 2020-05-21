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
      newHeart.spriteRenderer = new Sup.SpriteRenderer(newHeart, "Sprites/Heart");
      newHeart.setParent(this.playerLife);
      this.playerLife.getChildren().push(newHeart);
      
      let lastHeart = this.playerLife.getChildren()[playerLifeHUDCount - 1];      
      if (lastHeart === undefined) {
        newHeart.setPosition({x: 2, y: 16, z: 3});
      } else {
        let newPosition = lastHeart.getPosition();
        newPosition.x = newPosition.x + 2;
        newHeart.setPosition(newPosition);
      }
      
      Sup.log("Player's life greater than HUD, adding heart");
    }
  }
}
Sup.registerBehavior(HUDBehavior);
