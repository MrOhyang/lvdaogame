$(function(){

	var can = document.getElementById("can1");
	var can2 = document.getElementById("can2");
	var c = can.getContext("2d");
	var c2 = can2.getContext("2d");

	var w = $("#can1").css("width").replace("px","") - $("#can1").css("border-width").replace("px","") * 2;
	var h = $("#can1").css("height").replace("px","") - $("#can1").css("border-width").replace("px","") * 2;

	var plan_w = 14;
	var plan_h = 30;

	var x = 0;
	var y = 0;

	var score = 0;
	var attact = 800;
	var stone_speed = 3;

	var plan_img = new Image();
	plan_img.src = "./images/plane1.png";

	var plan_bullet = new Image();
	plan_bullet.src = "./images/bullet1.png";

	var stone_img = new Image();
	stone_img.src = "./images/stone1.png";

	// 鼠标移动，计算xy，画出飞机所在位置
	can.onmousemove = function(e){
		x = e.x - $(this).css("margin-left").replace("px","");
		y = e.y - $(this).css("margin-top").replace("px","");
		c.clearRect(0,0,w,h);
		DrawPlane(x,y);
	}

	// Draw plane
	function DrawPlane(x,y){
		c.fillStyle = "#000";
		c.fillRect(x-plan_w/2,y-plan_h/2,plan_w,plan_h);
		c.drawImage(plan_img,x-20,y-17);
	}

	// class Bullet
	function Bullet(){
		this.w = 14;
		this.h = 10;
		this.x = x;
		this.y = y;
		this.speed = 14;
		this.draw = function(){
			c2.drawImage(plan_bullet,this.x-7,this.y);
			this.y -= this.speed;
		}
	}

	// class Stone
	function Stone(){
		this.w = parseInt(Math.random()*80+21);
		this.h = parseInt(Math.random()*80+21);
		this.x = parseInt(Math.random()*(w-this.w)+1);
		this.y = -this.h;
		this.hp = this.w*this.h;
		this.draw = function(){
			c2.fillStyle = "#3F4";
			c2.fillRect(this.x,this.y,this.w,this.h);
			c2.drawImage(stone_img,this.x,this.y,this.w,this.h);
			this.y += stone_speed;
		}
		this.speedup = function(){
			this.speed += 1;
		}
	};

	// 碰撞检测
	function ComputeCrash(arg_x,arg_y,arg_w,arg_h){
		var tf = false;
		for(var i=0;i<arr_stone.length;i++){
			tf = tf || (arg_x>=(arr_stone[i].x-arg_w) && 
						arg_x<=(arr_stone[i].x+arr_stone[i].w) && 
						arg_y>=(arr_stone[i].y-arg_h) && 
						arg_y<=(arr_stone[i].y+arr_stone[i].h));
			if( tf ){
				return i;
			}
		}
		return -1;
		// console.log(tf);
	}

	var arr_stone = [];
	arr_stone.push(new Stone());

	var arr_bullet = [];
	arr_bullet.push(new Bullet());

	// 新增 Bullet
	var onTimer3 = setInterval(function(){
		arr_bullet.push(new Bullet());
	},200);

	var times1 = 2000;

	// 新增 Stone
	var onTimer1 = setInterval(function(){
		arr_stone.push(new Stone());
	},times1);

	// Stone.speed up
	var onTimer4 = setInterval(function(){
		stone_speed++;
		times1 *= 0.5;
	},4000);
	
	// Stone 下降，调用碰撞检测
	var onTimer2 = setInterval(function(){
		c2.clearRect(0,0,w,h);
		// Draw arr_stone
		for(var i=0;i<arr_stone.length;i++){
			if( arr_stone[i].y>h || arr_stone[i].hp<=0 ){
				if( arr_stone[i].hp<=0 ){
					score += parseInt((arr_stone[i].w*arr_stone[i].h)*0.2);
				}
				arr_stone.splice(i,1);
				i--;
				continue;
			}
			arr_stone[i].draw();
		}
		// Draw Bullet
		for(var i=0;i<arr_bullet.length;i++){
			var innum = ComputeCrash(arr_bullet[i].x,arr_bullet[i].y,arr_bullet[i].w,arr_bullet[i].h);
			if( arr_bullet[i].y<(-5) || innum!=-1 )
			{
				arr_bullet.splice(i,1);
				i--;
				if( innum!=-1 ){
					arr_stone[innum].hp -= attact;
				}
				continue;
			}
			arr_bullet[i].draw();
		}
		c2.beginPath();
		c2.font = "12px Arial";
		c2.textAlign = "left";
		c2.fillStyle = "#FFF";
		c2.textBaseline = "top";
		c2.fillText("得分:"+score,10,10);
		// test Plan Crash is true => Game over
		if( ComputeCrash(x,y,plan_w,plan_h)!=-1 ){
			clearInterval(onTimer1);
			clearInterval(onTimer2);
			clearInterval(onTimer3);
			can.onmousemove = null;
			// alert("Game Over");
			c2.font = "62px Arial";
			c2.fillStyle = "#999";
			c2.textAlign = "center";
			c2.textBaseline = "middle";
			c2.fillText("Game Over",w/2,h/2);
		}
	},33);

})