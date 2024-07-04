var ctx;
var cvs;
var cvs_bound;
var selected;
var puz_interval;
var puzzle_images;
var records;
var img;
var mi_secs;
var start_time;
var current_img;
var current_time;
var start_pan;
var show_box;
var difficulty;
var scale = 2;
var padding = 100;
var show_img = false;
var started = false;
var completed = false;
var record_exist = false;
var pieces = new Array();
var images = new Array();
var diff = {
  easy: {
    ridx: 3,
    cidx: 4
  },
  normal: {
    ridx: 5,
    cidx: 6    
  },
  hard: {
    ridx: 9,
    cidx: 10
  }
}
//define the rows of the puzzle
let ridx = diff.easy.ridx;
//define the columns of the puzzle
let cidx = diff.easy.cidx;
var img_size = {
  x:0,
  y:0,
  w:0,
  h:0,
  rows:0,
  cols:0
};

//pre load images
for (let i = 0; i < puzzle_images.length; i++){
  let img = new Image();
  img.src = puzzle_images[i].normal;
  images.push(img);
}
//end for

onload = function(){  
  cvs = document.getElementById("the_canvas");    
  show_box = document.getElementById("show_image");          
  start_pan = document.getElementById("start_panel");
  difficulty = localStorage.getItem("difficulty") ?? "easy";
  let thumb = document.getElementById("puzzles_tumb");
  let start = document.getElementById("start");  
  let restart = document.getElementById("restart");
  let save = document.getElementById("save");
  let buttons = document.querySelectorAll(".diff");      
  
  //get localstorage check user preference
  show_img = localStorage.getItem("showing") ?? false;  
  show_box.checked = show_img == "checked" ? true : false;  
  
  //load play records
  let saved_rec = localStorage.getItem("records"); 
  //if records exist parse the object else create new object
  records = saved_rec ? JSON.parse(saved_rec) :  new Object();
  
  //append all images on the thumbnail
  for (let i = 0; i < puzzle_images.length; i++){
    thumb.innerHTML += "<img src='"+ puzzle_images[i].thumbnail +"' alt='" + puzzle_images[i].name + "' width='150' height='85' draggable='true' index="+i+
                       " ondragstart='startDrag(event);'></img>"; 
  }
  //end for

  //get the canvas offset
  cvs_bound = cvs.getBoundingClientRect(); 
  //initial the canvas first
  initCanvas(1600,916,scale);      
  ctx.font = "bold 45px 'Arial'";
  ctx.fillStyle = "#666";
  ctx.fillText("Please drag the image here", 100, 250);

  //listen the player choose the difficulty 
  for (let i = 0; i < buttons.length; i++){
    buttons[i].addEventListener("click", function(){
      localStorage.setItem("difficulty", buttons[i].innerText);
      difficulty = buttons[i].innerText;
    });
  }
  //end for

  //get canvas offset when scrolling
  document.addEventListener("scroll",function(){
    cvs_bound = cvs.getBoundingClientRect();    
  });
  //end scroll event listener

  restart.addEventListener("click", function(){
    history.go(0);
  }); 
  //end restart button event listener 
  
  //when player completed 
  save.addEventListener("click", function(){
    let name = document.getElementById("player").value;
    let time = document.getElementById("timer").innerText;
    let panel = document.querySelector("#overlay table");
    
    if(name){
      //check target record exist, if exist update the record
      if(record_exist){
        records[current_img][difficulty].push(new record(mi_secs, name, time));
        records[current_img][difficulty].sort((a,b) => a.milli_secs - b.milli_secs);
      }else{
        //else add new array
        if(!records[current_img])
          records[current_img]= new Object();
        records[current_img][difficulty] = [new record(mi_secs, name, time)];
      }
      //end if record exist

      //save the records
      localStorage.setItem("records",JSON.stringify(records));
      let rec = JSON.parse(localStorage.getItem("records"))[current_img][difficulty];
      //update the record table
      showRecord(panel, rec);
    }else{
      alert("Please enter your name.");
    }
    //end if name typed in
  });  

  show_box.addEventListener("change", function(){
    show_img = this.checked ? "checked" : "unchecked";
    //show the transparent image
    showPic();
    //save the user preference
    localStorage.setItem("showing", show_img);
  });
  //end checkbox listener

  start.addEventListener("click", function(){
    startGame(start_pan,thumb);
  });
  //end start button event listener

  cvs.addEventListener("dragover",function(event){
    event.preventDefault();
  });
  //end adrag over

  cvs.addEventListener("drop",dropImage);
  cvs.addEventListener("mousedown",mDown); 
  cvs.addEventListener("mousemove",mMove); 
  cvs.addEventListener("mouseup",mUp);   
}
//end onload

function startGame(start_pan,thumb){
  cvs_bound = cvs.getBoundingClientRect(); 
  started = true;
  //show the timer
  document.getElementById("timer").style.display = "block";
  //hide all menu panel
  start_pan.style.display = "none";
  thumb.style.display = "none";
  start_time = new Date().getTime();
  document.getElementById("menu").style.display = "none";
  //clear the canvas first
  ctx.clearRect(0, 0, cvs.width, cvs.height); 
  ridx = diff[difficulty].ridx; 
  cidx = diff[difficulty].cidx; 
  
  //end if  
  drawPuzzleImage(ridx, cidx);
}
//end startGame

function dropImage(evt){
  //get the selected image index
  var idx = evt.dataTransfer.getData("text");
  img = images[idx];
  current_img = puzzle_images[idx].name;   
  let img_width = img.width;
  let img_height = img.height;
  evt.preventDefault();
  let w = (img_width + 200) * scale;
  let h = (img_height + 200) * scale;
  //set the canvas to real size  
  initCanvas(w,h,scale);
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  //show the image for player preview  
  ctx.drawImage(img, padding, padding, img.width, img.height);   
  //let the player choose the image show or not    
  show_box.disabled = false;
  //show the start button
  start_pan.style.display = "block";    
}
//end dropImage

function initCanvas(w,h,sc){  
  cvs.width = w;
  cvs.height = h;
  cvs.style.width = w/sc + "px";  
  cvs.style.height = h/sc + "px";
  ctx = cvs.getContext("2d"); 
  ctx.scale(sc,sc);
}
//end initCanvas

function startDrag(evt){  
  evt.dataTransfer.setData("text", evt.target.getAttribute("index"));  
}
//end startDrag

function drawPuzzleImage(ridx, cidx){
  //store the all image info to global object
  img_size.x = padding;
  img_size.y = padding
  img_size.w = img.width;
  img_size.h = img.height;
  img_size.rows = ridx;
  img_size.cols = cidx;  
  //seperate the image and store in pieces array
  initPieces(ridx,cidx); 
  //display the image border
  showPic();
  //draw the pieces
  drawRect();
  puz_interval = setInterval(function(){
    if (started){
      ctx.clearRect(0, 0, cvs.width, cvs.height);    
      showPic();
      drawRect();
      completed = checkComplete(); 
      if (completed){
        //stop the interval
        clearInterval(puz_interval);
        //show the complete panel
        showPanelAndRecords();
      } 
      //parse and show the timer
      showTime();        
    }
  },17);
}
//end drawPuzzleImage

function showPic(){
  //set transparent
  ctx.globalAlpha = show_img == "checked"? 0.5 : 0;    
  ctx.drawImage(img, padding, padding, img.width, img.height);  
  //set back to no transparent  
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(padding, padding, img.width, img.height);
  ctx.strokeStyle = "#999";
  //draw stroke
  ctx.strokeRect(padding, padding, img.width, img.height);   
}
//end showPic

//store pieces in pieces array
function initPieces(row,col){
  let idx = 0; 
  pieces = [];
  //sepereate the puzzle pieces
  for (let r = 0; r < row; r++){
    for (let c = 0; c < col; c++){
      let p = new piece(r,c)
      pieces.push(p);      
    }
    //end for c
  }
  //end for r  
  
}
//end initPieces

//define components of puzzle pieces
function piece(ridx, cidx){
  this.rowidx = ridx;
  this.colidx = cidx;
  //each piece height
  this.h = img_size.h/img_size.rows;
  //each piece width
  this.w = img_size.w/img_size.cols;  
  //each piece x position
  this.x = img_size.x + img_size.w * this.colidx / img_size.cols;
  //each piece y position
  this.y = img_size.y + img_size.h * this.rowidx / img_size.rows;  
  //each piece random x position
  this.ranx = Math.random() * (cvs.width / scale  - this.w);
  //each piece random y position
  this.rany = Math.random() * (cvs.height / scale - this.h);  
}
//end class piece

//define record object
function record(m_s, name, time){
  this.time = time;
  this.name = name;
  this.milli_secs = m_s;
}
//end class record

function drawRect(){  
  ctx.beginPath();
  for(let i = 0; i < pieces.length; i++){
    let p = pieces[i];
    let t_size = Math.min(p.w, p.h);
    let neck = t_size * 0.1;
    let t_width = t_size * 0.2;
    let t_height = t_size * 0.2;

    //draw image again for actually crop the image
    ctx.drawImage(img,                
      img_size.w * p.colidx / img_size.cols,
      img_size.h * p.rowidx / img_size.rows,
      img_size.w / img_size.cols,
      img_size.h / img_size.rows,
      p.ranx,
      p.rany,
      p.w,
      p.h); 
    
    ctx.strokeStyle = "#333";
    ctx.strokeRect(p.ranx, p.rany, p.w, p.h);
  }
  //end for    
}
//end drawRect

function mDown(event){
  //determine the selected image
  selected = getPiece(event);    
  if (selected){
    let idx = pieces.indexOf(selected);
    if (idx > -1){
      //splice and push back to the array since only the last index of image can be on the top
      pieces.splice(idx,1);
      pieces.push(selected);
    }
    //end if

    //calculate the selected image offset
    selected.offset = {
      x: (event.clientX - cvs_bound.left) - selected.ranx,
      y: (event.clientY - cvs_bound.top) - selected.rany
    }
    //end selected.offset
  }
  //end if
}
//end mDown

function mMove(event){ 
  //move the selected image  
  if (selected){
    selected.ranx = (event.clientX - cvs_bound.left) - selected.offset.x;
    selected.rany = (event.clientY - cvs_bound.top) - selected.offset.y;    
  }
  //end if
}
//end mMove

function mUp(){
  if(selected){    
    if(isClose(selected)){
      //auto fit when image is in the range
      snapIn(selected);
    }
    //end if
    selected = null;
  }
  //end if 
}
//end mUp

function getPiece(m_loca){
  //get the mouse location
  let loc_x = m_loca.clientX - cvs_bound.left;
  let loc_y = m_loca.clientY - cvs_bound.top;

  for(let i = pieces.length -1; i > -1; i--){
    let p = pieces[i];
    //check the click is in the croped image range
    //check mouse within the image width             
    let in_width = loc_x > p.ranx && loc_x < p.ranx + p.w ? true : false; 
    let in_height = loc_y > p.rany && loc_y < p.rany + p.h ? true : false;  
    //return the piece if within the range  
    if(in_width && in_height){
      return p;
    }
    //end if
  }
  //end for
}
//end getPiece

function isClose(p){
  //calculate the distance of 2 points
  let d = getDistance({x:p.ranx, y:p.rany}, {x:p.x, y:p.y});
  //return true if image is in the auto fit range   
  if( d < p.w/30){
    return true;
  }
  return false;
}
//end isClose

function getDistance(point1, point2) {
  //Pythagorean theorem to get the distance
  let x = point1.x - point2.x;
  let y = point1.y - point2.y;  
  return Math.sqrt(x*x + y*y);
}
//end getDistance

function snapIn(p){
  p.ranx = p.x;
  p.rany = p.y;  
}
//end snapIn

function showTime(){
  current_time = new Date().getTime();
  if(start_time){
    //parse the milliseconds
    mi_secs = (current_time - start_time) / 1000;
    let secs = Math.floor(mi_secs % 60);
    let mins = Math.floor((mi_secs % (60 * 60)) / 60);
    let hs = Math.floor((mi_secs % (60 * 60 * 24)) / (60 * 60));
    secs = secs < 10 ? "0" + secs : secs;
    mins = mins < 10 ? "0" + mins : mins;
    hs = hs < 10 ? "0" + hs : hs;
    //update the timer content
    document.getElementById("timer").innerHTML = hs + ":" + mins + ":" + secs;
  }
  //end if
}
//end showTime

function checkComplete(){
  for (let i = 0 ; i < pieces.length; i++){
    let p = pieces[i]
    //check all the images is in the real position
    if (p.ranx != p.x || p.rany != p.y){
      return false;
    }
  }
  return true;
}
//end checkComplete

function showPanelAndRecords() {  
  document.querySelector("#overlay").style.display = "block";
  let panel = document.querySelector("#overlay table");
  let time = document.getElementById("timer").innerText;
  if (records[current_img]){
    let tar_record = records[current_img][difficulty];
    if(tar_record){
      record_exist = true;
      //display in table
      showRecord(panel, tar_record);   
    } 
    //end if
  }
  //end if

  //display in table
  document.querySelector("#end_menu p").innerHTML += time;  
}
//end showPanelAndRecords

function showRecord(table, rec){
  table.innerHTML = "<tr><th>No.</th><th>Name</th><th>Time</th></tr>";
  let c = rec.length > 5 ? 6 : rec.length;
  for (let i = 0; i < c; i++){
    table.innerHTML += "<tr>"+
                          "<td>" + (i+1) + "</td>"+
                          "<td>" + rec[i].name + "</td>"+
                          "<td>" + rec[i].time + "</td>"+
                        "</tr>";
  }
  //end for
}
//end showRecord