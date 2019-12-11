import React, { Component } from "react";
import * as $ from "jquery";
import { authEndpoint, clientId, redirectUri, scopes } from "./config";
import hash from "./hash";
import Player from "./Player";
import "./App.css";

//// importing 

////TODO: make seperate group for connections
import { 
  // subscribeToTimer,
  // open_connect,
  client_update_playback, 
  server_update_playback,
  client_numbers,
  vote_entered,
  vote_down,
  broadcast_votes,
  update_votes
} from './api';

class App extends Component {
  constructor() {
    super();
    this.state = {
      clients: 0,
      logged_in: false,
      admin: false,
      didVote: 0,
      updaterID: null,

      voteUps: 0,
      voteDowns: 0,

      //// below are specifically for spotify
      token: null,
      item: {
        album: {
          images: [{ url: "" }]
        },
        name: "",
        artists: [{ name: "" }],
        duration_ms:0,
      },
      is_playing: "Paused",
      progress_ms: 0,
    };
    // this.getCurrentlyPlaying = this.getCurrentlyPlaying.bind(this);
  }

  pressButton = () =>{
    console.log("join a friend!");
    this.setState({
      logged_in: true
    })

    // var ip = "http://localhost"
    // var port = 8000
    // var new_socket = openSocket(ip + ":" + port)

    client_update_playback((err, data) => {
      console.log(data);

      if (this.state.item.name != data.item.name){
        console.log("changed song! can vote again");
        this.setState({didVote: 0});
      }
      this.setState({
      item: data.item,
      is_playing: data.is_playing,
      progress_ms: data.progress_ms,
      })
    });
    //// initiate connects
    // var connector = socketConnection("http://localhost", "8000");
    // connector.create_connection();
  }

  componentWillUnmount(){
    if (this.state.updaterID){
      clearInterval(this.state.updaterID)
    }
  }

  componentDidMount() {
    // Set token
    let _token = hash.access_token;
    if (_token) {
      // Set token
      this.setState({
        token: _token,
        admin: true
      });
      console.log("im ADMIN GG!");
      // this.getCurrentlyPlaying(_token);
      var updaterID = setInterval(this.getCurrentlyPlaying, 5000);
      this.setState({updaterID : updaterID})

      this.setState({logged_in: true})
    }else{
      /// nothing should be done here
      // client_update_playback((err, data) => {
      //   console.log(data);
  
      //   if (this.state.item.name != data.item.name){
      //     console.log("changed song! can vote again");
      //     this.setState({didVote: 0});
      //   }
      //   this.setState({
      //   item: data.item,
      //   is_playing: data.is_playing,
      //   progress_ms: data.progress_ms,
      //   })
      // });
  
    }

    //// all the listeners that has nothing to do with admin
    vote_entered((err, data) => {
      console.log("vote skip suggested");
      console.log(data);
      //// if data == 1, skip suggested
      //// if data == -1, skip defended
      if (data == 1){
        console.log("DISLIKE")
        this.setState({voteDowns: this.state.voteDowns += 1});
      }
      if (data == -1){
        console.log("LIKE")
        this.setState({voteUps: this.state.voteUps += 1});
        if (this.state.admin && this.state.voteDowns >= this.state.voteUps){
          console.log("SKIPPING SONG!");
          this.playNextSong();
        }
      }

      if (this.state.admin && this.state.voteDowns >= this.state.voteUps){
        console.log("SKIPPING SONG!");
        this.playNextSong();
      }
      //// TODO: some cool math
    })
    update_votes((err, data) =>{
      console.log("updating the votes status!")
      this.setState({
        voteUps: data.voteUps,
        voteDowns: data.voteDowns
      })
    })

    client_numbers((err, data) =>{
      console.log("CLIENT CONNECTED", data)
      this.setState({clients: data.clients})
      if (this.state.admin){
        broadcast_votes({
          voteUps: this.state.voteUps,
          voteDowns: this.state.voteDowns
        })
      }
    })

  }

  voteSkip = () => {
    if (this.state.didVote == 0){
      //// i didnt vote
      ////// send vote down

      vote_down(1)
      this.setState({didVote: 1})

    }
  }

  voteNoSkip = () => {
    if (this.state.didVote == 0){
      //// i didnt vote
      ////// send vote down

      vote_down(-1)
      this.setState({didVote: 1})

    }
  }

  playNextSong = () => {
    $.ajax({
      url: "https://api.spotify.com/v1/me/player/next",
      type: "POST",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("Authorization", "Bearer " + this.state.token);
      },
      success: (data) => {
        console.log("NEXT SONG data", data);
        console.log("changed song! can vote again - ADMIN");
        this.setState({didVote: false, voteDowns: 0, voteUps: 0});
        broadcast_votes({
          voteUps: this.state.voteUps,
          voteDowns: this.state.voteDowns
        })
      }
    });
  }

  getCurrentlyPlaying = () => {
    // Make a call using the token
    var token = this.state.token;
    console.log("making a call to currently playing")
    $.ajax({
      url: "https://api.spotify.com/v1/me/player",
      type: "GET",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: (data) => {
        console.log("data", data);
        if (data != null){
          this.setState({
            item: data.item,
            is_playing: data.is_playing,
            progress_ms: data.progress_ms,
          });
          server_update_playback(
            {
              item: data.item,
              is_playing: data.is_playing,
              progress_ms: data.progress_ms
            }
            );
        }
      }
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {!this.state.logged_in && (
            <div>
              <a
                className="btn btn--loginApp-link"
                href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
                  "%20"
                )}&response_type=token&show_dialog=true`}
              >
                Login to Spotify
              </a>
              <button onClick = {this.pressButton}
              className="btn btn--loginApp-link"
              href={'#'}
              >
                Join a friend
              </button>
          </div>
          )}
          {this.state.logged_in && (
            <div>
            <div> {this.state.clients} are connected right now </div>
            <div> {this.state.voteUps} likes the song</div>
            <div> {this.state.voteDowns} wants to skip</div>
            <div> I voted: {this.state.didVote}</div>
            <Player
              item={this.state.item}
              is_playing={this.state.is_playing}
              progress_ms={this.state.progress_ms}
            />
            <button onClick = {this.voteSkip}
            className="btn btn--loginApp-link"
            >
              Vote Skip
            </button>
            <button onClick = {this.voteNoSkip}
            className="btn btn--loginApp-link"
            >
              Like Song
            </button>
            </div>
          )}
        </header>
      </div>
    );
  }
}

export default App;
