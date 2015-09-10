$(function(){

	var cantop1 = document.getElementById("cantop1");
	var cantop2 = document.getElementById("cantop2");
	var cantop3 = document.getElementById("cantop3");
	var cantop4 = document.getElementById("cantop4");
	var c1 = cantop1.getContext("2d");
	var c2 = cantop2.getContext("2d");
	var c3 = cantop3.getContext("2d");
	var c4 = cantop4.getContext("2d");
	var w = cantop1.width;
	var h = cantop1.height;
	var x = w/2,y = 0;
	var score = 0;
	var bullet_speed = 16;

	var hero = {
		x : w/2,
		y : h/2,
		w : 24,
		h : 44,
		r : 0,
		attack : 10,
		money : 0,
		img : new Image(),
		compute_r : function(arg1,arg2){
			var dif_x = arg1 - this.x;
			var dif_y = arg2 - this.y;
			this.r = parseInt( 360*Math.atan(dif_y/dif_x)/(2*Math.PI)+90 );
			if( dif_x<0 ){
				this.r += 180;
			}
		}
	}
	hero.img.src = "./images/hero.png";

	var bullet_img = new Image();
	bullet_img.src = "./images/bullet.png";

	var monster_img_left = new Image();
	monster_img_left.src = "./images/monster_left.png";
	var monster_img_right = new Image();
	monster_img_right.src = "./images/monster_right.png";

	// class Bullet
	function Bullet(){
		this.w = 3;
		this.h = 10;
		this.x = hero.x;
		this.y = hero.y;
		this.r = hero.r;
		this.x_step = 0;
		this.y_step = 0;
		this.compute_step = function(arg){
			var dif_x = x - this.x;
			var dif_y = y - this.y;
			var c = Math.sqrt(dif_x*dif_x+dif_y*dif_y);
			this.x_step = parseInt(dif_x * arg / c);
			this.y_step = parseInt(dif_y * arg / c);
		}
		this.draw = function(){
			c2.translate(this.x,this.y);
			c2.rotate((this.r)*Math.PI/180);
			c2.drawImage(bullet_img,-this.w/2,-this.h/2);
			c2.rotate((-this.r)*Math.PI/180);
			c2.translate(-this.x,-this.y);
			this.x += this.x_step;
			this.y += this.y_step;
		}
	}

	var hard = 0.01;

	// class monster
	function Monster(){
		this.w = parseInt(Math.random()*80+21),
		this.h = parseInt(Math.random()*80+21),
		this.x = 0,
		this.y = 0,
		this.hp = this.w*this.h*hard,
		this.hp_max = this.w*this.h*hard,
		this.x_step = 0,
		this.y_step = 0,
		this.pointer = 0,	// 0 代表左，1代表右
		this.compute_xy = function(){
			switch( parseInt(Math.random()*4) ){
			case 0:
				this.x = Math.random()*(w-this.w)+1;
				this.y = -this.h;
				break;
			case 1:
				this.x = w+this.w;
				this.y = Math.random()*(h-this.h)+1;
				break;
			case 2:
				this.x = Math.random()*(w-this.w)+1;
				this.y = h+this.h;
				break;
			case 3:
				this.x = -this.w;
				this.y = Math.random()*(h-this.h)+1;
				break;
			default :
				break;
			}
		},
		this.compute_step = function(){
			var dif_x = hero.x - this.x;
			var dif_y = hero.y - this.y;
			// console.log(Math.abs(dif_x),Math.abs(dif_y));
			if( Math.abs(dif_x) > Math.abs(dif_y) ){
				if( dif_x < 0 ){
					this.x_step = -2;
					this.y_step = 0;
				}else{
					this.x_step = 2;
					this.y_step = 0;
				}
			}else{
				if( dif_y < 0 ){
					this.y_step = -2;
					this.x_step = 0;
				}else{
					this.y_step = 2;
					this.x_step = 0;
				}
			}
		},
		this.draw = function(){
			// console.log(this.x_step,this.y_step);
			var dif_x = this.x - hero.x;
			if( dif_x < 0 ){
				c2.drawImage(monster_img_right,this.x,this.y,this.w,this.h);
			}else{
				c2.drawImage(monster_img_left,this.x,this.y,this.w,this.h);
			}
			this.x += this.x_step;
			this.y += this.y_step;
		}
	}

	var arr_bullet = [];

	// 画出 obj
	function Draw(obj){
		if(obj.img.complete){
			c1.translate(obj.x,obj.y);
			c1.rotate((obj.r)*Math.PI/180);
			c1.drawImage(obj.img,-obj.w/2,-obj.h/2);
			c1.rotate((0-obj.r)*Math.PI/180);
			c1.translate(-obj.x,-obj.y);
		}else{
			obj.img.onload = function(){
				c1.translate(obj.x,obj.y);
				c1.rotate((obj.r)*Math.PI/180);
				c1.drawImage(obj.img,-obj.w/2,-obj.h/2);
				c1.rotate((0-obj.r)*Math.PI/180);
				c1.translate(-obj.x,-obj.y);
			}
		}
	}

	// 碰撞检测
	function ComputeCrash(arg_x,arg_y,arg_w,arg_h){
		var tf = false;
		for(var i=0;i<arr_monster.length;i++){
			tf = tf || (arg_x>=(arr_monster[i].x-arg_w) && 
						arg_x<=(arr_monster[i].x+arr_monster[i].w) && 
						arg_y>=(arr_monster[i].y-arg_h) && 
						arg_y<=(arr_monster[i].y+arr_monster[i].h));
			if( tf ){
				return i;
			}
		}
		return -1;
		// console.log(tf);
	}

	// 鼠标移动重新计算 hero.r
	cantop1.onmousemove = function(e){
		x = e.x - $("#f_div").css("margin-left").substring(0,$("#f_div").css("margin-left").length-2) - 2;
		y = e.y - $("#f_div").css("margin-top").substring(0,$("#f_div").css("margin-top").length-2) - 2;;
		hero.compute_r(x,y);
	}

	var arr_key = [true,true,true,true];
	var moveStep = 0;

	// 按键按下
	document.getElementsByTagName("body")[0].onkeypress = function(){
		// console.log(window.event);
		moveStep = window.event.keyCode;
		switch(moveStep){
		case 119:
			arr_key[0] = false;
			break;
		case 115:
			arr_key[1] = false;
			break;
		case 97:
			arr_key[2] = false;
			break;
		case 100:
			arr_key[3] = false;
			break;
		default :
			break;
		}
	}

	// 按键释放
	document.getElementsByTagName("body")[0].onkeyup = function(){
		// console.log(window.event);
		switch(window.event.keyCode){
		case 87:
			arr_key[0] = true;
			break;
		case 83:
			arr_key[1] = true;
			break;
		case 65:
			arr_key[2] = true;
			break;
		case 68:
			arr_key[3] = true;
			break;
		default :
			break;
		}
		if( arr_key[0] && arr_key[1] && arr_key[2] && arr_key[3] ){
			moveStep = 0;
		}else{
			if(arr_key[0]==false)
				moveStep = 119;
			if(arr_key[1]==false)
				moveStep = 115;
			if(arr_key[2]==false)
				moveStep = 97;
			if(arr_key[3]==false)
				moveStep = 100;
		}
	}

	// 鼠标点击 开火
	cantop1.onclick = function(){
		var temp = new Bullet();
		temp.compute_step(bullet_speed);
		arr_bullet.push(temp);
	}

	// skill up
	$("#table1").find("input").eq(0).click(function(){
		var cost = parseInt( $(this).parent().next().next().text() );
		console.log(cost);
		if( hero.money > cost ){
			hero.attack += 4;
			hero.money -= cost;
		}else{
			c4.beginPath();
			c4.font = "12px Arial";
			c4.textAlign = "left";
			c4.fillStyle = "#00F";
			c4.textBaseline = "bottom";
			c4.fillText("钱不够啊...",10,h-10);
			setTimeout(function(){
				c4.clearRect(0,0,w,h);
			},2000);
		}
	});
	$("#table1").find("input").eq(1).click(function(){
		var cost = parseInt( $(this).parent().next().next().text() );
		console.log(cost);
		if( hero.money > cost ){
			bullet_speed += 4;
			hero.money -= cost;
		}else{
			c4.beginPath();
			c4.font = "12px Arial";
			c4.textAlign = "left";
			c4.fillStyle = "#00F";
			c4.textBaseline = "bottom";
			c4.fillText("钱不够啊...",10,h-10);
			setTimeout(function(){
				c4.clearRect(0,0,w,h);
			},2000);
		}
	});

	// 重绘 hero，得分
	var onTimer1 = setInterval(function(){
		c1.clearRect(0,0,w,h);
		LineX();
		Draw(hero);

		c1.beginPath();
		c1.font = "12px Arial";
		c1.textAlign = "left";
		c1.fillStyle = "#FFF";
		c1.textBaseline = "top";
		c1.fillText("得分:"+score,10,10);

		c1.beginPath();
		c1.font = "12px Arial";
		c1.textAlign = "left";
		c1.fillStyle = "#FFF";
		c1.textBaseline = "top";
		c1.fillText("hard:level "+parseInt(hard*100),10,30);

		c1.beginPath();
		c1.font = "12px Arial";
		c1.textAlign = "left";
		c1.fillStyle = "#FFF";
		c1.textBaseline = "top";
		c1.fillText("attack:"+parseInt(hero.attack),10,50);

		c1.beginPath();
		c1.font = "12px Arial";
		c1.textAlign = "left";
		c1.fillStyle = "#FFF";
		c1.textBaseline = "top";
		c1.fillText("money:"+parseInt(hero.money),10,70);


	},40);

	// 移动 hero
	var onTimer2 = setInterval(function(){
		var step = 7;
		switch(moveStep){
		case 119:
			if( hero.y>24 )
				hero.y -= step;
			break;
		case 115:
			if( hero.y<(h-16) )
				hero.y += step;
			break;
		case 97:
			if( hero.x>24 )
				hero.x -= step;
			break;
		case 100:
			if( hero.x<(w-16) )
				hero.x += step;
			break;
		default :
			break;
		}
	},40);

	// 重绘子弹，重绘怪物
	var onTimer3 = setInterval(function(){
		c2.clearRect(0,0,w,h);
		var innum = -1;
		for(var i=0;i<arr_bullet.length;i++){
			// 子弹超出外围消失
			if( !(arr_bullet[i].x>0 && arr_bullet[i].x<w && arr_bullet[i].y>0 && arr_bullet[i].y<h) ){
				arr_bullet.splice(i,1);
				i--;
				continue;
			}
			innum = ComputeCrash(arr_bullet[i].x,arr_bullet[i].y,arr_bullet[i].w,arr_bullet[i].h);
			if( innum != -1 ){
				arr_monster[innum].hp -= hero.attack;
				// 怪物血量低于 0 消失
				if(arr_monster[innum].hp <= 0){
					score += parseInt(arr_monster[innum].hp_max);
					hero.money += 10*parseInt(hard*100);
					arr_monster.splice(innum,1);
				}
				arr_bullet.splice(i,1);
				i--;
				continue;
				// console.log("Crash");
			}
			arr_bullet[i].draw();
		}
		// 绘制怪物
		c3.clearRect(0,0,w,h);
		for(var i=0;i<arr_monster.length;i++){
			arr_monster[i].draw();
			arr_monster[i].compute_step();
			if( ComputeCrash(hero.x-hero.w/2,hero.y-hero.h/2,hero.w,hero.h)!=-1 ){
				clearInterval(onTimer1);
				clearInterval(onTimer2);
				clearInterval(onTimer3);
				clearInterval(onTimer4);
				clearInterval(onTimer5);
				c1.font = "62px Arial";
				c1.fillStyle = "#FFF";
				c1.textAlign = "center";
				c1.textBaseline = "middle";
				c1.fillText("Game Over",w/2,h/2);
			}
		}
	},40);

	var arr_monster = [];

	// 新增怪物
	var onTimer4 = setInterval(function(){
		var temp = new Monster();
		temp.compute_xy();
		temp.compute_step();
		arr_monster.push(temp);
		// console.log(temp);
		// console.log(arr_monster.length);
	},2000);

	var onTimer5 = setInterval(function(){
		hard += 0.01;
	},5000);

	// 辅助线
	function LineX(){
		// c1.beginPath();
		// c1.strokeStyle = "#000";
		// c1.strokeRect(-0.5,-0.5,w/2+1,h/2+1);
		// c1.beginPath();
		// c1.strokeRect(w/2+0.5,h/2+0.5,w/2,h/2);
	}

	// console.log(hero);
	
})