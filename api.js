class Api {
  constructor(axios) {
    this.axios = axios;
    this.scores = [];
    this.player = "";
    this.baseUrl = "https://ksuler.pythonanywhere.com/api/v1";
  }

  post() {
    player = input.value();
    axios
      .post(`${baseUrl}/scores/`, {
        player: player,
        score: score,
        game: 1,
      })
      .then(function (response) {
        // handle success
        console.log(response);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
    this.get();
  }

  get() {
    const vm = this;
    axios
      .get(this.baseUrl + "/scores/")
      .then(function (response) {
        // handle success
        vm.scores = response.data.results;
        console.log(response);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  }

  getScores() {
    return this.scores;
  }
}
