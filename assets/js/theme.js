var enemyStreamline;
var enemyStreamFreq = 100; 
var questionFreq = 5000; 
var spawnRate = 1;
var isSpawning = false;
var enemyPool = new Array();
var enemyCurvePool = new Array();
var mouseX = 0, mouseY = 0;
var g_agent; 
var enemyTally = {"NWB":0, "SBQ":0, "BWG":0, "SWP":0, "SCO":0, "Q":0};


function gameStart(){
    startTimer();
    enemyGenerate();
    playMusic();
	g_agent.el.fillStyle = "yellow";
	g_agent.el.fillRect(0, 0, 30, 30);
}

function gameOver(){
    isSpawning = false;
    pauseTimer();
    canvas.Sound.stop("soundTrack");
    $("#startbutton").html("RETRY");
    $("#startbutton").fadeIn("slow");
}
var canvas = CE.defines("gameFrame").
    extend(Input).
    extend(Hit).
	ready(function() {
		canvas.Scene.call("gameScene");
});	

canvas.Scene.new({
    name: "gameScene",
    materials: {

		sounds: {
		    soundTrack: "../assets/audio/SoundtrackGLHF.mp3"
		}
	},
	called: function(stage) { 
		$("#gameFrame").height($(window).height()).width($(window).width());
	},/*
	preload: function(stage, pourcent, material){
		
	},*/
	ready: function(stage) {
	    var con = this;
	    var thisCanvas = this.getCanvas();
	    
		function addEntities(x, y, self, type) {
		    
	        var entity = Class.New("Entity", [stage]);
	        entity.rect(40); // square
	        
	        var entColor = "red";
	        var speed = -1; //default
	        //{"NWB":0, "SBQ":0, "BWG":0, "SWP":0, "SCO":0};
	        switch(type){
	            case "NWB": 
	                entColor = "brown";
	                break;
	            case "SBQ":
	                entColor = "blue";
	                break;
	            case "BWG":
	                entColor = "green";
	                speed = 1;
	                x = 0;
	                break;
	            case "SWP":
	                entColor = "purple";
	                break;
	            case "SCO":
	                entColor = "orange";
	                break;
	            default: 
	                entColor = "white";
	                break;
	        }

	        enemyCurvePool.push([speed, 0]);
	        entity.position(x, y);
	        entity.el = self.createElement(40, 40);
	        entity.el.fillStyle = entColor;
	        entity.el.fillRect(0, 0, 40, 40);
	        entity.el.T = type;

            stage.append(entity.el);
            var speed = Math.floor(Math.random() * 10) + 1;
            enemyPool.push(entity);
	        return entity;
	     }
	     
	     //create agent
	     updateMouse();
	     this.agent = Class.New("Entity", [stage]);
	     this.agent.rect(40); // square
         this.agent.position(mouseX, mouseY);
         this.agent.el = this.createElement(40, 40);
	     this.agent.el.fillStyle = "yellow";
	     this.agent.el.fillRect(0, 0, 0, 0);
	     g_agent = this.agent;
	     stage.append(this.agent.el);
	     
	     for(var i = 0; i < spawnRate; i++){
	        //multi thread
	        var timeout; // current timeout id to clear
            function come(){
                if(isSpawning){
	                var top = Math.floor(Math.random() * $(window).height()) + 0;
    	            var left = $(window).width();
    	            addEntities(left, top, con, "SBQ");
	            }
            };
            function ask(){
                if(isSpawning){
	                var top = Math.floor(Math.random() * $(window).height()) + 0;
    	            var left = $(window).width();
    	            addEntities(left, top, con, "SBQ");
	            }
            };
            (function repeatE() {
                come();
                timeout = setTimeout(repeatE, enemyStreamFreq);
            })();
            
            (function repeatQ() {
                ask();
                timeout = setTimeout(repeatQ, questionFreq);
            })();
	     }
	},
	
	render: function(stage){
	    updateMouse();
        this.agent.position(mouseX, mouseY);
        
        var self = this;
	    //alert(enemyCurvePool.length);
	    for (var i = 0; i < enemyCurvePool.length; i++){
	        
	        var curvePath = Math.floor(Math.random() * 3.14) + 0;
	        var speed = 0.1;
	        var update = curve(enemyCurvePool[i][0], enemyCurvePool[i][1], curvePath, speed, false);
	        alert(enemyPool[i].el.T);
	        switch(enemyPool[i].el.T){
	            case "NWB": 
	                break;
	            case "SBQ":
	                curvePath = 3.1415/2;
	                speed = 1;
	                update = curve(enemyCurvePool[i][0], enemyCurvePool[i][1], curvePath, speed, false);
	                break;
	            case "BWG":
	                speed = 0.1;
	                update = curve(enemyCurvePool[i][0], enemyCurvePool[i][1], curvePath, speed, true);
	                x = 0;
	                break;
	            case "SWP":
	                break;
	            case "SCO":
	                break;
	            default: 
	                break;
	       }
	        
	       
	       
	       enemyCurvePool[i][0] = update[0];
	       enemyCurvePool[i][1] = update[1];
    	   enemyPool[i].move(update[0], update[1]); // x += 5;
    	   enemyPool[i].hit([this.agent], function(state, el) {
               if (state == "over") {
                    self.agent.el.fillStyle = "green";
                    self.agent.el.fillRect(0, 0, 0, 0);
                    enemyTally[el.T]++; //learning
                    gameOver();
                }
           });
    	   //alert(update[0]+","+ update[1]);
    	}
    	
    	stage.refresh();
	}
});

function updateMouse(){
    $(document).mousemove(function(e) {
        mouseX = e.pageX;
        mouseY = e.pageY;
    }).mouseover(); 
}

function curve(x, y, p_curve, rate, reverse){
    var g_track = new Array();
    
    if(!reverse){
        g_track[0] = x - Math.sin(p_curve) * rate;
    }else{
        g_track[0] = x + Math.sin(p_curve) * rate;
    }
    
    if((Math.floor(Math.random() * 2) + 1) > 1){
        g_track[1] = y + Math.cos(p_curve) * rate;
    }else{
        g_track[1] = y - Math.cos(p_curve) * rate;
    }
    
    
    return g_track;
    
}

function enemyGenerate(){
	var randomNum = Math.floor(Math.random()*3) + 1;
	
	if(randomNum == 1){
		spawnRate = 1;
		
	} else if(randomNum == 2){
		spawnRate = 3;
		
	} else {
		spawnRate = 5;
	}
	
	isSpawning = true;
	//Calls spawnAnEnemy, where actual enemies are created
 	for(var i = 0; i < spawnRate; i++){
 	    spawnAnEnemy();
 	}
}


function spawnAnEnemy(){
    var difficulty = 4;
    var randNum = Math.floor(Math.random() * difficulty) + 1;
    
    if (randNum == 1) {
        //Spawn number question
        var a, b, plusMinus, answer;
        var isOneDig = false;
        while (isOneDig == false){
            a = Math.floor(Math.random() * 20) + 1;
            b = Math.floor(Math.random() * 20) + 1;
            plusMinus = Math.floor(Math.random() * 2) + 1;
            if(plusMinus == 1){
                answer = a + b;
                if((a+b) < 9 && (a+b) > 0){
                    isOneDig = true;
                    //CHECK ANSWER
                }
            } else {
                answer = a - b;
                if((a-b) < 9 && (a-b) > 0){
                    isOneDig = true;
                    //CHECK ANSWER
                }
            }
        }
        
    } else if (randNum == 2){
        //Spawn spelling question
        //Make array of words to use, a random integer will be selected for charAt
        var words = ["Estonia", "science", "turtle", "street", "facilitated", "computer", "window", "sleep", "wonder", "restaurant", "accommodate"];
        var chosen = (Math.floor(Math.random() * 10)) + 0;
        var limit = words[chosen].length;
        var character = Math.floor(Math.random() * limit) + 0;
        var answer = chosen[character];
        //STATE QUESTION
        //<h2> ("What is letter number " + character + " in the word " + chosen + "?") </h2> //DOES THIS WORK????
        //CHECK ANSWER, HOW DO YOU COMPARE USER INPUT?
    } else {
        if (enemyStreamFreq > 200) {
            enemyStreamFreq -= 10;
        }
    }
} 





//enemyGenerate();

//timer

var stopwatch;

function startTimer(){
    $('#timer').find('.value').text(0);
    stopwatch = setInterval(updateDisplay, 1);
}

function pauseTimer(){
    clearInterval(stopwatch);
}



function updateDisplay() {
    var value = parseInt($('#timer').find('.value').text(), 10);
    value++;
    $('#timer').find('.value').text(value);
}

function playMusic(){
    canvas.Sound.playLoop("soundTrack");
}
