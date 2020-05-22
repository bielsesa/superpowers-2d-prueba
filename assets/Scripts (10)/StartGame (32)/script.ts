class StartGame extends Sup.Behavior {
  update() {
    if (Sup.Input.wasKeyJustPressed("RETURN")) {
      Sup.loadScene("Scenes/GameScene");
    }
  }
}
Sup.registerBehavior(StartGame);
