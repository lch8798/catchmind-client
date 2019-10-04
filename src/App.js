import React, { Component } from 'react';
import './App.css';

import io from 'socket.io-client';

let picture = [];
const fps = 30;

const raspberrypi = "http://124.111.56.169:8080";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(raspberrypi),
      canvas: null,
      ctx: null,
      drawing: false
    }
  
    // 실시간 드로잉
    this.state.socket.on('draw', async (data) => {
      picture.push(data);
    });

    // 방문 랜더링
    this.state.socket.on('drawInit', async (data) => {
      picture = data;
      this.rendering();
    });

    // 캔버스 초기화
    this.state.socket.on('paintInit', (data) => {
      const { canvas, ctx } = this.state;
      picture = data;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
  }

  componentDidMount() {
    this.init();
    setTimeout(this.test, 1000);
    setTimeout(this.eee, 1500);
  }

  test = () => {
    let eee = document.getElementById("eee");
    document.addEventListener('keydown', (e) => {
      console.log(e);
      if(e.which == 32) {
      }
    });

    setInterval(() => {
      const spaceKey = {
        altKey: false,
        bubbles: true,
        cancelBubble: false,
        cancelable: true,
        charCode: 0,
        code: "Space",
        composed: true,
        ctrlKey: false,
        currentTarget: null,
        defaultPrevented: false,
        detail: 0,
        eventPhase: 0,
        isComposing: false,
        isTrusted: true,
        key: " ",
        keyCode: 32,
        type: "keydown",
        which: 32
      }

      document.dispatchEvent(new KeyboardEvent('keydown', spaceKey));
    }, 1000);
  }

  eee = () => {
    //document.onkeydown();
  }

  init = async () => {
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await this.setState({ canvas });
    await this.setState({ ctx });

    const frame = fps / 1000;
    this.state.socket.emit('drawInit');
    setInterval(() => this.rendering(), frame);
  }

  paintInit = () => {
    this.state.socket.emit('paintInit');
  }


  rendering = () => {
    const { ctx } = this.state;
    ctx.fillStyle = "black";
    picture.forEach((location) => {
      ctx.fillRect(location[0], location[1], 2, 2);
    });
  }

  draw = (e) => {
    const { canvas, ctx, drawing, socket } = this.state;

    if(!drawing) {
      return;
    }

    let drawingLocation = [0, 0];
    
    if(e.touches) {
      // 터치
      drawingLocation = [e.touches[0].clientX - canvas.offsetLeft, e.touches[0].clientY - canvas.offsetTop];
    } else {
      // 마우스
      drawingLocation = [e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop];
    }

    // 클라이언트 랜더링
    // picture.push(drawingLocation);

    socket.emit('draw', drawingLocation);
  }

  onDraw = () => {
    this.setState({ drawing: true });
    console.log("On!");
  }

  offDraw = () => {
    this.setState({ drawing: false });
    console.log("Off!");
  }

  render() {
    return (
      <div className="App">
        <h4 id="eee">라즈베리파이 성능 테스트</h4>
        <button onClick={this.paintInit}>초기화</button>
        <div className="game" id="game">
          <canvas 
            id="canvas" 
            ref="canvas" 
            width={600} 
            height={600}
            onMouseUp={this.offDraw}
            onMouseDown={this.onDraw}
            onMouseMove={this.draw}
            onTouchStart={this.onDraw}
            onTouchEnd={this.offDraw}
            onTouchMove={this.draw}
          />
        </div>
      </div>
    );
  }
}

export default App;
