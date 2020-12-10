class Rock {
  constructor() {
    this.radius = 80;
    this.x = w;
    this.y = h - this.radius;
    rockSprite.setCollider("circle", 10, 20, 20);
  }

  update() {
    if (this.x >= 0 - this.radius) {
      this.x -= speed;
    } else {
      this.x = w + this.radius;
    }
    rockSprite.position.x = this.x;
    rockSprite.position.y = this.y;
  }

  restart() {
    this.x = w;
  }

  show() {
    drawSprite(rockSprite);
  }
}
