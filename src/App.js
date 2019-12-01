import React, {useState, useEffect, useRef} from 'react';
import './App.css';
import Helper from './helper';
import simpleheat from 'simpleheat';
function App() {

  var b_img = useRef(null);

  const loadImage = () => {

    var backgroundImg = new Image();
    backgroundImg.src = 'https://www.teslaoutsourcingservices.com/images/construction/building-sections-a504-wall-section.jpg';
    backgroundImg.onload = function () {
      b_img.current = backgroundImg;
      drawImg();
    }
  }

  const drawImg = () => {

    var canvas_1 = document.getElementById('canvas1');
    canvas_1.width = 800; canvas_1.height = 600;
    var ctx = canvas_1.getContext('2d');
    Helper.trackTransforms(ctx);

    var canvas_heatmap = document.getElementById('canvas_heatmap');
    canvas_heatmap.width = 800; canvas_heatmap.height = 600;
    var ctx2 = canvas_heatmap.getContext('2d');
    Helper.trackTransforms(ctx2);

    var canvas_both = document.getElementById('canvas_both');
    canvas_both.width = 800; canvas_both.height = 600;
    var ctx3 = canvas_both.getContext('2d');
    Helper.trackTransforms(ctx3);

    function redraw(){

      var p1 = ctx.transformedPoint(0,0);
      var p2 = ctx.transformedPoint(canvas_1.width,canvas_1.height);
      ctx.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);

      ctx.drawImage(b_img.current,0,0, 800,600);
      drawHeat();
    }
    redraw();
    
    function drawHeat() {

      var p1 = ctx2.transformedPoint(0,0);
      var p2 = ctx2.transformedPoint(canvas_heatmap.width,canvas_heatmap.height);
      ctx2.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);

      let data = Helper.data();
      simpleheat(canvas_heatmap).data(data).draw();
      var p1 = ctx3.transformedPoint(0,0);
      var p2 = ctx3.transformedPoint(canvas_both.width,canvas_both.height);
      ctx3.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);
      ctx3.drawImage(canvas_1,0,0, 800,600);
      ctx3.drawImage(canvas_heatmap,0,0, 800,600);
    }

    var lastX=canvas_both.width/2, lastY=canvas_both.height/2;
    var dragStart,dragged;
    canvas_both.addEventListener('mousedown',function(evt){
      document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
      lastX = evt.offsetX || (evt.pageX - canvas_both.offsetLeft);
      lastY = evt.offsetY || (evt.pageY - canvas_both.offsetTop);
      dragStart = ctx3.transformedPoint(lastX,lastY);
      dragged = false;
    },false);
    canvas_both.addEventListener('mousemove',function(evt){
      lastX = evt.offsetX || (evt.pageX - canvas_both.offsetLeft);
      lastY = evt.offsetY || (evt.pageY - canvas_both.offsetTop);
      dragged = true;
      if (dragStart){
        var pt = ctx3.transformedPoint(lastX,lastY);
        ctx3.translate(pt.x-dragStart.x,pt.y-dragStart.y);
        drawHeat();
      }
    },false);
    canvas_both.addEventListener('mouseup',function(evt){
      dragStart = null;
      if (!dragged) zoom(evt.shiftKey ? -1 : 1 );
    },false);

    var scaleFactor = 1.1;
    var zoom = function(clicks){
      var pt = ctx3.transformedPoint(lastX,lastY);
      ctx3.translate(pt.x,pt.y);
      var factor = Math.pow(scaleFactor,clicks);
      ctx3.scale(factor,factor);
      ctx3.translate(-pt.x,-pt.y);
      drawHeat();
    }

    var handleScroll = function(evt){
      var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
      if (delta) zoom(delta);
      return evt.preventDefault() && false;
    };
    canvas_both.addEventListener('DOMMouseScroll',handleScroll,false);
    canvas_both.addEventListener('mousewheel',handleScroll,false);
    document.getElementById("refresh_heat").addEventListener('click',drawHeat,false);
  }
  const initialCall = async () => {

    await loadImage();
  }


  useEffect(() => {

    initialCall();
  }, [])

  return (
    <div className="App">
      <button id={"refresh_heat"}>Refresh Heat</button>
      <canvas id={"canvas1"} style={{display: 'none'}}></canvas>
      <canvas id={"canvas_heatmap"} style={{display: 'none'}}></canvas>
      <canvas id={"canvas_both"}></canvas>
    </div>
  );
}

export default App;
